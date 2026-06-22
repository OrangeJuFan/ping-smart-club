package org.pingpongapp.pingsmartclubwebboot.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthUser {

    private Long userId;
    private String username;
    private String displayName;
    private AuthRole role;
    private Long relatedId;
}
