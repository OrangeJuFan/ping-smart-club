package org.pingpongapp.pingsmartclubwebboot.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("psc_waitlist_entry")
public class WaitlistEntry {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long scheduleId;
    private Long studentId;
    private Integer queueNo;
    private String status;
    private LocalDateTime joinedAt;
    private LocalDateTime promotedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
