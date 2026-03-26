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
class AdminTracksRestAssuredTest {

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

    private int createTestTrack(String sessionId, String name) {
        return given()
                .contentType(ContentType.JSON)
                .cookie("JSESSIONID", sessionId)
                .body(Map.of(
                        "region", "TEST",
                        "country", "Testland",
                        "name", name,
                        "layout", "Test Layout",
                        "lengthKm", 4.0
                ))
        .when()
                .post("/tracks")
        .then()
                .statusCode(201)
                .extract()
                .path("trackId");
    }

    @Test
    void testCreateTrack_AuthenticatedReceives201() {
        String sessionId = getAdminSessionId();

        given()
                .contentType(ContentType.JSON)
                .cookie("JSESSIONID", sessionId)
                .body(Map.of(
                        "region", "EU",
                        "country", "Italy",
                        "name", "Admin Test Circuit",
                        "layout", "Full Circuit",
                        "lengthKm", 5.793
                ))
        .when()
                .post("/tracks")
        .then()
                .statusCode(201)
                .body("name", equalTo("Admin Test Circuit"))
                .body("country", equalTo("Italy"))
                .body("region", equalTo("EU"))
                .body("trackId", notNullValue());
    }

    @Test
    void testCreateTrack_UnauthenticatedReceives401Or403() {
        given()
                .config(NO_REDIRECTS)
                .contentType(ContentType.JSON)
                .body(Map.of(
                        "region", "EU",
                        "country", "Italy",
                        "name", "Unauthorized Circuit",
                        "layout", "Full Circuit",
                        "lengthKm", 5.0
                ))
        .when()
                .post("/tracks")
        .then()
                .statusCode(anyOf(is(401), is(302), is(403)));
    }

    @Test
    void testUpdateTrack_AuthenticatedReceives200WithUpdatedFields() {
        String sessionId = getAdminSessionId();
        int trackId = createTestTrack(sessionId, "Pre-Update Circuit");

        given()
                .contentType(ContentType.JSON)
                .cookie("JSESSIONID", sessionId)
                .body(Map.of(
                        "region", "EU",
                        "country", "France",
                        "name", "Post-Update Circuit",
                        "layout", "Extended Layout",
                        "lengthKm", 6.1
                ))
        .when()
                .put("/tracks/{id}", trackId)
        .then()
                .statusCode(200)
                .body("name", equalTo("Post-Update Circuit"))
                .body("country", equalTo("France"))
                .body("layout", equalTo("Extended Layout"));
    }

    @Test
    void testUpdateTrack_Returns404WhenNotFound() {
        String sessionId = getAdminSessionId();

        given()
                .contentType(ContentType.JSON)
                .cookie("JSESSIONID", sessionId)
                .body(Map.of(
                        "region", "EU",
                        "country", "Italy",
                        "name", "Ghost Circuit",
                        "layout", "Full Circuit",
                        "lengthKm", 5.0
                ))
        .when()
                .put("/tracks/{id}", 999999)
        .then()
                .statusCode(404);
    }

    @Test
    void testUpdateTrack_UnauthenticatedReceives401Or403() {
        given()
                .config(NO_REDIRECTS)
                .contentType(ContentType.JSON)
                .body(Map.of(
                        "region", "EU",
                        "country", "Italy",
                        "name", "Some Circuit",
                        "layout", "Full Circuit",
                        "lengthKm", 5.0
                ))
        .when()
                .put("/tracks/{id}", 1)
        .then()
                .statusCode(anyOf(is(401), is(302), is(403)));
    }

    @Test
    void testDeleteTrack_AuthenticatedReceives204AndTrackIsGone() {
        String sessionId = getAdminSessionId();
        int trackId = createTestTrack(sessionId, "Delete Me Circuit");

        given()
                .cookie("JSESSIONID", sessionId)
        .when()
                .delete("/tracks/{id}", trackId)
        .then()
                .statusCode(204);

        given()
        .when()
                .get("/tracks/{id}", trackId)
        .then()
                .statusCode(404);
    }

    @Test
    void testDeleteTrack_Returns404WhenNotFound() {
        String sessionId = getAdminSessionId();

        given()
                .cookie("JSESSIONID", sessionId)
        .when()
                .delete("/tracks/{id}", 999999)
        .then()
                .statusCode(404);
    }

    @Test
    void testDeleteTrack_UnauthenticatedReceives401Or403() {
        given()
                .config(NO_REDIRECTS)
        .when()
                .delete("/tracks/{id}", 1)
        .then()
                .statusCode(anyOf(is(401), is(302), is(403)));
    }
}