package org.pingpongapp.pingsmartclubwebboot.auth;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TokenStore {

    private static final long EXPIRE_HOURS = 168L;

    private final Map<String, TokenSession> tokenSessions = new ConcurrentHashMap<>();

    public String issue(AuthUser user) {
        String token = UUID.randomUUID().toString().replace("-", "");
        tokenSessions.put(token, new TokenSession(user, LocalDateTime.now().plusHours(EXPIRE_HOURS)));
        return token;
    }

    public Optional<AuthUser> resolve(String token) {
        TokenSession session = tokenSessions.get(token);
        if (session == null) {
            return Optional.empty();
        }
        if (session.expiredAt().isBefore(LocalDateTime.now())) {
            tokenSessions.remove(token);
            return Optional.empty();
        }
        return Optional.of(session.user());
    }

    public void revoke(String token) {
        tokenSessions.remove(token);
    }

    private record TokenSession(AuthUser user, LocalDateTime expiredAt) {
    }
}
