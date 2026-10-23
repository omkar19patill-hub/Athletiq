package com.sportsphere.controller;

import com.sportsphere.constants.ApiConstants;
import com.sportsphere.constants.AppConstants;
import com.sportsphere.dto.response.ApiResponse;
import com.sportsphere.dto.response.PagedResponse;
import com.sportsphere.dto.response.user.UserResponse;
import com.sportsphere.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiConstants.USERS)
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Users Management", description = "Admin endpoints for user management")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get all users paginated (Admin only)")
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "" + AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = "" + AppConstants.DEFAULT_PAGE_SIZE) int size) {
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully",
                userService.getAllUsers(page, size)));
    }

    @PatchMapping("/{id}/block")
    @Operation(summary = "Block or unblock a user (Admin only)")
    public ResponseEntity<ApiResponse<UserResponse>> toggleBlockUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User block status updated",
                userService.toggleBlockUser(id)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a user (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }
}
