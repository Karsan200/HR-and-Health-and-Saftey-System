package uk.co.garagebridgend.backend.logic;

import uk.co.garagebridgend.backend.models.entity.PermissionsTable;

import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

public class UserInfoDetails implements UserDetails {

    private final String username;
    private final String password;
    private final List<GrantedAuthority> authorities;

    public UserInfoDetails(PermissionsTable userInfo) {
        this.username = userInfo.getAccount().getEmail(); // Use email as username
        this.password = userInfo.getAccount().getPassword();

        List<String> roleNames = new ArrayList<>();
        if (userInfo.isAdmin()) {
            roleNames.add("ROLE_ADMIN");
        }
        if (userInfo.isManager()) {
            roleNames.add("ROLE_MANAGER");
        }

        this.authorities = roleNames.stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public @Nullable String getPassword() {
        return password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}