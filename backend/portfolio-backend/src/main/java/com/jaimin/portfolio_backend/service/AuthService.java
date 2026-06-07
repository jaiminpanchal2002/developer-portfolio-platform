package com.jaimin.portfolio_backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.jaimin.portfolio_backend.security.JwtService;
import com.jaimin.portfolio_backend.dto.LoginRequest;
import com.jaimin.portfolio_backend.dto.RegisterRequest;
import com.jaimin.portfolio_backend.entity.Role;
import com.jaimin.portfolio_backend.entity.User;
import com.jaimin.portfolio_backend.repository.UserRepository;
import com.jaimin.portfolio_backend.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
     private final JwtService jwtService;
    public String register(RegisterRequest request) {
        if (userRepository.count() > 0) {
            throw new RuntimeException("Registration is disabled. An admin account already exists.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return "Email already exists";
        }

        Role assignedRole = userRepository.count() == 0 ? Role.ADMIN : Role.USER;

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(assignedRole)
                .build();

        userRepository.save(user);

        return "User Registered Successfully";
    }

    public String login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword());

        if (!passwordMatches) {
            throw new RuntimeException("Invalid Password");
        }

        return jwtService.generateToken(user.getEmail());
    }
}