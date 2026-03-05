import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../../api";
import "./SignUp.css";

/**
 * SignUp component for new user registration.
 * Provides two sign-up methods:
 *   1. Local registration via username, email, and password form
 *   2. Google OAuth2 sign-up via redirect to the backend OAuth endpoint
 *
 * On successful local registration, the user is redirected to the Login page.
 * On failure, an inline error message is displayed.
 */
function SignUp() {
    /** React Router hook for programmatic navigation */
    const navigate = useNavigate();

    /** @state {string} username - The username entered by the user */
    const [username, setUsername] = useState("");
    /** @state {string} email - The email address entered by the user */
    const [email, setEmail] = useState("");
    /** @state {string} password - The password entered by the user */
    const [password, setPassword] = useState("");
    /** @state {string} confirmPassword - The confirmation password for validation */
    const [confirmPassword, setConfirmPassword] = useState("");
    /** @state {string} error - Error message displayed on registration failure */
    const [error, setError] = useState("");

    /**
     * Handles local registration form submission.
     * Validates that passwords match, then sends a POST request
     * to /auth/register with username, email, and password.
     * On success, navigates to the Login page.
     * On failure, displays the server error message.
     *
     * @param {React.FormEvent} e - The form submission event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username, email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                navigate("/");
            } else {
                setError(data.error || "Registration failed");
            }
        } catch (err) {
            setError("Unable to connect to server");
        }
    };

    /**
     * Redirects the user to the backend Google OAuth2 authorization endpoint
     * to initiate the Google sign-up flow.
     */
    const handleGoogleSignUp = () => {
        window.location.href = `${API_URL}/oauth2/authorization/google`;
    };

    return (
        <div className="signup-wrapper">
            {/* LEFT SIDE */}
            <div className="left-section">
                <h1 className="logo">
                    MotoRYX<span className="dot">.</span>
                </h1>
                <p className="tagline">
                    Every Model. Every Lap. Logged.
                </p>
            </div>

            {/* RIGHT SIDE */}
            <div className="right-section">
                <div className="signup-box">
                    <h3 className="welcome-text">Create An Account</h3>

                    {error && <p className="error-text">{error}</p>}

                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        <button type="submit">Sign Up</button>
                    </form>

                    <div className="divider">
                        <span>or</span>
                    </div>

                    <button className="google-btn" onClick={handleGoogleSignUp}>
                        Sign up with Google
                    </button>

                    <p className="login-text">
                        Have an account? <span onClick={() => navigate("/")}>Log in</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
