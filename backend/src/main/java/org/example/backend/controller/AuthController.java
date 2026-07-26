package org.example.backend.controller;

import org.example.backend.dto.MeResponseDto;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/me")
    public MeResponseDto getMe(@AuthenticationPrincipal OAuth2AuthenticatedPrincipal principal) {

        if (principal == null) {
            return null;
        }
        return new MeResponseDto(principal.getAttribute("name"), principal.getAttribute("login"), principal.getAttribute("avatar_url"));
    }
}
