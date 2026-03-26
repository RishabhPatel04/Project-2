import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import API_URL from "../../api";
import "./Admin.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name) {
    return name.split(/[\s_]+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, type }) {
    if (!msg) return null;
    return <div className={`adm-toast adm-toast-${type}`}>{msg}</div>;
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({ message, onConfirm, onCancel }) {
    return (
        <div className="adm-overlay" style={{ zIndex: 1100 }}>
            <div className="adm-confirm-box">
                <p className="adm-confirm-msg">{message}</p>
                <div className="adm-confirm-actions">
                    <button className="adm-btn-danger" onClick={onConfirm}>Confirm</button>
                    <button className="adm-btn-ghost" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

// ─── Slide Panel ──────────────────────────────────────────────────────────────

function SlidePanel({ title, icon, onClose, children }) {
    return (
        <div className="adm-overlay" onClick={onClose}>
            <div className="adm-panel" onClick={(e) => e.stopPropagation()}>
                <div className="adm-panel-header">
                    <div className="adm-panel-title-row">
                        <span className="adm-panel-icon">{icon}</span>
                        <h2 className="adm-panel-title">{title}</h2>
                    </div>
                    <button className="adm-panel-close" onClick={onClose}>✕</button>
                </div>
                <div className="adm-panel-body">{children}</div>
            </div>
        </div>
    );
}

// ─── Shared components ────────────────────────────────────────────────────────

function SearchBar({ value, onChange, placeholder }) {
    return (
        <div className="adm-search">
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

function AdminTable({ cols, rows, empty }) {
    return (
        <div className="adm-tbl-wrap">
            <table className="adm-table">
                <thead>
                    <tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr>
                </thead>
                <tbody>
                    {rows.length === 0
                        ? <tr><td colSpan={cols.length} className="adm-empty">{empty}</td></tr>
                        : rows}
                </tbody>
            </table>
        </div>
    );
}

function InlineForm({ fields, onSave, onCancel }) {
    const [form, setForm] = useState(
        Object.fromEntries(fields.map((f) => [f.key, f.initial || ""]))
    );
    return (
        <div className="adm-inline-form">
            {fields.map((f) => (
                <input
                    key={f.key}
                    placeholder={f.label}
                    type={f.type || "text"}
                    step={f.step}
                    value={form[f.key]}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                />
            ))}
            <div className="adm-form-btns">
                <button className="adm-btn-save" onClick={() => onSave(form)}>Save</button>
                <button className="adm-btn-ghost" onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
}

// ─── USERS PANEL ─────────────────────────────────────────────────────────────

function UsersPanel({ showToast, showConfirm }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetch(`${API_URL}/users`, { credentials: "include" })
            .then((r) => {
                if (r.status === 401) throw new Error("401 — not logged in");
                if (r.status === 403) throw new Error("403 — admin only");
                if (!r.ok) throw new Error(`Error ${r.status}`);
                return r.json();
            })
            .then(setUsers)
            .catch((e) => { setError(e.message); showToast(e.message, "error"); })
            .finally(() => setLoading(false));
    }, []);

    const patchRole = (userId, role) => {
        fetch(`${API_URL}/users/${userId}`, {
            method: "PATCH", credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role }),
        })
            .then((r) => { if (!r.ok) throw new Error("Update failed"); return r.json(); })
            .then((updated) => {
                setUsers((p) => p.map((u) => u.userId === updated.userId ? updated : u));
                showToast(`Role set to ${role}`);
            })
            .catch((e) => showToast(e.message, "error"));
    };

    const deleteUser = (userId) => {
        showConfirm("Permanently delete this user and all their data?", () => {
            fetch(`${API_URL}/users/${userId}`, { method: "DELETE", credentials: "include" })
                .then((r) => { if (!r.ok) throw new Error("Delete failed"); })
                .then(() => { setUsers((p) => p.filter((u) => u.userId !== userId)); showToast("User deleted"); })
                .catch((e) => showToast(e.message, "error"));
        });
    };

    const filtered = users.filter((u) =>
        `${u.username} ${u.email}`.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <p className="adm-loading">Loading users…</p>;
    if (error) return <p className="adm-error">{error}</p>;

    return (
        <>
            <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email…" />
            <AdminTable
                cols={["ID", "Username", "Email", "Provider", "Role", "Actions"]}
                empty="No users found."
                rows={filtered.map((u) => (
                    <tr key={u.userId}>
                        <td className="adm-td-id">{u.userId}</td>
                        <td className="adm-td-name">
                            <span className="adm-avatar">{initials(u.username)}</span>
                            {u.username}
                        </td>
                        <td className="adm-td-muted">{u.email}</td>
                        <td><span className={`adm-pill adm-pill-${u.provider}`}>{u.provider}</span></td>
                        <td><span className={`adm-pill adm-pill-${u.role?.toLowerCase()}`}>{u.role}</span></td>
                        <td>
                            <div className="adm-row-actions">
                                {u.role !== "ADMIN" && (
                                    <button className="adm-btn-promote" onClick={() => patchRole(u.userId, "ADMIN")}>▲ Promote</button>
                                )}
                                {u.role !== "USER" && (
                                    <button className="adm-btn-demote" onClick={() => patchRole(u.userId, "USER")}>▼ Demote</button>
                                )}
                                <button className="adm-btn-del" onClick={() => deleteUser(u.userId)}>✕</button>
                            </div>
                        </td>
                    </tr>
                ))}
            />
        </>
    );
}

// ─── TRACKS PANEL ─────────────────────────────────────────────────────────────

function TracksPanel({ showToast, showConfirm }) {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [showNew, setShowNew] = useState(false);

    const FIELDS = [
        { key: "name",      label: "Track Name" },
        { key: "layout",    label: "Layout" },
        { key: "country",   label: "Country" },
        { key: "region",    label: "Region (e.g. EU)" },
        { key: "lengthKm",  label: "Length (km)", type: "number", step: "0.001" },
    ];

    useEffect(() => {
        fetch(`${API_URL}/tracks`, { credentials: "include" })
            .then((r) => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json(); })
            .then(setTracks)
            .catch((e) => showToast(e.message, "error"))
            .finally(() => setLoading(false));
    }, []);

    const createTrack = (form) => {
        fetch(`${API_URL}/tracks`, {
            method: "POST", credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, lengthKm: parseFloat(form.lengthKm) }),
        })
            .then((r) => { if (!r.ok) throw new Error("Create failed"); return r.json(); })
            .then((t) => { setTracks((p) => [...p, t]); setShowNew(false); showToast("Track created"); })
            .catch((e) => showToast(e.message, "error"));
    };

    const updateTrack = (id, form) => {
        fetch(`${API_URL}/tracks/${id}`, {
            method: "PUT", credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, lengthKm: parseFloat(form.lengthKm) }),
        })
            .then((r) => { if (!r.ok) throw new Error("Update failed"); return r.json(); })
            .then((t) => { setTracks((p) => p.map((x) => x.trackId === id ? t : x)); setEditingId(null); showToast("Track updated"); })
            .catch((e) => showToast(e.message, "error"));
    };

    const deleteTrack = (id) => {
        showConfirm("Delete this track permanently?", () => {
            fetch(`${API_URL}/tracks/${id}`, { method: "DELETE", credentials: "include" })
                .then((r) => { if (!r.ok) throw new Error("Delete failed"); })
                .then(() => { setTracks((p) => p.filter((t) => t.trackId !== id)); showToast("Track deleted"); })
                .catch((e) => showToast(e.message, "error"));
        });
    };

    const filtered = tracks.filter((t) =>
        `${t.name} ${t.country} ${t.region}`.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <p className="adm-loading">Loading tracks…</p>;

    return (
        <>
            <div className="adm-panel-toolbar">
                <SearchBar value={search} onChange={setSearch} placeholder="Search tracks…" />
                <button className="adm-btn-add" onClick={() => { setShowNew(true); setEditingId(null); }}>+ Add Track</button>
            </div>
            {showNew && <InlineForm fields={FIELDS} onSave={createTrack} onCancel={() => setShowNew(false)} />}
            <AdminTable
                cols={["ID", "Name", "Layout", "Country", "Region", "Length", "Actions"]}
                empty="No tracks found."
                rows={filtered.flatMap((t) => [
                    <tr key={t.trackId}>
                        <td className="adm-td-id">{t.trackId}</td>
                        <td className="adm-td-name">{t.name}</td>
                        <td className="adm-td-muted">{t.layout}</td>
                        <td>{t.country}</td>
                        <td><span className="adm-pill adm-pill-region">{t.region}</span></td>
                        <td className="adm-td-muted">{t.lengthKm} km</td>
                        <td>
                            <div className="adm-row-actions">
                                <button className="adm-btn-edit" onClick={() => { setEditingId(t.trackId); setShowNew(false); }}>Edit</button>
                                <button className="adm-btn-del" onClick={() => deleteTrack(t.trackId)}>✕</button>
                            </div>
                        </td>
                    </tr>,
                    editingId === t.trackId && (
                        <tr key={`edit-${t.trackId}`} className="adm-edit-row">
                            <td colSpan={7} style={{ padding: 0 }}>
                                <InlineForm
                                    fields={FIELDS.map((f) => ({ ...f, initial: String(t[f.key] ?? "") }))}
                                    onSave={(form) => updateTrack(t.trackId, form)}
                                    onCancel={() => setEditingId(null)}
                                />
                            </td>
                        </tr>
                    ),
                ])}
            />
        </>
    );
}

// ─── CARS PANEL ───────────────────────────────────────────────────────────────

function CarsPanel({ showToast, showConfirm }) {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [showNew, setShowNew] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/vehicles`, { credentials: "include" })
            .then((r) => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json(); })
            .then(setCars)
            .catch((e) => showToast(e.message, "error"))
            .finally(() => setLoading(false));
    }, []);

    const createCar = (form) => {
        fetch(`${API_URL}/vehicles`, {
            method: "POST", credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        })
            .then((r) => { if (!r.ok) throw new Error("Create failed"); return r.json(); })
            .then((v) => { setCars((p) => [...p, v]); setShowNew(false); showToast("Vehicle created"); })
            .catch((e) => showToast(e.message, "error"));
    };

    const updateCar = (id, form) => {
        fetch(`${API_URL}/vehicles/${id}`, {
            method: "PUT", credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        })
            .then((r) => { if (!r.ok) throw new Error("Update failed"); return r.json(); })
            .then((v) => { setCars((p) => p.map((x) => x.vehicleId === id ? v : x)); setEditingId(null); showToast("Vehicle updated"); })
            .catch((e) => showToast(e.message, "error"));
    };

    const deleteCar = (id) => {
        showConfirm("Delete this vehicle permanently?", () => {
            fetch(`${API_URL}/vehicles/${id}`, { method: "DELETE", credentials: "include" })
                .then((r) => { if (!r.ok) throw new Error("Delete failed"); })
                .then(() => { setCars((p) => p.filter((c) => c.vehicleId !== id)); showToast("Vehicle deleted"); })
                .catch((e) => showToast(e.message, "error"));
        });
    };

    const filtered = cars.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

    if (loading) return <p className="adm-loading">Loading vehicles…</p>;

    return (
        <>
            <div className="adm-panel-toolbar">
                <SearchBar value={search} onChange={setSearch} placeholder="Search vehicles…" />
                <button className="adm-btn-add" onClick={() => { setShowNew(true); setEditingId(null); }}>+ Add Vehicle</button>
            </div>
            {showNew && (
                <InlineForm
                    fields={[{ key: "name", label: "Vehicle Name (e.g. Ferrari SF25)" }]}
                    onSave={createCar}
                    onCancel={() => setShowNew(false)}
                />
            )}
            <AdminTable
                cols={["ID", "Vehicle Name", "Actions"]}
                empty="No vehicles found."
                rows={filtered.flatMap((v) => [
                    <tr key={v.vehicleId}>
                        <td className="adm-td-id">{v.vehicleId}</td>
                        <td className="adm-td-name">{v.name}</td>
                        <td>
                            <div className="adm-row-actions">
                                <button className="adm-btn-edit" onClick={() => { setEditingId(v.vehicleId); setShowNew(false); }}>Edit</button>
                                <button className="adm-btn-del" onClick={() => deleteCar(v.vehicleId)}>✕</button>
                            </div>
                        </td>
                    </tr>,
                    editingId === v.vehicleId && (
                        <tr key={`edit-${v.vehicleId}`} className="adm-edit-row">
                            <td colSpan={3} style={{ padding: 0 }}>
                                <InlineForm
                                    fields={[{ key: "name", label: "Vehicle Name", initial: v.name }]}
                                    onSave={(form) => updateCar(v.vehicleId, form)}
                                    onCancel={() => setEditingId(null)}
                                />
                            </td>
                        </tr>
                    ),
                ])}
            />
        </>
    );
}

// ─── COUNTRIES PANEL ──────────────────────────────────────────────────────────

function CountriesPanel({ showToast }) {
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showNew, setShowNew] = useState(false);

    const CONTINENTS = ["North America", "South America", "Europe", "Africa", "APAC", "Australia"];

    useEffect(() => {
        Promise.all(
            CONTINENTS.map((cont) =>
                fetch(`${API_URL}/continents/${encodeURIComponent(cont)}/countries`, { credentials: "include" })
                    .then((r) => r.ok ? r.json() : [])
                    .then((list) => list.map((c) => ({ ...c, continent: cont })))
                    .catch(() => [])
            )
        )
            .then((results) => setCountries(results.flat()))
            .finally(() => setLoading(false));
    }, []);

    const createCountry = (form) => {
        fetch(`${API_URL}/tracks`, {
            method: "POST", credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ country: form.name, region: form.continent, name: "Placeholder Track", layout: "TBD", lengthKm: 0 }),
        })
            .then((r) => { if (!r.ok) throw new Error("Create failed"); return r.json(); })
            .then(() => { setCountries((p) => [...p, { name: form.name, continent: form.continent }]); setShowNew(false); showToast("Country added"); })
            .catch((e) => showToast(e.message, "error"));
    };

    const filtered = countries.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()));

    if (loading) return <p className="adm-loading">Loading countries…</p>;

    return (
        <>
            <div className="adm-panel-toolbar">
                <SearchBar value={search} onChange={setSearch} placeholder="Search countries…" />
                <button className="adm-btn-add" onClick={() => setShowNew(true)}>+ Add Country</button>
            </div>
            {showNew && (
                <InlineForm
                    fields={[
                        { key: "name", label: "Country Name" },
                        { key: "continent", label: "Continent (e.g. EU, APAC)" },
                    ]}
                    onSave={createCountry}
                    onCancel={() => setShowNew(false)}
                />
            )}
            <AdminTable
                cols={["Country", "Continent"]}
                empty="No countries found."
                rows={filtered.map((c, i) => (
                    <tr key={`${c.name}-${i}`}>
                        <td className="adm-td-name">{c.name}</td>
                        <td><span className="adm-pill adm-pill-region">{c.continent}</span></td>
                    </tr>
                ))}
            />
        </>
    );
}

// ─── CONTINENTS PANEL ─────────────────────────────────────────────────────────

function ContinentsPanel({ showToast }) {
    const [continents, setContinents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/continents`, { credentials: "include" })
            .then((r) => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json(); })
            .then(setContinents)
            .catch((e) => showToast(e.message, "error"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="adm-loading">Loading continents…</p>;

    return (
        <AdminTable
            cols={["Continent", "Country Count"]}
            empty="No continents found."
            rows={continents.map((c) => (
                <tr key={c.name}>
                    <td className="adm-td-name">{c.name}</td>
                    <td className="adm-td-muted">{c.countryCount} countries</td>
                </tr>
            ))}
        />
    );
}

// ─── Dashboard section definitions ────────────────────────────────────────────

const SECTIONS = [
    { id: "users",      label: "Users",      icon: "👤", desc: "Manage accounts, roles & permissions" },
    { id: "tracks",     label: "Tracks",     icon: "🏁", desc: "Add, edit and remove racing circuits" },
    { id: "cars",       label: "Cars",       icon: "🚗", desc: "Manage the vehicle database" },
    { id: "countries",  label: "Countries",  icon: "🌍", desc: "View and add countries by region" },
    { id: "continents", label: "Continents", icon: "🗺️", desc: "Overview of continents & country counts" },
];

// ─── MAIN ADMIN ───────────────────────────────────────────────────────────────

function Admin() {
    const navigate = useNavigate();
    const [activePanel, setActivePanel] = useState(null);
    const [toast, setToast] = useState(null);
    const [confirm, setConfirm] = useState(null);

    const showToast = useCallback((msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const showConfirm = useCallback((message, onConfirm) => {
        setConfirm({ message, onConfirm });
    }, []);

    const activeSection = SECTIONS.find((s) => s.id === activePanel);

    return (
        <div className="adm-wrapper">
            {toast && <Toast msg={toast.msg} type={toast.type} />}

            {confirm && (
                <ConfirmModal
                    message={confirm.message}
                    onConfirm={() => { confirm.onConfirm(); setConfirm(null); }}
                    onCancel={() => setConfirm(null)}
                />
            )}

            {activePanel && activeSection && (
                <SlidePanel title={activeSection.label} icon={activeSection.icon} onClose={() => setActivePanel(null)}>
                    {activePanel === "users"      && <UsersPanel      showToast={showToast} showConfirm={showConfirm} />}
                    {activePanel === "tracks"     && <TracksPanel     showToast={showToast} showConfirm={showConfirm} />}
                    {activePanel === "cars"       && <CarsPanel       showToast={showToast} showConfirm={showConfirm} />}
                    {activePanel === "countries"  && <CountriesPanel  showToast={showToast} showConfirm={showConfirm} />}
                    {activePanel === "continents" && <ContinentsPanel showToast={showToast} />}
                </SlidePanel>
            )}

            {/* Navbar */}
            <div className="adm-navbar">
                <div className="adm-logo">MotoRYX<span className="adm-dot">.</span></div>
                <div className="adm-nav-right">
                    <span className="adm-badge">ADMIN</span>
                    <Link to="/continents" className="adm-nav-link">Dashboard</Link>
                    <Link to="/profile" className="adm-nav-link">Profile</Link>
                    <button className="adm-logout-btn" onClick={() => navigate("/")}>Log Out</button>
                </div>
            </div>

            {/* Page header */}
            <div className="adm-page-header">
                <p className="adm-page-label">Control Panel</p>
                <h1 className="adm-page-title">Admin Dashboard</h1>
                <p className="adm-page-sub">Select a section to manage your data.</p>
            </div>

            {/* Section cards */}
            <div className="adm-grid">
                {SECTIONS.map((s) => (
                    <button key={s.id} className="adm-card" onClick={() => setActivePanel(s.id)}>
                        <span className="adm-card-icon">{s.icon}</span>
                        <h3 className="adm-card-title">{s.label}</h3>
                        <p className="adm-card-desc">{s.desc}</p>
                        <span className="adm-card-arrow">→</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default Admin;
