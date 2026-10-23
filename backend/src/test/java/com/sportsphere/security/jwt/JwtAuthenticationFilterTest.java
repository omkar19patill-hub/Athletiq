package com.sportsphere.security.jwt;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtAuthenticationFilterTest {

    private final JwtTokenProvider tokens =
            JwtTokenProviderTest.provider("test-secret-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", 60_000);
    private final UserDetailsService users = mock(UserDetailsService.class);
    private final JwtAuthenticationFilter filter = new JwtAuthenticationFilter(tokens, users);

    @AfterEach
    void clear() {
        SecurityContextHolder.clearContext();
    }

    private MockFilterChain run(String authHeader) throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest();
        if (authHeader != null) req.addHeader("Authorization", authHeader);
        MockFilterChain chain = new MockFilterChain();
        filter.doFilter(req, new MockHttpServletResponse(), chain);
        return chain;
    }

    @Test
    void validTokenAuthenticatesUser() throws Exception {
        when(users.loadUserByUsername("a@x.com"))
                .thenReturn(User.withUsername("a@x.com").password("p").roles("CUSTOMER").build());
        MockFilterChain chain = run("Bearer " + tokens.generateTokenFromEmail("a@x.com"));
        assertNotNull(chain.getRequest(), "chain must continue");
        assertEquals("a@x.com", SecurityContextHolder.getContext().getAuthentication().getName());
    }

    @Test
    void blockedOrDeletedUserContinuesUnauthenticated() throws Exception {
        when(users.loadUserByUsername("gone@x.com"))
                .thenThrow(new UsernameNotFoundException("User account is blocked by admin"));
        MockFilterChain chain = run("Bearer " + tokens.generateTokenFromEmail("gone@x.com"));
        assertNotNull(chain.getRequest(), "chain must continue instead of throwing");
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void invalidTokenContinuesUnauthenticated() throws Exception {
        MockFilterChain chain = run("Bearer garbage.token.here");
        assertNotNull(chain.getRequest());
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verifyNoInteractions(users);
    }
}
