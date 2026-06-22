package org.pingpongapp.pingsmartclubwebboot.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("psc_notification_record")
public class NotificationRecord {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String notificationType;
    private String receiverType;
    private Long receiverId;
    private String title;
    private String content;
    private String channel;
    private String status;
    private LocalDateTime scheduledAt;
    private LocalDateTime sentAt;
    private String failReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
