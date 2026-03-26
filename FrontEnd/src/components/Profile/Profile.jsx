import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import integraImage from "../../assets/integra-profile.jpg";
import yzfr1Image from "../../assets/WAF2.06.08.25.L-35.jpg";
import m3Image from "../../assets/jettPuffedM3.jpg";

const carProfiles = {
    integra: {
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
        image: integraImage,
    },
    yzfr1: {
        name: "Rishabh Patel",
        car: "2018 Yamaha YZF-R1",
        favoriteDrive: "WeatherTech Raceway at Laguna Seca",
        transmission: "6 speed",
        drivetrain: "Chain drive",
        engineType: "Inline 4",
        displacement: "1000 cc",
        power: "200 ps (197 bhp / 147 kw)",
        torque: "113 Nm (83 lb-ft)",
        powerLiter: "200 ps (197 hp)",
        color: "Team Yamaha Black",
        year: "2018",
        trim: "R1",
        owned: "8 years",
        image: yzfr1Image,
    },
    m3: {
        name: "Bryan Puff",
        car: "2018 BMW M3 Competition",
        favoriteDrive: "Highway 9",
        transmission: "6 speed DCT",
        drivetrain: "Front Engine, Rear Wheel Drive",
        engineType: "Inline 6",
        displacement: "3.0 L (183 ci / 2979 cc)",
        power: "500 hp (373 kW)",
        torque: "563 Nm (415 lb-ft)",
        powerLiter: "149 bhp (111 kw)",
        color: "Alpine White",
        year: "2018",
        trim: "F80 M3 Competition",
        owned: "8 years",
        image: m3Image,
    },

};

function Profile() {
    const navigate = useNavigate();

    const [selectedCar, setSelectedCar] = useState("integra");
    const [userProfile, setUserProfile] = useState(carProfiles.integra);
    const [editData, setEditData] = useState(carProfiles.integra);
    const [isEditing, setIsEditing] = useState(false);
    const [showCarMenu, setShowCarMenu] = useState(false);

    const handleCarChange = (carKey) => {
        setSelectedCar(carKey);
        setUserProfile(carProfiles[carKey]);
        setEditData(carProfiles[carKey]);
        setIsEditing(false);
        setShowCarMenu(false);
    };

    const handleEditToggle = () => {
        if (isEditing) {
            setEditData(userProfile);
        }
        setIsEditing(!isEditing);
    };

    const handleSave = () => {
        setUserProfile(editData);
        setIsEditing(false);
    };

    const handleChange = (field, value) => {
        setEditData((prev) => ({ ...prev, [field]: value }));
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
                    {userProfile.image ? (
                        <img
                            src={userProfile.image}
                            alt={userProfile.car}
                            className="profile-car-image"
                        />
                    ) : (
                        <div className="profile-car-placeholder">
                            {userProfile.car}
                        </div>
                    )}
                </div>

                <div className="profile-about-card">

                    {/* header row */}
                    <div className="about-header">
                        <h2>About the Car</h2>

                        {/* buttons container */}
                        <div className="about-actions">
                            {isEditing && (
                                <button
                                    className="save-btn"
                                    onClick={handleSave}
                                >
                                    Save
                                </button>
                            )}
                            <button
                                className="edit-box-btn"
                                onClick={handleEditToggle}
                            >
                                {isEditing ? "Cancel" : "Edit Info"}
                            </button>

                            <div className="change-car-wrapper">
                                <button
                                    className="change-car-btn"
                                    onClick={() => setShowCarMenu(!showCarMenu)}
                                >
                                    Change Car ▾
                                </button>

                                {showCarMenu && (
                                    <div className="car-dropdown">
                                        {Object.entries(carProfiles).map(([key, profile]) => (
                                            <div
                                                key={key}
                                                className={`car-dropdown-item ${selectedCar === key ? "active" : ""}`}
                                                onClick={() => handleCarChange(key)}
                                            >
                                                {profile.car}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="profile-info-grid">
                        <div className="profile-info-item">
                            <span>Owner</span>
                            {isEditing ? (
                                <input
                                    className="edit-input"
                                    value={editData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                />
                            ) : (
                                <strong>{userProfile.name}</strong>
                            )}
                        </div>

                        <div className="profile-info-item">
                            <span>Favorite Drive</span>
                            {isEditing ? (
                                <input
                                    className="edit-input"
                                    value={editData.favoriteDrive}
                                    onChange={(e) => handleChange("favoriteDrive", e.target.value)}
                                />
                            ) : (
                                <strong>{userProfile.favoriteDrive}</strong>
                            )}
                        </div>

                        <div className="profile-info-item">
                            <span>Year</span>
                            {isEditing ? (
                                <input
                                    className="edit-input"
                                    value={editData.year}
                                    onChange={(e) => handleChange("year", e.target.value)}
                                />
                            ) : (
                                <strong>{userProfile.year}</strong>
                            )}
                        </div>

                        <div className="profile-info-item">
                            <span>Trim</span>
                            {isEditing ? (
                                <input
                                    className="edit-input"
                                    value={editData.trim}
                                    onChange={(e) => handleChange("trim", e.target.value)}
                                />
                            ) : (
                                <strong>{userProfile.trim}</strong>
                            )}
                        </div>

                        <div className="profile-info-item">
                            <span>Color</span>
                            {isEditing ? (
                                <input
                                    className="edit-input"
                                    value={editData.color}
                                    onChange={(e) => handleChange("color", e.target.value)}
                                />
                            ) : (
                                <strong>{userProfile.color}</strong>
                            )}
                        </div>

                        <div className="profile-info-item">
                            <span>Years Owned</span>
                            {isEditing ? (
                                <input
                                    className="edit-input"
                                    value={editData.owned}
                                    onChange={(e) => handleChange("owned", e.target.value)}
                                />
                            ) : (
                                <strong>{userProfile.owned}</strong>
                            )}
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