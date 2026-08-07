package org.example.backend.security;

import org.example.backend.model.Role;
import org.example.backend.model.User;
import org.example.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class CustomOAuth2UserServiceTest {

    private final UserRepository mockUserRepo = mock(UserRepository.class);
    private final CustomOAuth2UserService service = new CustomOAuth2UserService(mockUserRepo);

    private static final String GITHUB_NAME = "peterk";
    private static final String GITHUB_AVATAR = "https://avatars.githubusercontent.com/u/1?v=4";

    private static User user(String avatarUrl) {
        return User.builder()
                .id(UUID.randomUUID())
                .name("Peter Klein").nickname("Pete").role(Role.COACH)
                .githubName(GITHUB_NAME).email("peterk@neuefische.de")
                .avatarUrl(avatarUrl)
                .build();
    }

    @Test
    void adoptGithubAvatar_setsGithubImage_whenUserHasNone() {
        when(mockUserRepo.findByGithubName(GITHUB_NAME)).thenReturn(Optional.of(user(null)));
        ArgumentCaptor<User> savedUser = ArgumentCaptor.captor();

        service.adoptGithubAvatar(GITHUB_NAME, GITHUB_AVATAR);

        verify(mockUserRepo).save(savedUser.capture());
        assertThat(savedUser.getValue().getAvatarUrl()).isEqualTo(GITHUB_AVATAR);
    }

    @Test
    void adoptGithubAvatar_keepsOwnImage_whenUserAlreadyHasOne() {
        String ownAvatar = "https://example.com/pete-in-the-alps.png";
        when(mockUserRepo.findByGithubName(GITHUB_NAME)).thenReturn(Optional.of(user(ownAvatar)));

        service.adoptGithubAvatar(GITHUB_NAME, GITHUB_AVATAR);

        verify(mockUserRepo, never()).save(any());
    }

    @Test
    void adoptGithubAvatar_treatsBlankAsMissing() {
        when(mockUserRepo.findByGithubName(GITHUB_NAME)).thenReturn(Optional.of(user("   ")));
        ArgumentCaptor<User> savedUser = ArgumentCaptor.captor();

        service.adoptGithubAvatar(GITHUB_NAME, GITHUB_AVATAR);

        verify(mockUserRepo).save(savedUser.capture());
        assertThat(savedUser.getValue().getAvatarUrl()).isEqualTo(GITHUB_AVATAR);
    }

    @Test
    void adoptGithubAvatar_doesNothing_whenGithubHasNoAvatar() {
        service.adoptGithubAvatar(GITHUB_NAME, null);

        verify(mockUserRepo, never()).findByGithubName(any());
        verify(mockUserRepo, never()).save(any());
    }

    @Test
    void adoptGithubAvatar_doesNothing_whenUserIsUnknown() {
        when(mockUserRepo.findByGithubName(GITHUB_NAME)).thenReturn(Optional.empty());

        service.adoptGithubAvatar(GITHUB_NAME, GITHUB_AVATAR);

        verify(mockUserRepo, never()).save(any());
    }
}
