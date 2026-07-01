package org.pingpongapp.pingsmartclubwebboot.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.pingpongapp.pingsmartclubwebboot.auth.AuthRole;
import org.pingpongapp.pingsmartclubwebboot.auth.AuthUser;
import org.pingpongapp.pingsmartclubwebboot.auth.PasswordService;
import org.pingpongapp.pingsmartclubwebboot.auth.TokenStore;
import org.pingpongapp.pingsmartclubwebboot.common.BusinessException;
import org.pingpongapp.pingsmartclubwebboot.common.ErrorCode;
import org.pingpongapp.pingsmartclubwebboot.dto.AuthDtos;
import org.pingpongapp.pingsmartclubwebboot.mapper.AppUserMapper;
import org.pingpongapp.pingsmartclubwebboot.pojo.AppUser;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class AuthService {

    private final AppUserMapper appUserMapper;
    private final TokenStore tokenStore;
    private final PasswordService passwordService;

    public AuthService(AppUserMapper appUserMapper, TokenStore tokenStore, PasswordService passwordService) {
        this.appUserMapper = appUserMapper;
        this.tokenStore = tokenStore;
        this.passwordService = passwordService;
    }

    public AuthDtos.LoginResponse login(AuthDtos.LoginRequest request, AuthRole role) {
        if (!StringUtils.hasText(request.password())) {
            throw BusinessException.badRequest("密码不能为空");
        }
        LambdaQueryWrapper<AppUser> wrapper = new LambdaQueryWrapper<AppUser>()
            .eq(AppUser::getRole, role.name())
            .eq(AppUser::getStatus, "ACTIVE");
        if (StringUtils.hasText(request.username())) {
            wrapper.eq(AppUser::getUsername, request.username());
        } else if (StringUtils.hasText(request.phone())) {
            wrapper.eq(AppUser::getPhone, request.phone());
        } else {
            throw BusinessException.badRequest("账号或手机号不能为空");
        }
        AppUser user = appUserMapper.selectOne(wrapper);
        if (user == null || !passwordService.matches(request.password(), user.getPassword())) {
            throw BusinessException.of(ErrorCode.AUTH_INVALID_CREDENTIALS);
        }
        if (passwordService.needsMigration(user.getPassword())) {
            user.setPassword(passwordService.encode(request.password()));
            appUserMapper.updateById(user);
        }
        AuthUser authUser = new AuthUser(user.getId(), user.getUsername(), user.getDisplayName(), role, user.getRelatedId());
        String token = tokenStore.issue(authUser);
        return new AuthDtos.LoginResponse(token, user.getId(), role, user.getRelatedId(), user.getDisplayName());
    }

    public void logout(String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            tokenStore.revoke(authorization.substring("Bearer ".length()).trim());
        }
    }
}
