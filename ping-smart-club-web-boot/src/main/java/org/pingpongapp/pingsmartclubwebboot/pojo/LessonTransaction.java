package org.pingpongapp.pingsmartclubwebboot.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("psc_lesson_transaction")
public class LessonTransaction {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long studentId;
    private Long bookingId;
    private String transactionType;
    private Integer changeHours;
    private Integer balanceAfter;
    private String operatorRole;
    private Long operatorId;
    private String remark;
    private LocalDateTime createdAt;
}
