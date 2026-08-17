package com.team24.pharma.domain.repository;

import com.team24.pharma.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
    boolean existsByRequestedRoleAndBusinessRegistrationId(String requestedRole, String businessRegistrationId);
    Optional<User> findByEmail(String email);
    List<User> findByVerificationStatusAndRequestedRoleIn(com.team24.pharma.common.enums.VerificationStatus status, List<String> requestedRoles);
}
