package com.sportsphere.security.jwt;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private static final String SECRET_A = "test-secret-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"; // 41 bytes
    private static final String SECRET_B = "test-secret-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

    static JwtTokenProvider provider(String secret, long expirationMs) {
        JwtTokenProvider p = new JwtTokenProvider();
        ReflectionTestUtils.setField(p, "jwtSecret", secret);
        ReflectionTestUtils.setField(p, "accessTokenExpiration", expirationMs);
        p.init();
        return p;
    }

    @Test
    void rejectsMissingBlankOrShortSecret() {
        assertThrows(IllegalStateException.class, () -> provider(null, 60_000));
        assertThrows(IllegalStateException.class, () -> provider("   ", 60_000));
        IllegalStateException e = assertThrows(IllegalStateException.class,
                () -> provider("short-secret-31-bytes-xxxxxxxxx", 60_000));
        assertFalse(e.getMessage().contains("short-secret"), "secret must not leak into error message");
    }

    @Test
    void acceptsExactly32ByteSecret() {
        assertDoesNotThrow(() -> provider("x".repeat(32), 60_000));
    }

    @Test
    void validTokenRoundTrips() {
        JwtTokenProvider p = provider(SECRET_A, 60_000);
        String token = p.generateTokenFromEmail("user@example.com");
        assertTrue(p.validateToken(token));
        assertEquals("user@example.com", p.getEmailFromToken(token));
    }

    @Test
    void expiredTokenIsInvalidNotThrown() {
        String token = provider(SECRET_A, -1_000).generateTokenFromEmail("user@example.com");
        assertFalse(provider(SECRET_A, 60_000).validateToken(token));
    }

    @Test
    void wrongSignatureIsInvalidNotThrown() {
        String token = provider(SECRET_B, 60_000).generateTokenFromEmail("user@example.com");
        assertFalse(provider(SECRET_A, 60_000).validateToken(token));
    }

    @Test
    void garbageAndEmptyTokensAreInvalid() {
        JwtTokenProvider p = provider(SECRET_A, 60_000);
        assertFalse(p.validateToken("not.a.jwt"));
        assertFalse(p.validateToken("abc"));
        assertFalse(p.validateToken(""));
    }
}
