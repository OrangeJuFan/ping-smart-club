package org.pingpongapp.pingsmartclubwebboot.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.pingpongapp.pingsmartclubwebboot.common.BusinessException;
import org.pingpongapp.pingsmartclubwebboot.mapper.NotificationRecordMapper;
import org.pingpongapp.pingsmartclubwebboot.pojo.NotificationRecord;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRecordMapper notificationRecordMapper;

    public NotificationService(NotificationRecordMapper notificationRecordMapper) {
        this.notificationRecordMapper = notificationRecordMapper;
    }

    public NotificationRecord create(NotificationRecord record) {
        if (!StringUtils.hasText(record.getChannel())) {
            record.setChannel("IN_APP");
        }
        if (!StringUtils.hasText(record.getStatus())) {
            record.setStatus("PENDING");
        }
        if (record.getScheduledAt() == null) {
            record.setScheduledAt(LocalDateTime.now());
        }
        notificationRecordMapper.insert(record);
        return record;
    }

    public NotificationRecord createSystemNotification(String type, String receiverType, Long receiverId, String title, String content) {
        NotificationRecord record = new NotificationRecord();
        record.setNotificationType(type);
        record.setReceiverType(receiverType);
        record.setReceiverId(receiverId);
        record.setTitle(title);
        record.setContent(content);
        return create(record);
    }

    public List<NotificationRecord> list(String receiverType, Long receiverId, String status) {
        return notificationRecordMapper.selectList(new LambdaQueryWrapper<NotificationRecord>()
            .eq(StringUtils.hasText(receiverType), NotificationRecord::getReceiverType, receiverType)
            .eq(receiverId != null, NotificationRecord::getReceiverId, receiverId)
            .eq(StringUtils.hasText(status), NotificationRecord::getStatus, status)
            .orderByDesc(NotificationRecord::getId));
    }

    public NotificationRecord markSent(Long id) {
        NotificationRecord record = notificationRecordMapper.selectById(id);
        if (record == null) {
            throw BusinessException.notFound("通知记录不存在");
        }
        record.setStatus("SENT");
        record.setSentAt(LocalDateTime.now());
        notificationRecordMapper.updateById(record);
        return record;
    }
}
