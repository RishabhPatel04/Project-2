import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../../api";
import "./Continent.css";

import NAtrack from "../../assets/ContTrack/NAtrack.jpg";
import EUtrack from "../../assets/ContTrack/EUtrack.jpg";
import AFtrack from "../../assets/ContTrack/AFtrack.jpg";
import SAtrack from "../../assets/ContTrack/SAtrack.jpg";
import APACtrack from "../../assets/ContTrack/APACtrack.jpg";
import AUtrack from "../../assets/ContTrack/AUtrack.jpg";

// continent images
const continentImages = {
    "North America": NAtrack,
    Europe: EUtrack,
    Africa: AFtrack,
    "South America": SAtrack,
    APAC: APACtrack,
    Australia: AUtrack,
    Asia: APACtrack,
    Oceania: AUtrack,
};

function Continent() {
    const navigate = useNavigate();

    const [continents, setContinents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);

    // Check if current user is an admin via /auth/me endpoint.
    useEffect(() => {
        fetch(`${API_URL}/auth/me`, { credentials: "include" })
            .then((r) => r.ok ? r.json() : null)
            .then((data) => { if (data?.role === "ADMIN") setIsAdmin(true); })
            .catch(() => {});
    }, []);

    // load continents when page opens
    useEffect(() => {
        const loadContinents = async () => {
            try {
                const res = await fetch(`${API_URL}/continents`);

                if (!res.ok) {
                    throw new Error(`api error: ${res.status}`);
                }

                const data = await res.json();
                setContinents(Array.isArray(data) ? data : []);
                setError("");
            } catch (e) {
                setError(e.message || "failed to load continents");
            } finally {
                setLoading(false);
            }
        };

        loadContinents();
    }, []);

    // go to selected continent page
    const goToContinent = (name) => {
        navigate(`/continents/${encodeURIComponent(name)}`);
    };

    return (
        <div className="continent-wrapper">
            {/* navbar */}
            <div className="navbar">
                <div className="logo">
                    MotoRYX<span className="dot">.</span>
                </div>

                <div className="nav-links">
                    <Link to="/profile">Profile</Link>
                    <button className="logout-btn" onClick={() => navigate("/")}>
                        Log Out
                    </button>
                </div>
            </div>

            {/* header */}
            <div className="header">
                <p className="page-label">Choose Your Continent</p>
            </div>

            {/* loading and error messages */}
            {loading && <p>Loading…</p>}
            {error && <p style={{ color: "#f4b400" }}>{error}</p>}

            {/* continent cards */}
            {!loading && !error && (
                <div className="continent-grid">
                    {continents.map((continent) => (
                        <div
                            key={continent.name}
                            className="continent-card"
                            onClick={() => goToContinent(continent.name)}
                        >
                            <img
                                src={continentImages[continent.name]}
                                alt={continent.name}
                            />

                            <div className="continent-card-content">
                                <h3>{continent.name}</h3>
                                <p>{continent.countryCount} Countries</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Continent;