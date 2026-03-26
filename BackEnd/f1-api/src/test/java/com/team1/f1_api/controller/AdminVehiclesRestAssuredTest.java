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
class AdminVehiclesRestAssuredTest {

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

    private int createTestVehicle(String sessionId, String name) {
        return given()
                .contentType(ContentType.JSON)
                .cookie("JSESSIONID", sessionId)
                .body(Map.of("name", name))
        .when()
                .post("/vehicles")
        .then()
                .statusCode(201)
                .extract()
                .path("vehicleId");
    }

    @Test
    void testCreateVehicle_AuthenticatedReceives201() {
        String sessionId = getAdminSessionId();

        given()
                .contentType(ContentType.JSON)
                .cookie("JSESSIONID", sessionId)
                .body(Map.of("name", "Admin Test Car 7777"))
        .when()
                .post("/vehicles")
        .then()
                .statusCode(201)
                .body("name", equalTo("Admin Test Car 7777"))
                .body("vehicleId", notNullValue());
    }

    @Test
    void testCreateVehicle_UnauthenticatedReceives401Or403() {
        given()
                .config(NO_REDIRECTS)
                .contentType(ContentType.JSON)
                .body(Map.of("name", "Unauthorized Car"))
        .when()
                .post("/vehicles")
        .then()
                .statusCode(anyOf(is(401), is(302), is(403)));
    }

    @Test
    void testCreateVehicle_DuplicateNameReturnsError() {
        String sessionId = getAdminSessionId();
        String uniqueName = "Duplicate Test Car " + System.currentTimeMillis();

        given()
                .contentType(ContentType.JSON)
                .cookie("JSESSIONID", sessionId)
                .body(Map.of("name", uniqueName))
        .when()
                .post("/vehicles")
        .then()
                .statusCode(201);

        given()
                .contentType(ContentType.JSON)
                .cookie("JSESSIONID", sessionId)
                .body(Map.of("name", uniqueName))
        .when()
                .post("/vehicles")
        .then()
                .statusCode(anyOf(is(400), is(409), is(500)));
    }

    @Test
    void testUpdateVehicle_AuthenticatedReceives200WithUpdatedName() {
        String sessionId = getAdminSessionId();
        int vehicleId = createTestVehicle(sessionId, "Pre-Update Car");

        given()
                .contentType(ContentType.JSON)
                .cookie("JSESSIONID", sessionId)
                .body(Map.of("name", "Post-Update Car"))
        .when()
                .put("/vehicles/{id}", vehicleId)
        .then()
                .statusCode(200)
                .body("name", equalTo("Post-Update Car"))
                .body("vehicleId", equalTo(vehicleId));
    }

    @Test
    void testUpdateVehicle_Returns404WhenNotFound() {
        String sessionId = getAdminSessionId();

        given()
                .contentType(ContentType.JSON)
                .cookie("JSESSIONID", sessionId)
                .body(Map.of("name", "Ghost Car"))
        .when()
                .put("/vehicles/{id}", 999999)
        .then()
                .statusCode(404);
    }

    @Test
    void testUpdateVehicle_UnauthenticatedReceives401Or403() {
        given()
                .config(NO_REDIRECTS)
                .contentType(ContentType.JSON)
                .body(Map.of("name", "Some Car"))
        .when()
                .put("/vehicles/{id}", 1)
        .then()
                .statusCode(anyOf(is(401), is(302), is(403)));
    }

    @Test
    void testDeleteVehicle_AuthenticatedReceives204AndVehicleIsGone() {
        String sessionId = getAdminSessionId();
        int vehicleId = createTestVehicle(sessionId, "Delete Me Car 8888");

        given()
                .cookie("JSESSIONID", sessionId)
        .when()
                .delete("/vehicles/{id}", vehicleId)
        .then()
                .statusCode(204);

        given()
        .when()
                .get("/vehicles/{id}", vehicleId)
        .then()
                .statusCode(404);
    }

    @Test
    void testDeleteVehicle_Returns404WhenNotFound() {
        String sessionId = getAdminSessionId();

        given()
                .cookie("JSESSIONID", sessionId)
        .when()
                .delete("/vehicles/{id}", 999999)
        .then()
                .statusCode(404);
    }

    @Test
    void testDeleteVehicle_UnauthenticatedReceives401Or403() {
        given()
                .config(NO_REDIRECTS)
        .when()
                .delete("/vehicles/{id}", 1)
        .then()
                .statusCode(anyOf(is(401), is(302), is(403)));
    }
}