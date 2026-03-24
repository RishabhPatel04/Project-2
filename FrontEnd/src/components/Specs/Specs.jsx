import { Link, useNavigate } from "react-router-dom";
import "./Specs.css";
import trackImage from "../../assets/suzuka-map.png";

function Specs() {
    const navigate = useNavigate();

    const lapDetails = {
        car: "Ferrari SF90",
        driver: "Charles Leclerc",
        lapTime: "1:27.25",
        trackName: "Suzuka Circuit",
        country: "Japan",
        engine: "4.0L twin-turbo V8 hybrid",
        horsepower: "986 hp",
        transmission: "8-speed automatic",
        drivetrain: "AWD",
        topSpeed: "211 mph",
    };

    return (
        <div className="specs-wrapper">
            {/* navbar */}
            <div className="navbar">
                <div className="logo">
                    MotoRYX<span className="dot">.</span>
                </div>

                <div className="nav-links">
                    <button
                        className="back-btn"
                        onClick={() => navigate(-1)}
                    >
                        ← Back To Vehicles
                    </button>
                    <Link to="/profile">Profile</Link>
                    <button
                        className="logout-btn"
                        onClick={() => navigate(-1)}
                    >
                        Log Out
                    </button>
                </div>
            </div>

            {/* header */}
            <div className="specs-header">
                <p className="specs-label">Track Lap Details</p>
                <h1 className="specs-title">{lapDetails.car}</h1>
                <h2 className="lap-time-inline">{lapDetails.lapTime}</h2>
                <p className="specs-subtitle">
                    {lapDetails.driver} • {lapDetails.trackName}
                </p>
            </div>

            {/* top section */}
            <div className="specs-top-section">
                <div className="specs-image-card">
                    <img
                        src={trackImage}
                        alt={lapDetails.trackName}
                        className="specs-track-image"
                    />
                </div>

                <div className="specs-info-card">
                    <h2>Car Specs</h2>
                    <div className="specs-grid">
                        <div className="spec-item">
                            <span>Driver</span>
                            <strong>{lapDetails.driver}</strong>
                        </div>

                        <div className="spec-item">
                            <span>Track</span>
                            <strong>{lapDetails.trackName}</strong>
                        </div>

                        <div className="spec-item">
                            <span>Country</span>
                            <strong>{lapDetails.country}</strong>
                        </div>

                        <div className="spec-item">
                            <span>Engine</span>
                            <strong>{lapDetails.engine}</strong>
                        </div>

                        <div className="spec-item">
                            <span>Horsepower</span>
                            <strong>{lapDetails.horsepower}</strong>
                        </div>

                        <div className="spec-item">
                            <span>Transmission</span>
                            <strong>{lapDetails.transmission}</strong>
                        </div>

                        <div className="spec-item">
                            <span>Drivetrain</span>
                            <strong>{lapDetails.drivetrain}</strong>
                        </div>

                        <div className="spec-item">
                            <span>Top Speed</span>
                            <strong>{lapDetails.topSpeed}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Specs;