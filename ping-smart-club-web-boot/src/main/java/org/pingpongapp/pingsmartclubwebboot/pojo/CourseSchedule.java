package org.pingpongapp.pingsmartclubwebboot.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("psc_course_schedule")
public class CourseSchedule {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long courseProductId;
    private String courseProductName;
    private Long coachId;
    private String coachName;
    private Long venueId;
    private String venueName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer capacity;
    private String status;
    private String remark;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
