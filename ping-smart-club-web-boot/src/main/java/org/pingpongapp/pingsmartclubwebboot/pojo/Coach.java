package org.pingpongapp.pingsmartclubwebboot.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("psc_coach")
public class Coach {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String phone;
    private String qualification;
    private String courseTypes;
    private String levels;
    private String profile;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
