package com.sportsphere.service.impl;

import com.sportsphere.dto.request.auth.RefreshTokenRequest;
import com.sportsphere.entity.RefreshToken;
import com.sportsphere.entity.User;
import com.sportsphere.entity.enums.Role;
import com.sportsphere.exception.TokenExpiredException;
import com.sportsphere.repository.RefreshTokenRepository;
import com.sportsphere.repository.UserRepository;
import com.sportsphere.security.jwt.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/** D2: blocked/inactive users cannot refresh; blocking revokes refresh tokens. */
class AuthBlockingTest {

    private final UserRepository users = mock(UserRepository.class);
    private final RefreshTokenRepository tokens = mock(RefreshTokenRepository.class);
    private final JwtTokenProvider jwt = mock(JwtTokenProvider.class);

    private final AuthServiceImpl auth = new AuthServiceImpl(
            users, tokens, mock(PasswordEncoder.class), mock(AuthenticationManager.class), jwt);
    private final UserServiceImpl userService = new UserServiceImpl(users, mock(PasswordEncoder.class), tokens);

    private User user;
    private RefreshToken token;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(auth, "refreshTokenExpiration", 60_000L);
        user = User.builder().id(1L).email("u@x.com").firstName("U").lastName("L").role(Role.CUSTOMER).build();
        token = RefreshToken.builder().id(9L).user(user).token("rt-1").expiryDate(Instant.now().plusSeconds(600)).build();
        when(tokens.findByToken("rt-1")).thenReturn(Optional.of(token));
        when(tokens.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(jwt.generateTokenFromEmail(anyString())).thenReturn("access");
        when(users.findById(1L)).thenReturn(Optional.of(user));
        when(users.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    private RefreshTokenRequest req() {
        RefreshTokenRequest r = new RefreshTokenRequest();
        r.setRefreshToken("rt-1");
        return r;
    }

    @Test
    void activeUserCanRefresh() {
        assertEquals("access", auth.refreshToken(req()).getAccessToken());
        verify(tokens).delete(token); // rotation still happens
        verify(tokens).save(any());
    }

    @Test
    void blockedUserCannotRefreshAndTokenIsDeleted() {
        user.setIsBlocked(true);
        assertThrows(TokenExpiredException.class, () -> auth.refreshToken(req()));
        verify(tokens).delete(token);
        verify(tokens, never()).save(any());
        verify(jwt, never()).generateTokenFromEmail(anyString());
    }

    @Test
    void deactivatedUserCannotRefresh() {
        user.setIsActive(false);
        assertThrows(TokenExpiredException.class, () -> auth.refreshToken(req()));
        verify(tokens, never()).save(any());
    }

    @Test
    void blockingRevokesRefreshTokensButUnblockingDoesNot() {
        userService.toggleBlockUser(1L); // block
        assertTrue(user.getIsBlocked());
        verify(tokens, times(1)).deleteByUser(user);

        userService.toggleBlockUser(1L); // unblock
        assertFalse(user.getIsBlocked());
        verify(tokens, times(1)).deleteByUser(user); // still just the one call
    }
}
