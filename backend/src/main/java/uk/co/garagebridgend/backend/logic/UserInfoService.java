package uk.co.garagebridgend.backend.logic;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.PermissionsTable;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.PermissionsRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserInfoService implements UserDetailsService {

    private final AccountRepository repository;
    private final PermissionsRepository permissionsRepository;
    private final PasswordEncoder encoder;

    @Autowired
    public UserInfoService(
        AccountRepository repository,
        PermissionsRepository permissionsRepository,
        PasswordEncoder encoder
    ) {
        this.repository = repository;
        this.permissionsRepository = permissionsRepository;
        this.encoder = encoder;
    }

    /** Method to load user details by username (email) */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Fetch user from the database
        AccountTable account = repository.findByUsername(username).orElseThrow(() ->
            new UsernameNotFoundException("User not found"));

        // Get permissions for the user
        Optional<PermissionsTable> permissions = permissionsRepository.findById(account);
        List<String> roleNames = new ArrayList<>();
        if (permissions.isPresent()) {
            if (permissions.get().isAdmin()) {
                roleNames.add("ROLE_ADMIN");
            }
            if (permissions.get().isManager()) {
                roleNames.add("ROLE_MANAGER");
            }
        }

        // Convert Account data to UserDetails (UserInfoDetails)
        return new User(
            account.getEmail(),
                account.getPassword(),
            roleNames.stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList())
        );
    }
}