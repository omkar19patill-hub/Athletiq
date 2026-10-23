package com.sportsphere.service;

import com.sportsphere.dto.request.auth.LoginRequest;
import com.sportsphere.dto.request.auth.RefreshTokenRequest;
import com.sportsphere.dto.request.auth.RegisterRequest;
import com.sportsphere.dto.response.auth.AuthResponse;
import com.sportsphere.dto.response.auth.TokenRefreshResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    TokenRefreshResponse refreshToken(RefreshTokenRequest request);
    void logout(String refreshToken);
}
