package org.pingpongapp.pingsmartclubwebboot.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("psc_user")
public class AppUser {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String username;
    private String phone;
    private String password;
    private String role;
    private Long relatedId;
    private String displayName;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
