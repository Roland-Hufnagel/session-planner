package org.example.backend.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/me")
    public Map<String, Object> getMe(@AuthenticationPrincipal OAuth2AuthenticatedPrincipal principal) {
        // Wir wollen in der FilterChain '/api/auth/me' auf permitAll setzen,
        // damit der Endpunkt IMMER erreichbar ist, auch für ausgeloggte User.
        // In dem Fall wäre das Principal null
        // Weiterhin wollen wir noch in dem Fall später ein 401 returnen.
        if (principal == null) {
            return null;            // spaeter: ausgeloggt -> null / 401
        }
        return principal.getAttributes();
    }
}
