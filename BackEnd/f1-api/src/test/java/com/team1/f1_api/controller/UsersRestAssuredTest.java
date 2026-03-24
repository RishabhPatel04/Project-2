package com.team1.f1_api.controller;

import com.team1.f1_api.repository.AppUserRepository;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.TestPropertySource;

import io.restassured.config.RedirectConfig;
import io.restassured.config.RestAssuredConfig;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * REST Assured integration tests for the /users admin endpoints.
 *
 * All /users routes require ADMIN authority. Each test that needs admin access
 * calls {@link #getAdminSessionCookie()} which registers a fresh user, promotes
 * it to ADMIN directly in the repo, then logs in and returns the JSESSIONID.
 *
 * A regular (non-admin) user is registered separately where needed to verify
 * that 403 is returned for unauthenticated / under-privileged callers.
 *
 * Teardown deletes both the "adminuser" and "targetuser" test accounts so that
 * each test class run starts with a clean slate (H2 in-memory DB is shared
 * across the test suite within a single run).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(locations = "classpath:application.properties")
class UsersRestAssuredTest {

    // Prevent REST Assured from picking up any system HTTP proxy during CI.
    static {
        System.setProperty("java.net.useSystemProxies", "false");
    }

    // Config that stops REST Assured from auto-following 302 redirects.
    // Spring Security redirects unauthenticated requests to /oauth2/login (302)
    // and REST Assured would silently follow it and get a 200 from the login page,
    // masking the real auth failure. With this config the raw 302 is captured instead.
    private static final RestAssuredConfig NO_REDIRECTS = RestAssuredConfig.config()
            .redirect(RedirectConfig.redirectConfig().followRedirects(false));

    @LocalServerPort
    private int port;

    @Autowired
    private AppUserRepository userRepo;

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.basePath = "";
    }

    @AfterEach
    void tearDown() {
        // Clean up both accounts created during tests so each test is isolated.
        userRepo.findByUsername("adminuser").ifPresent(userRepo::delete);
        userRepo.findByUsername("targetuser").ifPresent(userRepo::delete);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Registers a fresh "adminuser", promotes it to ADMIN in the DB, then logs
     * in and returns the JSESSIONID cookie for use in subsequent requests.
     */
    private String getAdminSessionCookie() {
        given().contentType(ContentType.JSON)
                .body(Map.of(
                        "username", "adminuser",
                        "email",    "admin@test.com",
                        "password", "password123"
                ))
                .post("/auth/register");

        // Promote to ADMIN directly via the repository (bypasses the API).
        userRepo.findByUsername("adminuser").ifPresent(user -> {
            user.setRole("ADMIN");
            userRepo.save(user);
        });

        return given()
                .contentType(ContentType.JSON)
                .body(Map.of("username", "adminuser", "password", "password123"))
                .post("/auth/login")
                .then()
                .statusCode(200)
                .extract()
                .cookie("JSESSIONID");
    }

    /**
     * Registers a plain USER account ("targetuser") and returns its database ID.
     * Used to create a target for GET/PATCH/DELETE tests.
     */
    private Long createTargetUser() {
        given().contentType(ContentType.JSON)
                .body(Map.of(
                        "username", "targetuser",
                        "email",    "target@test.com",
                        "password", "password456"
                ))
                .post("/auth/register")
                .then()
                .statusCode(200);

        return userRepo.findByUsername("targetuser")
                .orElseThrow(() -> new IllegalStateException("targetuser not created"))
                .getUserId();
    }

    // ── GET /users ────────────────────────────────────────────────────────────

    /** Happy path: admin receives a non-empty list of all users. */
    @Test
    void testGetAllUsersReturns200ForAdmin() {
        String cookie = getAdminSessionCookie();

        given()
                .cookie("JSESSIONID", cookie)
                .when().get("/users")
                .then()
                .statusCode(200)
                .body("$", is(not(empty())));
    }

    /** Error path: unauthenticated request is rejected (302 redirect to login, or 401/403). */
    @Test
    void testGetAllUsersReturns401Or403WithoutAuth() {
        given()
                .config(NO_REDIRECTS)
                .when().get("/users")
                .then()
                .statusCode(either(equalTo(401)).or(equalTo(302)).or(equalTo(403)));
    }

    // ── GET /users/{userId} ───────────────────────────────────────────────────

    /** Happy path: admin fetches a specific user by ID. */
    @Test
    void testGetUserByIdReturns200WhenFound() {
        String cookie = getAdminSessionCookie();
        Long targetId = createTargetUser();

        given()
                .cookie("JSESSIONID", cookie)
                .when().get("/users/{userId}", targetId)
                .then()
                .statusCode(200)
                .body("username", equalTo("targetuser"))
                .body("email",    equalTo("target@test.com"))
                // password must never be exposed in the response
                .body("$", not(hasKey("password")));
    }

    /** Error path: non-existent user ID returns 404. */
    @Test
    void testGetUserByIdReturns404WhenNotFound() {
        String cookie = getAdminSessionCookie();

        given()
                .cookie("JSESSIONID", cookie)
                .when().get("/users/{userId}", 999999)
                .then()
                .statusCode(404);
    }

    /** Error path: unauthenticated request is rejected (302 redirect to login, or 401/403). */
    @Test
    void testGetUserByIdReturns401Or403WithoutAuth() {
        given()
                .config(NO_REDIRECTS)
                .when().get("/users/{userId}", 1)
                .then()
                .statusCode(either(equalTo(401)).or(equalTo(302)).or(equalTo(403)));
    }

    // ── PATCH /users/{userId} ─────────────────────────────────────────────────

    /** Happy path: admin promotes a USER to ADMIN role. */
    @Test
    void testPatchUserRoleToAdminReturns200() {
        String cookie = getAdminSessionCookie();
        Long targetId = createTargetUser();

        given()
                .cookie("JSESSIONID", cookie)
                .contentType(ContentType.JSON)
                .body(Map.of("role", "ADMIN"))
                .when().patch("/users/{userId}", targetId)
                .then()
                .statusCode(200)
                .body("role", equalTo("ADMIN"));
    }

    /** Happy path: admin demotes an ADMIN back to USER role. */
    @Test
    void testPatchUserRoleToUserReturns200() {
        String cookie = getAdminSessionCookie();
        Long targetId = createTargetUser();

        // First promote, then demote.
        given()
                .cookie("JSESSIONID", cookie)
                .contentType(ContentType.JSON)
                .body(Map.of("role", "ADMIN"))
                .patch("/users/{userId}", targetId);

        given()
                .cookie("JSESSIONID", cookie)
                .contentType(ContentType.JSON)
                .body(Map.of("role", "USER"))
                .when().patch("/users/{userId}", targetId)
                .then()
                .statusCode(200)
                .body("role", equalTo("USER"));
    }

    /** Error path: invalid role value returns 400 with an error message. */
    @Test
    void testPatchUserReturns400ForInvalidRole() {
        String cookie = getAdminSessionCookie();
        Long targetId = createTargetUser();

        given()
                .cookie("JSESSIONID", cookie)
                .contentType(ContentType.JSON)
                .body(Map.of("role", "SUPERUSER"))
                .when().patch("/users/{userId}", targetId)
                .then()
                .statusCode(400)
                .body("error", equalTo("Role must be ADMIN or USER"));
    }

    /** Error path: patching a non-existent user returns 404. */
    @Test
    void testPatchUserReturns404WhenNotFound() {
        String cookie = getAdminSessionCookie();

        given()
                .cookie("JSESSIONID", cookie)
                .contentType(ContentType.JSON)
                .body(Map.of("role", "ADMIN"))
                .when().patch("/users/{userId}", 999999)
                .then()
                .statusCode(404);
    }

    /** Error path: unauthenticated patch is rejected (302 redirect to login, or 401/403). */
    @Test
    void testPatchUserReturns401Or403WithoutAuth() {
        given()
                .config(NO_REDIRECTS)
                .contentType(ContentType.JSON)
                .body(Map.of("role", "ADMIN"))
                .when().patch("/users/{userId}", 1)
                .then()
                .statusCode(either(equalTo(401)).or(equalTo(302)).or(equalTo(403)));
    }

    // ── DELETE /users/{userId} ────────────────────────────────────────────────

    /** Happy path: admin deletes an existing user and receives 204. */
    @Test
    void testDeleteUserReturns204WhenFound() {
        String cookie = getAdminSessionCookie();
        Long targetId = createTargetUser();

        given()
                .cookie("JSESSIONID", cookie)
                .when().delete("/users/{userId}", targetId)
                .then()
                .statusCode(204);

        // Confirm the user is truly gone.
        given()
                .cookie("JSESSIONID", cookie)
                .when().get("/users/{userId}", targetId)
                .then()
                .statusCode(404);
    }

    /** Error path: deleting a non-existent user returns 404. */
    @Test
    void testDeleteUserReturns404WhenNotFound() {
        String cookie = getAdminSessionCookie();

        given()
                .cookie("JSESSIONID", cookie)
                .when().delete("/users/{userId}", 999999)
                .then()
                .statusCode(404);
    }

    /** Error path: unauthenticated delete is rejected (302 redirect to login, or 401/403). */
    @Test
    void testDeleteUserReturns401Or403WithoutAuth() {
        given()
                .config(NO_REDIRECTS)
                .when().delete("/users/{userId}", 1)
                .then()
                .statusCode(either(equalTo(401)).or(equalTo(302)).or(equalTo(403)));
    }
}
