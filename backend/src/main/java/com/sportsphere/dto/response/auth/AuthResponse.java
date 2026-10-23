package com.sportsphere.dto.response.auth;

import com.sportsphere.entity.enums.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private Role role;
}
