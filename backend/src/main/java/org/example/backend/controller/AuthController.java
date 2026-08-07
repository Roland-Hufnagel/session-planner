package org.example.backend.controller;

import org.example.backend.dto.MeResponseDto;
import org.example.backend.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public MeResponseDto getMe(@AuthenticationPrincipal OAuth2AuthenticatedPrincipal principal) {

        if (principal == null) {
            return null;
        }
        String githubName = principal.getAttribute("login");
        // Das gespeicherte Bild gewinnt: Es kann in der Userverwaltung geaendert
        // worden sein. Das GitHub-Profilbild ist nur der Rueckfall, etwa direkt
        // beim ersten Login, bevor es uebernommen wurde.
        String avatarUrl = userService.findAvatarUrlByGithubName(githubName)
                .orElse(principal.getAttribute("avatar_url"));
        return new MeResponseDto(principal.getAttribute("name"), githubName, avatarUrl);
    }
}
