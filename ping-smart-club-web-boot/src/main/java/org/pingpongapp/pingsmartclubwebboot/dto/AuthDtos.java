package org.pingpongapp.pingsmartclubwebboot.dto;

import org.pingpongapp.pingsmartclubwebboot.auth.AuthRole;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record LoginRequest(String username, String phone, String password) {
    }

    public record LoginResponse(String token, Long userId, AuthRole role, Long relatedId, String displayName) {
    }
}
