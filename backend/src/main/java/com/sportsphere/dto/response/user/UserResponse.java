package com.sportsphere.dto.response.user;

import com.sportsphere.entity.enums.Role;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Role role;
    private String profileImage;
    private Boolean isActive;
    private Boolean isBlocked;
    private LocalDateTime createdAt;
}
