package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uk.co.garagebridgend.backend.logic.JwtService;
import uk.co.garagebridgend.backend.logic.UserInfoService;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private UserInfoService service;
    private JwtService jwtService;
    private AuthenticationManager authenticationManager;
}
