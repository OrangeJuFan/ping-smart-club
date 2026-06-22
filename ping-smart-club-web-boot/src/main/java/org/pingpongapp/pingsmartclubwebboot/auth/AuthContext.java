package org.pingpongapp.pingsmartclubwebboot.auth;

import org.pingpongapp.pingsmartclubwebboot.common.BusinessException;

public final class AuthContext {

    private static final ThreadLocal<AuthUser> CURRENT_USER = new ThreadLocal<>();

    private AuthContext() {
    }

    public static void setUser(AuthUser user) {
        CURRENT_USER.set(user);
    }

    public static AuthUser getUser() {
        AuthUser user = CURRENT_USER.get();
        if (user == null) {
            throw BusinessException.unauthorized("请先登录");
        }
        return user;
    }

    public static void clear() {
        CURRENT_USER.remove();
    }
}
