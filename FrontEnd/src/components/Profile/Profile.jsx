import { useNavigate } from "react-router-dom";
import "./Profile.css";
import integraImage from "../../assets/integra-profile.jpg";

function Profile() {
    const navigate = useNavigate();

    const userProfile = {
        name: "Jordan Lagura",
        car: "1996 Acura Integra GSR",
        favoriteDrive: "Calaveras Rd, Milpitas",
        transmission: "5 speed manual",
        drivetrain: "Front engine, front wheel drive",
        engineType: "Inline 4",
        displacement: "1.8 l (110 ci / 1797 cc)",
        power: "170 ps (168 bhp / 125 kw)",
        torque: "174 Nm (128 lb-ft)",
        powerLiter: "95 ps (93 hp)",
        color: "Milano Red",
        year: "1996",
        trim: "GSR",
        owned: "4 years",
    };

    return (
        <div className="profile-wrapper">
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
                        Return To Previous
                    </button>

                    <button
                        className="logout-btn"
                        onClick={() => navigate("/")}
                    >
                        Log Out
                    </button>
                </div>
            </div>

            {/* header */}
            <div className="profile-header">
                <div className="profile-header-text">
                    <p className="profile-label">Driver Profile</p>
                    <h1 className="profile-name">{userProfile.name}</h1>
                    <p className="profile-subtitle">
                        {userProfile.car}
                    </p>
                </div>
            </div>

            {/* top section */}
            <div className="profile-top-section">
                <div className="profile-image-card">
                    <img
                        src={integraImage}
                        alt={userProfile.car}
                        className="profile-car-image"
                    />
                </div>

                <div className="profile-about-card">

                    {/* header row */}
                    <div className="about-header">
                        <h2>About the Car</h2>

                        {/* buttons container */}
                        <div className="about-actions">
                            <button className="edit-box-btn">
                                Edit Info
                            </button>

                            <button className="change-car-btn">
                                Change Car
                            </button>
                        </div>
                    </div>

                    <div className="profile-info-grid">
                        <div className="profile-info-item">
                            <span>Owner</span>
                            <strong>{userProfile.name}</strong>
                        </div>

                        <div className="profile-info-item">
                            <span>Favorite Drive</span>
                            <strong>{userProfile.favoriteDrive}</strong>
                        </div>

                        <div className="profile-info-item">
                            <span>Year</span>
                            <strong>{userProfile.year}</strong>
                        </div>

                        <div className="profile-info-item">
                            <span>Trim</span>
                            <strong>{userProfile.trim}</strong>
                        </div>

                        <div className="profile-info-item">
                            <span>Color</span>
                            <strong>{userProfile.color}</strong>
                        </div>

                        <div className="profile-info-item">
                            <span>Years Owned</span>
                            <strong>{userProfile.owned}</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* specs section */}
            <div className="profile-section">
                <h2 className="section-title">Powertrain Specs</h2>
                <div className="profile-specs-grid">
                    <div className="spec-item">
                        <span>Engine Type</span>
                        <strong>{userProfile.engineType}</strong>
                    </div>

                    <div className="spec-item">
                        <span>Displacement</span>
                        <strong>{userProfile.displacement}</strong>
                    </div>

                    <div className="spec-item">
                        <span>Power</span>
                        <strong>{userProfile.power}</strong>
                    </div>

                    <div className="spec-item">
                        <span>Torque</span>
                        <strong>{userProfile.torque}</strong>
                    </div>

                    <div className="spec-item">
                        <span>Power / Liter</span>
                        <strong>{userProfile.powerLiter}</strong>
                    </div>

                    <div className="spec-item">
                        <span>Transmission</span>
                        <strong>{userProfile.transmission}</strong>
                    </div>

                    <div className="spec-item">
                        <span>Layout</span>
                        <strong>{userProfile.drivetrain}</strong>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Profile;