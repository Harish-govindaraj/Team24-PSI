package com.team24.pharma.service;

import com.team24.pharma.domain.entity.User;
import com.team24.pharma.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    public List<User> getAllUsers() {
        // Return all users. Real application might return a DTO to hide password_hash.
        // We will map it in the controller to hide sensitive info.
        return userRepository.findAll();
    }

    @Transactional
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
