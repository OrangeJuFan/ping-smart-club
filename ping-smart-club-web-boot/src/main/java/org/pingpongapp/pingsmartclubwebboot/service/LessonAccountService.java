package org.pingpongapp.pingsmartclubwebboot.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.pingpongapp.pingsmartclubwebboot.auth.AuthContext;
import org.pingpongapp.pingsmartclubwebboot.auth.AuthUser;
import org.pingpongapp.pingsmartclubwebboot.common.BusinessException;
import org.pingpongapp.pingsmartclubwebboot.common.ErrorCode;
import org.pingpongapp.pingsmartclubwebboot.mapper.LessonAccountMapper;
import org.pingpongapp.pingsmartclubwebboot.mapper.LessonTransactionMapper;
import org.pingpongapp.pingsmartclubwebboot.pojo.LessonAccount;
import org.pingpongapp.pingsmartclubwebboot.pojo.LessonTransaction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class LessonAccountService {

    private final LessonAccountMapper lessonAccountMapper;
    private final LessonTransactionMapper lessonTransactionMapper;

    public LessonAccountService(LessonAccountMapper lessonAccountMapper, LessonTransactionMapper lessonTransactionMapper) {
        this.lessonAccountMapper = lessonAccountMapper;
        this.lessonTransactionMapper = lessonTransactionMapper;
    }

    public LessonAccount ensureAccount(Long studentId) {
        LessonAccount account = lessonAccountMapper.selectOne(new LambdaQueryWrapper<LessonAccount>()
            .eq(LessonAccount::getStudentId, studentId));
        if (account != null) {
            return account;
        }
        LessonAccount newAccount = new LessonAccount();
        newAccount.setStudentId(studentId);
        newAccount.setBalance(0);
        newAccount.setTotalPurchased(0);
        newAccount.setTotalConsumed(0);
        newAccount.setVersion(0);
        lessonAccountMapper.insert(newAccount);
        return newAccount;
    }

    public LessonAccount getByStudentId(Long studentId) {
        return ensureAccount(studentId);
    }

    public List<LessonTransaction> listTransactions(Long studentId) {
        return lessonTransactionMapper.selectList(new LambdaQueryWrapper<LessonTransaction>()
            .eq(LessonTransaction::getStudentId, studentId)
            .orderByDesc(LessonTransaction::getId));
    }

    @Transactional
    public LessonAccount adjust(Long studentId, Integer changeHours, String transactionType, String remark) {
        if (changeHours == null || changeHours == 0) {
            throw BusinessException.badRequest("课时变动数不能为空");
        }
        LessonAccount account = getAccountForUpdate(studentId);
        int nextBalance = account.getBalance() + changeHours;
        if (nextBalance < 0) {
            throw BusinessException.of(ErrorCode.LESSON_BALANCE_NOT_ENOUGH);
        }
        account.setBalance(nextBalance);
        if ("PURCHASE".equals(transactionType)) {
            account.setTotalPurchased(account.getTotalPurchased() + changeHours);
        } else if ("CONSUME".equals(transactionType)) {
            account.setTotalConsumed(account.getTotalConsumed() + Math.abs(changeHours));
        }
        lessonAccountMapper.updateById(account);
        String type = transactionType == null ? "ADJUST" : transactionType;
        saveTransaction(studentId, null, type + ":" + studentId + ":" + UUID.randomUUID(), type, changeHours, nextBalance, remark);
        return account;
    }

    @Transactional
    public void consume(Long studentId, Long bookingId, Integer lessonCount, String remark) {
        if (lessonCount == null || lessonCount <= 0) {
            throw BusinessException.badRequest("消耗课时数必须大于 0");
        }
        String bizNo = "CONSUME:BOOKING:" + bookingId;
        if (hasTransaction(bizNo)) {
            throw BusinessException.of(ErrorCode.LESSON_TRANSACTION_DUPLICATE);
        }
        LessonAccount account = getAccountForUpdate(studentId);
        if (account.getBalance() < lessonCount) {
            throw BusinessException.of(ErrorCode.LESSON_BALANCE_NOT_ENOUGH);
        }
        account.setBalance(account.getBalance() - lessonCount);
        account.setTotalConsumed(account.getTotalConsumed() + lessonCount);
        lessonAccountMapper.updateById(account);
        saveTransaction(studentId, bookingId, bizNo, "CONSUME", -lessonCount, account.getBalance(), remark);
    }

    public void assertEnough(Long studentId, Integer lessonCount) {
        LessonAccount account = ensureAccount(studentId);
        if (account.getBalance() < lessonCount) {
            throw BusinessException.of(ErrorCode.LESSON_BALANCE_NOT_ENOUGH, "课时余额不足，禁止预约");
        }
    }

    private LessonAccount getAccountForUpdate(Long studentId) {
        ensureAccount(studentId);
        LessonAccount account = lessonAccountMapper.selectByStudentIdForUpdate(studentId);
        if (account == null) {
            throw BusinessException.notFound("课时账户不存在");
        }
        return account;
    }

    private boolean hasTransaction(String bizNo) {
        Long count = lessonTransactionMapper.selectCount(new LambdaQueryWrapper<LessonTransaction>()
            .eq(LessonTransaction::getBizNo, bizNo));
        return count > 0;
    }

    private void saveTransaction(Long studentId,
                                 Long bookingId,
                                 String bizNo,
                                 String transactionType,
                                 Integer changeHours,
                                 Integer balanceAfter,
                                 String remark) {
        AuthUser operator = null;
        try {
            operator = AuthContext.getUser();
        } catch (BusinessException ignored) {
            // SQL 初始化或内部任务可能没有登录上下文。
        }
        LessonTransaction transaction = new LessonTransaction();
        transaction.setBizNo(bizNo);
        transaction.setStudentId(studentId);
        transaction.setBookingId(bookingId);
        transaction.setTransactionType(transactionType);
        transaction.setChangeHours(changeHours);
        transaction.setBalanceAfter(balanceAfter);
        transaction.setOperatorRole(operator == null ? "SYSTEM" : operator.getRole().name());
        transaction.setOperatorId(operator == null ? null : operator.getUserId());
        transaction.setRemark(remark);
        lessonTransactionMapper.insert(transaction);
    }
}
