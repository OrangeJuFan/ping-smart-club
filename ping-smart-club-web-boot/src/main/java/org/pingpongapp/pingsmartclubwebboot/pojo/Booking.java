package org.pingpongapp.pingsmartclubwebboot.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("psc_booking")
public class Booking {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long scheduleId;
    private Long studentId;
    private String status;
    private String source;
    private String cancelReason;
    private String remark;
    private LocalDateTime bookedAt;
    private LocalDateTime canceledAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
