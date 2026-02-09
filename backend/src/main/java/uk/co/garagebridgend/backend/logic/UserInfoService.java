package uk.co.garagebridgend.backend.logic;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import uk.co.garagebridgend.backend.models.entity.PermissionsTable;
import uk.co.garagebridgend.backend.repository.PermissionsRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserInfoService implements UserDetailsService {

    private final PermissionsRepository repository;
    private final PasswordEncoder encoder;

    @Autowired
    public UserInfoService(PermissionsRepository repository, PasswordEncoder encoder) {
        this.repository = repository;
        this.encoder = encoder;
    }

    /** Method to load user details by username (email) */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Fetch user from the database
        Optional<PermissionsTable> userInfo = repository.findByUsername(username);

        if (userInfo.isEmpty()) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }

        // Convert permissions to Spring Security roles
        PermissionsTable user = userInfo.get();
        List<String> roleNames = new ArrayList<>();
        if (user.isAdmin()) {
            roleNames.add("ROLE_ADMIN");
        }
        if (user.isManager()) {
            roleNames.add("ROLE_MANAGER");
        }

        // Convert Account data to UserDetails (UserInfoDetails)
        return new User(
            user.getAccount().getEmail(),
            user.getAccount().getPassword(),
            roleNames.stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList())
        );
    }
}