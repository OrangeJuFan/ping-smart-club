package org.pingpongapp.pingsmartclubwebboot.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("psc_course_product")
public class CourseProduct {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private Long courseTypeId;
    private Integer lessonCount;
    private BigDecimal price;
    private Integer bookableCapacity;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
