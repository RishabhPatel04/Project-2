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

    // Check if current user is an admin by probing the /users endpoint.
    // If it returns 200, the session user has ADMIN role.
    useEffect(() => {
        fetch(`${API_URL}/users`, { credentials: "include" })
            .then((r) => { if (r.ok) setIsAdmin(true); })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const loadContinents = async () => {
            try {
                const res = await fetch(`${API_URL}/continents`);
                if (!res.ok) throw new Error(`api error: ${res.status}`);
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
                    {isAdmin && (
                        <Link to="/admin" className="admin-link">Admin Panel</Link>
                    )}
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

            {loading && <p>Loading…</p>}
            {error && <p style={{ color: "#f4b400" }}>{error}</p>}

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
