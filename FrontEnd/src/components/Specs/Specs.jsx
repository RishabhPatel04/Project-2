import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API_URL from "../../api";
import "./Specs.css";

function Specs() {
    const { continentName, countryName, trackId, vehicleId } = useParams();
    const navigate = useNavigate();

    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/vehicles/${vehicleId}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Vehicle not found");
                }
                return res.json();
            })
            .then((data) => {
                setVehicle(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching vehicle:", err);
                setError("Failed to load vehicle specs.");
                setLoading(false);
            });
    }, [vehicleId]);

    if (loading) return <div className="specs-loading">Loading specs...</div>;
    if (error) return <div className="specs-error">{error}</div>;

    return (
        <div className="specs-wrapper">
            {/* Navbar */}
            <div className="specs-navbar">
                <div className="logo">
                    MotoRYX<span className="dot">.</span>
                </div>

                <button
                    className="back-btn"
                    onClick={() =>
                        navigate(
                            `/continents/${continentName}/${countryName}/${trackId}`
                        )
                    }
                >
                    ← Return to Vehicles
                </button>
            </div>

            {/* Main Content */}
            <div className="specs-container">
                <div className="specs-left">
                    <h1 className="vehicle-title">{vehicle.name}</h1>
                    <p className="vehicle-subtitle">
                        {vehicle.year} • {vehicle.country}
                    </p>

                    <div className="specs-grid">
                        <div className="spec-item">
                            <span>Engine Type</span>
                            <strong>{vehicle.engineType}</strong>
                        </div>

                        <div className="spec-item">
                            <span>Displacement</span>
                            <strong>{vehicle.displacement}</strong>
                        </div>

                        <div className="spec-item">
                            <span>Power</span>
                            <strong>{vehicle.power}</strong>
                        </div>

                        <div className="spec-item">
                            <span>Torque</span>
                            <strong>{vehicle.torque}</strong>
                        </div>

                        <div className="spec-item">
                            <span>Power / Weight</span>
                            <strong>{vehicle.powerWeight}</strong>
                        </div>
                    </div>
                </div>

                <div className="specs-right">
                    {vehicle.imageUrl && (
                        <img
                            src={vehicle.imageUrl}
                            alt={vehicle.name}
                            className="vehicle-image"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Specs;