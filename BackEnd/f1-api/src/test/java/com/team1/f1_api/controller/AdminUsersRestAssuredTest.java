package com.team1.f1_api.controller;

import com.team1.f1_api.repository.AppUserRepository;
import io.restassured.RestAssured;
import io.restassured.config.RedirectConfig;
import io.restassured.config.RestAssuredConfig;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.TestPropertySource;

import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(locations = "classpath:application.properties")
class AdminUsersRestAssuredTest {

    static {
        System.setProperty("java.net.useSystemProxies", "false");
    }

    private static final RestAssuredConfig NO_REDIRECTS = RestAssuredConfig.config()
            .redirect(RedirectConfig.redirectConfig().followRedirects(false));

    @LocalServerPort
    private int port;

    @Autowired
    private AppUserRepository userRepo;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.basePath = "";
    }

    @AfterEach
    void tearDown() {
        userRepo.findByUsername("adminuser").ifPresent(userRepo::delete);
        userRepo.findByUsername("regularuser").ifPresent(userRepo::delete);
        userRepo.findByUsername("targetuser").ifPresent(userRepo::delete);
    }

    private String getAdminSessionId() {
        given().contentType(ContentType.JSON)
                .body(Map.of(
                        "username", "adminuser",
                        "email", "admin@test.com",
                        "password", "password123"
                ))
                .post("/auth/register");

        userRepo.findByUsername("adminuser").ifPresent(user -> {
            user.setRole("ADMIN");
            userRepo.save(user);
        });

        return given()
                .contentType(ContentType.JSON)
                .body(Map.of(
                        "username", "adminuser",
                        "password", "password123"
                ))
                .post("/auth/login")
                .then()
                .statusCode(200)
                .extract()
                .cookie("JSESSIONID");
    }

    private String getUserSessionId() {
        given().contentType(ContentType.JSON)
                .body(Map.of(
                        "username", "regularuser",
                        "email", "regular@test.com",
                        "password", "password789"
                ))
                .post("/auth/register");

        return given()
                .contentType(ContentType.JSON)
                .body(Map.of(
                        "username", "regularuser",
                        "password", "password789"
                ))
                .post("/auth/login")
                .then()
                .statusCode(200)
                .extract()
                .cookie("JSESSIONID");
    }

    private Long createTargetUser() {
        given().contentType(ContentType.JSON)
                .body(Map.of(
                        "username", "targetuser",
                        "email", "target@test.com",
                        "password", "password456"
                ))
                .post("/auth/register")
                .then()
                .statusCode(200);

        return userRepo.findByUsername("targetuser")
                .orElseThrow(() -> new IllegalStateException("targetuser not created"))
                .getUserId();
    }

    @Test
    void testGetAllUsers_AdminReceives200WithList() {
        String sessionId = getAdminSessionId();

        given()
                .cookie("JSESSIONID", sessionId)
        .when()
                .get("/users")
        .then()
                .statusCode(200)
                .body("$", is(not(empty())));
    }

    @Test
    void testGetAllUsers_ResponseDoesNotExposePasswords() {
        String sessionId = getAdminSessionId();

        given()
                .cookie("JSESSIONID", sessionId)
        .when()
                .get("/users")
        .then()
                .statusCode(200)
                .body("[0]", not(hasKey("password")));
    }

    @Test
    void testGetAllUsers_UnauthenticatedReceives401Or403() {
        given()
                .config(NO_REDIRECTS)
        .when()
                .get("/users")
        .then()
                .statusCode(anyOf(is(401), is(302), is(403)));
    }

    @Test
    void testGetAllUsers_RegularUserReceives403() {
        String sessionId = getUserSessionId();

        given()
                .config(NO_REDIRECTS)
                .cookie("JSESSIONID", sessionId)
        .when()
                .get("/users")
        .then()
                .statusCode(anyOf(is(403), is(302)));
    }

    @Test
    void testGetUserById_AdminReceives200WithCorrectUser() {
        String sessionId = getAdminSessionId();
        Long targetId = createTargetUser();

        given()
                .cookie("JSESSIONID", sessionId)
        .when()
                .get("/users/{userId}", targetId)
        .then()
                .statusCode(200)
                .body("username", equalTo("targetuser"))
                .body("email", equalTo("target@test.com"))
                .body("role", equalTo("USER"))
                .body("$", not(hasKey("password")));
    }

    @Test
    void testGetUserById_Returns404WhenNotFound() {
        String sessionId = getAdminSessionId();

        given()
                .cookie("JSESSIONID", sessionId)
        .when()
                .get("/users/{userId}", 999999)
        .then()
                .statusCode(404);
    }

    @Test
    void testGetUserById_UnauthenticatedReceives401Or403() {
        given()
                .config(NO_REDIRECTS)
        .when()
                .get("/users/{userId}", 1)
        .then()
                .statusCode(anyOf(is(401), is(302), is(403)));
    }

    @Test
    void testGetUserById_RegularUserReceives403() {
        String sessionId = getUserSessionId();
        Long targetId = createTargetUser();

        given()
                .config(NO_REDIRECTS)
                .cookie("JSESSIONID", sessionId)
        .when()
                .get("/users/{userId}", targetId)
        .then()
                .statusCode(anyOf(is(403), is(302)));
    }

    @Test
    void testPatchUser_PromoteToAdminReturns200() {
        String sessionId = getAdminSessionId();
        Long targetId = createTargetUser();

        given()
                .cookie("JSESSIONID", sessionId)
                .contentType(ContentType.JSON)
                .body(Map.of("role", "ADMIN"))
        .when()
                .patch("/users/{userId}", targetId)
        .then()
                .statusCode(200)
                .body("role", equalTo("ADMIN"))
                .body("userId", equalTo(targetId.intValue()));
    }

    @Test
    void testPatchUser_DemoteToUserReturns200() {
        String sessionId = getAdminSessionId();
        Long targetId = createTargetUser();

        given()
                .cookie("JSESSIONID", sessionId)
                .contentType(ContentType.JSON)
                .body(Map.of("role", "ADMIN"))
        .when()
                .patch("/users/{userId}", targetId)
        .then()
                .statusCode(200);

        given()
                .cookie("JSESSIONID", sessionId)
                .contentType(ContentType.JSON)
                .body(Map.of("role", "USER"))
        .when()
                .patch("/users/{userId}", targetId)
        .then()
                .statusCode(200)
                .body("role", equalTo("USER"));
    }

    @Test
    void testPatchUser_InvalidRoleReturns400() {
        String sessionId = getAdminSessionId();
        Long targetId = createTargetUser();

        given()
                .cookie("JSESSIONID", sessionId)
                .contentType(ContentType.JSON)
                .body(Map.of("role", "SUPERUSER"))
        .when()
                .patch("/users/{userId}", targetId)
        .then()
                .statusCode(400);
    }

    @Test
    void testPatchUser_Returns404WhenNotFound() {
        String sessionId = getAdminSessionId();

        given()
                .cookie("JSESSIONID", sessionId)
                .contentType(ContentType.JSON)
                .body(Map.of("role", "ADMIN"))
        .when()
                .patch("/users/{userId}", 999999)
        .then()
                .statusCode(404);
    }

    @Test
    void testPatchUser_UnauthenticatedReceives401Or403() {
        given()
                .config(NO_REDIRECTS)
                .contentType(ContentType.JSON)
                .body(Map.of("role", "ADMIN"))
        .when()
                .patch("/users/{userId}", 1)
        .then()
                .statusCode(anyOf(is(401), is(302), is(403)));
    }

    @Test
    void testPatchUser_RegularUserReceives403() {
        String userSessionId = getUserSessionId();
        Long targetId = createTargetUser();

        given()
                .config(NO_REDIRECTS)
                .cookie("JSESSIONID", userSessionId)
                .contentType(ContentType.JSON)
                .body(Map.of("role", "ADMIN"))
        .when()
                .patch("/users/{userId}", targetId)
        .then()
                .statusCode(anyOf(is(403), is(302)));
    }

    @Test
    void testDeleteUser_AdminReceives204AndUserIsGone() {
        String sessionId = getAdminSessionId();
        Long targetId = createTargetUser();

        given()
                .cookie("JSESSIONID", sessionId)
        .when()
                .delete("/users/{userId}", targetId)
        .then()
                .statusCode(204);

        given()
                .cookie("JSESSIONID", sessionId)
        .when()
                .get("/users/{userId}", targetId)
        .then()
                .statusCode(404);
    }

    @Test
    void testDeleteUser_Returns404WhenNotFound() {
        String sessionId = getAdminSessionId();

        given()
                .cookie("JSESSIONID", sessionId)
        .when()
                .delete("/users/{userId}", 999999)
        .then()
                .statusCode(404);
    }

    @Test
    void testDeleteUser_UnauthenticatedReceives401Or403() {
        given()
                .config(NO_REDIRECTS)
        .when()
                .delete("/users/{userId}", 1)
        .then()
                .statusCode(anyOf(is(401), is(302), is(403)));
    }

    @Test
    void testDeleteUser_RegularUserReceives403() {
        String sessionId = getUserSessionId();
        Long targetId = createTargetUser();

        given()
                .config(NO_REDIRECTS)
                .cookie("JSESSIONID", sessionId)
        .when()
                .delete("/users/{userId}", targetId)
        .then()
                .statusCode(anyOf(is(403), is(302)));
    }
}