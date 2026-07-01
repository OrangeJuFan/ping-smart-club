package org.pingpongapp.pingsmartclubwebboot.pojo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("psc_auth_session")
public class AuthSession {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String tokenHash;
    private Long userId;
    private String username;
    private String displayName;
    private String role;
    private Long relatedId;
    private String status;
    private LocalDateTime expireAt;
    private LocalDateTime revokedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
