package org.pingpongapp.pingsmartclubwebboot.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("psc_coach_availability")
public class CoachAvailability {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long coachId;
    private Integer weekDay;
    private String startTime;
    private String endTime;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
