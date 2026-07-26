package org.example.backend.security;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, CustomOAuth2UserService customOAuth2UserService) {
        http
                .csrf(csrf -> csrf.spa())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/me").permitAll()
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())
                .exceptionHandling(ex -> ex
                        .defaultAuthenticationEntryPointFor(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                                PathPatternRequestMatcher.withDefaults().matcher("/api/**")))
                .logout(logout -> logout
                        // '/api/logout' instead of 'logout' (is already in proxy)
                        .logoutUrl("/api/logout")
                        // The default would send a 302 with redirect '/login?logout'
                        // We don't want to redirect to another site because axios is doing the logout job
                        // Therefore we change the logoutSuccessHandler to send a 200 Success
                        .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler())
                        // Deletes the cookie in the browser
                        .deleteCookies("JSESSIONID"))
                .oauth2Login(o -> o
                        .defaultSuccessUrl("/users", true)
                        .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                        .failureUrl("/?error=not_registered"));

        return http.build();
    }
}

