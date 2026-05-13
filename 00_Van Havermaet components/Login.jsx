import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const VH = {
  bg: "#faf8f4",
  white: "#ffffff",
  sand: "#cbbba0",
  sandLight: "#e8dfcf",
  brown: "#7b6a58",
  charcoal: "#3c3c3b",
  charcoalLight: "#5a5a59",
  border: "#e2ddd5",
};

export default function Login() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in → go straight to the app.
  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: authError } = await signIn(email, password);
      if (authError) {
        // Geen onderscheid tussen "user not found" en "wrong password" — voorkomt
        // user enumeration attacks.
        setError("Onjuist e-mailadres of wachtwoord.");
      } else {
        navigate("/", { replace: true });
      }
    } catch (e) {
      console.error("[login] unexpected error", e);
      setError("Er ging iets mis. Controleer je internetverbinding en probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: VH.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "var(--font-body)",
      }}
    >
      <div
        style={{
          background: VH.white,
          border: `1px solid ${VH.border}`,
          borderRadius: 14,
          padding: "40px 44px",
          width: "100%",
          maxWidth: 400,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img
            src="/vh-logo.svg"
            alt="Van Havermaet"
            style={{ height: 36, marginBottom: 20 }}
          />
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 20,
              fontWeight: 600,
              color: VH.charcoal,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Family Office Tools
          </h1>
          <p
            style={{
              fontSize: 13,
              color: VH.charcoalLight,
              marginTop: 6,
              marginBottom: 0,
            }}
          >
            Meld aan om verder te gaan
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              htmlFor="email"
              style={{ fontSize: 13, fontWeight: 600, color: VH.charcoal }}
            >
              E-mailadres
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: "10px 12px",
                border: `1px solid ${error ? "#c0392b" : VH.border}`,
                borderRadius: 8,
                fontSize: 14,
                fontFamily: "var(--font-body)",
                color: VH.charcoal,
                background: VH.bg,
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              htmlFor="password"
              style={{ fontSize: 13, fontWeight: 600, color: VH.charcoal }}
            >
              Wachtwoord
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: "10px 12px",
                border: `1px solid ${error ? "#c0392b" : VH.border}`,
                borderRadius: 8,
                fontSize: 14,
                fontFamily: "var(--font-body)",
                color: VH.charcoal,
                background: VH.bg,
                outline: "none",
              }}
            />
          </div>

          {error && (
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "#c0392b",
                background: "#fdf2f2",
                border: "1px solid #f5c6c6",
                borderRadius: 6,
                padding: "8px 12px",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              padding: "11px 0",
              background: loading ? VH.sandLight : VH.brown,
              color: VH.white,
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "var(--font-body)",
              cursor: loading ? "default" : "pointer",
              transition: "background 0.15s",
              letterSpacing: "0.01em",
            }}
          >
            {loading ? "Aanmelden…" : "Aanmelden"}
          </button>
        </form>
      </div>
    </div>
  );
}
