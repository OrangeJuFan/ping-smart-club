package org.pingpongapp.pingsmartclubwebboot.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("psc_lesson_account")
public class LessonAccount {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long studentId;
    private Integer balance;
    private Integer totalPurchased;
    private Integer totalConsumed;
    private Integer version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
