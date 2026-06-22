package org.pingpongapp.pingsmartclubwebboot.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("psc_attendance_record")
public class AttendanceRecord {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long scheduleId;
    private Long bookingId;
    private String personType;
    private Long personId;
    private String status;
    private String checkInMethod;
    private String checkInLocation;
    private String deviceInfo;
    private String faceCheckResult;
    private LocalDateTime checkInTime;
    private LocalDateTime confirmedAt;
    private String remark;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
