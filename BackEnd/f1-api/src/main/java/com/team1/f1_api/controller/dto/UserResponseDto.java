package com.team1.f1_api.controller.dto;

public record UserResponseDto(
        Long userId,
        String username,
        String email,
        String provider,
        String picture,
        String role
) {}