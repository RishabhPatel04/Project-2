package com.team1.f1_api.controller;

import com.team1.f1_api.controller.dto.UserResponseDto;
import com.team1.f1_api.model.AppUser;
import com.team1.f1_api.repository.AppUserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for admin-only user management endpoints.
 * All routes under /users require ADMIN authority, enforced via SecurityConfig.
 */
@RestController
@RequestMapping("/users")
public class UserController {

    private final AppUserRepository userRepo;

    /**
     * Constructs the controller with the required AppUserRepository dependency.
     *
     * @param userRepo the JPA repository for AppUser entities
     */
    public UserController(AppUserRepository userRepo) {
        this.userRepo = userRepo;
    }

    /**
     * Retrieves all registered users.
     * Passwords are omitted from the response via {@link UserResponseDto}.
     *
     * @return a list of all users
     */
    @Operation(summary = "Get all users", description = "Admin only — returns all registered users")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved users")
    @GetMapping
    public List<UserResponseDto> getAllUsers() {
        return userRepo.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * Retrieves a single user by their ID.
     *
     * @param userId the user's primary key
     * @return the matching user, or 404 if not found
     */
    @Operation(summary = "Get user by ID", description = "Admin only — returns a specific user")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved user")
    @ApiResponse(responseCode = "404", description = "User not found")
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long userId) {
        return userRepo.findById(userId)
                .map(user -> ResponseEntity.ok(toDto(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Partially updates a user's fields. Currently supports updating the role field.
     * Accepted body: { "role": "ADMIN" } or { "role": "USER" }
     *
     * @param userId  the user's primary key
     * @param updates a map of field names to new values
     * @return the updated user, 400 if the role value is invalid, or 404 if not found
     */
    @Operation(summary = "Update user", description = "Admin only — update a user's fields (e.g. role)")
    @ApiResponse(responseCode = "200", description = "Successfully updated user")
    @ApiResponse(responseCode = "400", description = "Invalid role value")
    @ApiResponse(responseCode = "404", description = "User not found")
    @PatchMapping("/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId,
                                        @RequestBody Map<String, String> updates) {
        return userRepo.findById(userId)
                .map(user -> {
                    if (updates.containsKey("role")) {
                        String newRole = updates.get("role");
                        if (!newRole.equals("ADMIN") && !newRole.equals("USER")) {
                            return ResponseEntity.badRequest()
                                    .body(Map.of("error", "Role must be ADMIN or USER"));
                        }
                        user.setRole(newRole);
                    }
                    userRepo.save(user);
                    return ResponseEntity.ok((Object) toDto(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Deletes a user by their ID.
     *
     * @param userId the user's primary key
     * @return 204 No Content on success, or 404 if not found
     */
    @Operation(summary = "Delete user", description = "Admin only — deletes a user account")
    @ApiResponse(responseCode = "204", description = "Successfully deleted user")
    @ApiResponse(responseCode = "404", description = "User not found")
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        if (!userRepo.existsById(userId)) {
            return ResponseEntity.notFound().build();
        }
        userRepo.deleteById(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Maps an AppUser entity to a UserResponseDto, excluding the password field.
     *
     * @param user the AppUser entity to convert
     * @return a UserResponseDto safe for API responses
     */
    private UserResponseDto toDto(AppUser user) {
        return new UserResponseDto(
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getProvider(),
                user.getPicture(),
                user.getRole()
        );
    }
}