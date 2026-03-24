import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API_URL from "../../api";
import "./Track.css";
import fujiTrack from "../../assets/Circuit/fujiTrack.png";
import suzukaTrack from "../../assets/Circuit/suzukaTrack.png";
import twinTrack from "../../assets/Circuit/twinTrack.png";

// track images
const trackMap = {
    "Fuji Speedway": fujiTrack,
    "Suzuka": suzukaTrack,
    "Twin Ring Motegi": twinTrack,
};

function Track() {
    const { continentName, countryName } = useParams();
    const navigate = useNavigate();

    const [tracks, setTracks] = useState([]);
    const [search, setSearch] = useState("");

    // fetch tracks and filter by country
    useEffect(() => {
        fetch(`${API_URL}/tracks`)
            .then((res) => res.json())
            .then((data) => {
                const filtered = data.filter(
                    (track) =>
                        track.country.toLowerCase() ===
                        countryName.toLowerCase()
                );

                setTracks(filtered);
            })
            .catch((err) =>
                console.error("error fetching tracks:", err)
            );
    }, [countryName]);

    // navigate to vehicle page
    const handleTrackClick = (trackId) => {
        navigate(
            `/continents/${continentName}/${countryName}/${trackId}`
        );
    };

    // filter tracks by search input
    const filteredTracks = tracks.filter((track) =>
        track.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="track-wrapper">
            {/* navbar */}
            <div className="navbar">
                <div className="logo-row">
                    <span className="logo">
                        MotoRYX<span className="dot">.</span>
                    </span>
                    <span className="nav-location">
                        {decodeURIComponent(countryName)}
                    </span>
                </div>

                <div className="nav-links">
                    <Link to="/profile">Profile</Link>
                    <button
                        className="logout-btn"
                        onClick={() => navigate("/")}
                    >
                        Log Out
                    </button>
                </div>
            </div>

            {/* header */}
            <div className="header">
                <p className="page-label">Choose Your Track</p>

                <button
                    className="back-btn"
                    onClick={() =>
                        navigate(`/continents/${continentName}`)
                    }
                >
                    ← Return To Country
                </button>
            </div>

            {/* search */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search For Track"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* track grid */}
            <div className="track-grid">
                {filteredTracks.map((track) => (
                    <div
                        key={track.trackId}
                        className="track-card"
                        onClick={() => handleTrackClick(track.trackId)}
                        style={{
                            backgroundImage: `url(${trackMap[track.name]})`
                        }}
                    >
                        <h3 className="track-title">{track.name}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Track;