import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { productImage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { STATUS_LABELS, statusColors } from "../utils/status";
import usePageTitle from "../hooks/usePageTitle";

function Account() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwd, setPwd] = useState({ current_password: "", new_password: "" });
  const [pwdLoading, setPwdLoading] = useState(false);

  usePageTitle("Mon compte");

  useEffect(() => {
    API.get("/orders/my")
      .then((res) => setOrders(res.data))
      .catch(() => showToast("Impossible de charger vos commandes", "error"))
      .finally(() => setOrdersLoading(false));
  }, []);

  const handleProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await API.put("/users/profile", profile);
      updateUser(res.data.user);
      showToast("Profil mis à jour");
    } catch (err) {
      showToast(err.response?.data?.message || "Échec de la mise à jour", "error");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setPwdLoading(true);
    try {
      await API.put("/users/password", pwd);
      showToast("Mot de passe modifié");
      setPwd({ current_password: "", new_password: "" });
    } catch (err) {
      showToast(err.response?.data?.message || "Échec du changement", "error");
    } finally {
      setPwdLoading(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  const tabs = [
    { id: "orders", label: "Mes commandes" },
    { id: "profile", label: "Mon profil" },
  ];

  const inputClass =
    "border border-gray-300 w-full p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">Bonjour, {user.name} 👋</h1>

      <div className="flex gap-3 mb-8 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              tab === t.id
                ? "bg-emerald-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 shadow"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ============ ORDERS ============ */}
      {tab === "orders" && (
        <div className="space-y-6">
          {ordersLoading ? (
            <p className="text-center text-gray-400 py-10">Chargement...</p>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-10 text-center">
              <p className="text-gray-500">Vous n'avez pas encore de commandes.</p>
              <button
                onClick={() => navigate("/shop")}
                className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
              >
                Découvrir la boutique
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-wrap justify-between items-center gap-3 border-b pb-4">
                  <div>
                    <p className="font-bold text-lg">Commande #{order.id}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full uppercase ${statusColors[order.status]}`}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                    <p className="text-emerald-600 font-bold mt-1">
                      {Number(order.total).toFixed(2)} DT
                      <span className="text-gray-400 text-sm font-normal ml-2">
                        Paiement à la livraison
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                          {productImage(item.product_image) ? (
                            <img
                              src={productImage(item.product_image)}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>🌿</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{item.product_name || `Produit #${item.product_id}`}</p>
                          <p className="text-sm text-gray-500">Qté : {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-semibold">
                        {(Number(item.price) * item.quantity).toFixed(2)} DT
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t text-sm text-gray-500">
                  📍 {order.address} · 📞 {order.phone}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ============ PROFILE ============ */}
      {tab === "profile" && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow p-8">
            <h2 className="text-xl font-bold mb-5">Mes informations</h2>
            <form onSubmit={handleProfile}>
              <input
                type="text"
                placeholder="Nom complet"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className={inputClass}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className={inputClass}
                required
              />
              <button
                type="submit"
                disabled={profileLoading}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {profileLoading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow p-8">
            <h2 className="text-xl font-bold mb-5">Changer le mot de passe</h2>
            <form onSubmit={handlePassword}>
              <input
                type="password"
                placeholder="Mot de passe actuel"
                value={pwd.current_password}
                onChange={(e) => setPwd({ ...pwd, current_password: e.target.value })}
                className={inputClass}
                required
              />
              <input
                type="password"
                placeholder="Nouveau mot de passe (6 caractères minimum)"
                value={pwd.new_password}
                onChange={(e) => setPwd({ ...pwd, new_password: e.target.value })}
                className={inputClass}
                required
                minLength={6}
              />
              <button
                type="submit"
                disabled={pwdLoading}
                className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition disabled:opacity-50"
              >
                {pwdLoading ? "Modification..." : "Modifier le mot de passe"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Account;
