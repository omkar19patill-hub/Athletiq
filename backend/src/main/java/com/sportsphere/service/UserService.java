package com.sportsphere.service;

import com.sportsphere.dto.request.user.ChangePasswordRequest;
import com.sportsphere.dto.request.user.UpdateProfileRequest;
import com.sportsphere.dto.response.PagedResponse;
import com.sportsphere.dto.response.user.UserResponse;

public interface UserService {
    UserResponse getProfile(String email);
    UserResponse updateProfile(String email, UpdateProfileRequest request);
    void changePassword(String email, ChangePasswordRequest request);
    PagedResponse<UserResponse> getAllUsers(int page, int size);
    UserResponse toggleBlockUser(Long userId);
    void deleteUser(Long userId);
}
