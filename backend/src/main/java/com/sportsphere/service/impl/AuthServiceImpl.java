package com.sportsphere.service.impl;

import com.sportsphere.dto.request.auth.LoginRequest;
import com.sportsphere.dto.request.auth.RefreshTokenRequest;
import com.sportsphere.dto.request.auth.RegisterRequest;
import com.sportsphere.dto.response.auth.AuthResponse;
import com.sportsphere.dto.response.auth.TokenRefreshResponse;
import com.sportsphere.entity.RefreshToken;
import com.sportsphere.entity.User;
import com.sportsphere.entity.enums.Role;
import com.sportsphere.exception.BusinessException;
import com.sportsphere.exception.TokenExpiredException;
import com.sportsphere.repository.RefreshTokenRepository;
import com.sportsphere.repository.UserRepository;
import com.sportsphere.security.jwt.JwtTokenProvider;
import com.sportsphere.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${application.jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email address is already registered");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new BusinessException("Phone number is already registered");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole() != null ? request.getRole() : Role.CUSTOMER)
                .build();

        user = userRepository.save(user);
        log.info("New customer registered: {}", user.getEmail());

        String accessToken = jwtTokenProvider.generateTokenFromEmail(user.getEmail());
        String refreshToken = createRefreshToken(user);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("User not found"));

        // Revoke old refresh tokens
        refreshTokenRepository.deleteByUser(user);

        String accessToken = jwtTokenProvider.generateToken(authentication);
        String refreshToken = createRefreshToken(user);

        log.info("User logged in: {}", user.getEmail());
        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Override
    @Transactional
    public TokenRefreshResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new TokenExpiredException("Refresh token not found. Please login again."));

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new TokenExpiredException("Refresh token has expired. Please login again.");
        }

        User owner = refreshToken.getUser();
        if (Boolean.TRUE.equals(owner.getIsBlocked()) || !Boolean.TRUE.equals(owner.getIsActive())) {
            refreshTokenRepository.delete(refreshToken);
            throw new TokenExpiredException("Your session is no longer valid. Please login again.");
        }

        // Rotate refresh token
        refreshTokenRepository.delete(refreshToken);
        String newRefreshToken = createRefreshToken(refreshToken.getUser());
        String newAccessToken = jwtTokenProvider.generateTokenFromEmail(refreshToken.getUser().getEmail());

        return TokenRefreshResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .build();
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.deleteByToken(refreshToken);
        log.info("User logged out, refresh token invalidated");
    }

    private String createRefreshToken(User user) {
        RefreshToken token = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshTokenExpiration))
                .build();
        return refreshTokenRepository.save(token).getToken();
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
