package org.pingpongapp.pingsmartclubwebboot.auth;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.pingpongapp.pingsmartclubwebboot.mapper.AuthSessionMapper;
import org.pingpongapp.pingsmartclubwebboot.pojo.AuthSession;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Component
public class TokenStore {

    private static final long EXPIRE_HOURS = 168L;
    private static final int TOKEN_BYTES = 32;

    private final SecureRandom secureRandom = new SecureRandom();
    private final AuthSessionMapper authSessionMapper;

    public TokenStore(AuthSessionMapper authSessionMapper) {
        this.authSessionMapper = authSessionMapper;
    }

    public String issue(AuthUser user) {
        String token = generateToken();
        AuthSession session = new AuthSession();
        session.setTokenHash(digest(token));
        session.setUserId(user.getUserId());
        session.setUsername(user.getUsername());
        session.setDisplayName(user.getDisplayName());
        session.setRole(user.getRole().name());
        session.setRelatedId(user.getRelatedId());
        session.setStatus("ACTIVE");
        session.setExpireAt(LocalDateTime.now().plusHours(EXPIRE_HOURS));
        authSessionMapper.insert(session);
        return token;
    }

    public Optional<AuthUser> resolve(String token) {
        AuthSession session = authSessionMapper.selectOne(new LambdaQueryWrapper<AuthSession>()
            .eq(AuthSession::getTokenHash, digest(token))
            .eq(AuthSession::getStatus, "ACTIVE")
            .isNull(AuthSession::getRevokedAt)
            .last("limit 1"));
        if (session == null) {
            return Optional.empty();
        }
        if (session.getExpireAt().isBefore(LocalDateTime.now())) {
            session.setStatus("EXPIRED");
            authSessionMapper.updateById(session);
            return Optional.empty();
        }
        return Optional.of(new AuthUser(
            session.getUserId(),
            session.getUsername(),
            session.getDisplayName(),
            AuthRole.valueOf(session.getRole()),
            session.getRelatedId()
        ));
    }

    public void revoke(String token) {
        AuthSession session = authSessionMapper.selectOne(new LambdaQueryWrapper<AuthSession>()
            .eq(AuthSession::getTokenHash, digest(token))
            .eq(AuthSession::getStatus, "ACTIVE")
            .last("limit 1"));
        if (session != null) {
            session.setStatus("REVOKED");
            session.setRevokedAt(LocalDateTime.now());
            authSessionMapper.updateById(session);
        }
    }

    private String generateToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String digest(String token) {
        try {
            MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
            return Base64.getUrlEncoder().withoutPadding().encodeToString(messageDigest.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("Token digest failed", ex);
        }
    }
}
