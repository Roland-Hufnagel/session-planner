package org.example.backend.security;

import lombok.RequiredArgsConstructor;
import org.example.backend.repository.UserRepository;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Objects;


@Service
@RequiredArgsConstructor
@NullMarked
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = Objects.requireNonNull(super.loadUser(userRequest)); // tells Sonar: this is never null
        String githubName = oAuth2User.getAttribute("login");
        if (!userRepository.existsByGithubNameAndActiveTrue(githubName)) {
            throw new OAuth2AuthenticationException("not_registered");
        }
        adoptGithubAvatar(githubName, oAuth2User.getAttribute("avatar_url"));
        return oAuth2User;
    }

    void adoptGithubAvatar(@Nullable String githubName, @Nullable String githubAvatarUrl) {
        if (!StringUtils.hasText(githubName) ||
                !StringUtils.hasText(githubAvatarUrl)) {
            return;
        }
        userRepository.findByGithubName(githubName)
                .filter(user -> !StringUtils.hasText(user.getAvatarUrl()))
                .ifPresent(user -> {
                    user.setAvatarUrl(githubAvatarUrl);
                    userRepository.save(user);
                });
    }
}
