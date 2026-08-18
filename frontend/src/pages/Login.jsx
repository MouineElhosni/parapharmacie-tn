import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import usePageTitle from "../hooks/usePageTitle";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  usePageTitle("Connexion");

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data.user, res.data.token);
      showToast(`Bon retour, ${res.data.user.name} !`);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Échec de la connexion");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "border border-gray-300 w-full p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400";

  return (
    <div className="flex justify-center py-16 px-4">
      <div className="bg-white shadow-xl p-8 rounded-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2">Bon retour !</h1>
        <p className="text-gray-500 mb-6">Connectez-vous à votre compte</p>

        {error && (
          <p className="bg-red-50 text-red-600 rounded-lg px-4 py-2 mb-4 text-sm">{error}</p>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className={inputClass}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className={inputClass}
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-brand-800 text-white w-full py-3 rounded-lg font-semibold hover:bg-brand-900 transition disabled:opacity-50"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-5 text-sm text-center text-gray-500">
          Accès réservé à l'administration Parapharmacie.Tn.
        </p>
      </div>
    </div>
  );
}

export default Login;
