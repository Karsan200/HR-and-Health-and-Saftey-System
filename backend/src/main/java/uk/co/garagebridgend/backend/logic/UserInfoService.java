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

/**
 * Service providing user details for Spring Security.
 * <p>
 * Implements {@code UserDetailsService} and loads account information and
 * derived authorities used for authentication and authorization checks.
 */
@Service
public class UserInfoService implements UserDetailsService {
    /** Repositories and encoder for accessing user data and permissions. */
    private final AccountRepository repository;
    /** Repository for fetching user permissions. */
    private final PermissionsRepository permissionsRepository;
    /** Encoder for password handling. */
    private final PasswordEncoder encoder;

    /**
     * Constructor for dependency injection of required repositories and encoder.
     * @param accountRepositoryImpl the AccountRepository implementation to use
     * @param permissionsRepositoryImpl the PermissionsRepository implementation to use
     * @param encoderImpl the PasswordEncoder implementation to use
     */
    @Autowired
    public UserInfoService(
        final AccountRepository accountRepositoryImpl,
        final PermissionsRepository permissionsRepositoryImpl,
        final PasswordEncoder encoderImpl
    ) {
        this.repository = accountRepositoryImpl;
        this.permissionsRepository = permissionsRepositoryImpl;
        this.encoder = encoderImpl;
    }

    /** Method to load user details by username (accountId). */
    @Override
    public UserDetails loadUserByUsername(final String username) throws UsernameNotFoundException {
        // Fetch user from the database
        AccountTable account = repository.findById(Long.valueOf(username)).orElseThrow(() ->
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
            account.getAccountId().toString(),
                account.getPassword(),
            roleNames.stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList())
        );
    }
}
