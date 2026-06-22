package org.pingpongapp.pingsmartclubwebboot.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("psc_student")
public class Student {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String gender;
    private Integer age;
    private String phone;
    private String level;
    private String remark;
    private String parentName;
    private String parentPhone;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
