import { useEffect, useState } from "react";
import API, { productImage } from "../services/api";
import { ORDER_STATUSES, STATUS_LABELS, statusColors } from "../utils/status";
import { waLinkTo, STORE_NAME } from "../config";

function StatCard({ label, value, icon, accent }) {
  return (
    <div className="bg-white shadow rounded-2xl p-6 flex items-center gap-5">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-400 text-sm font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function Admin() {
  const [tab, setTab] = useState("dashboard");
  const [message, setMessage] = useState({ type: "", text: "" });

  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  // Product form state
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const loadStats = () => {
    API.get("/admin/stats")
      .then((res) => setStats(res.data))
      .catch(() => showMessage("error", "Échec du chargement du tableau de bord"));
  };

  const loadProducts = () => {
    API.get("/products?limit=200")
      .then((res) => setProducts(res.data.products))
      .catch(() => showMessage("error", "Échec du chargement des produits"));
  };

  const loadOrders = () => {
    API.get("/orders")
      .then((res) => setOrders(res.data))
      .catch(() => showMessage("error", "Échec du chargement des commandes"));
  };

  const loadUsers = () => {
    API.get("/users")
      .then((res) => setUsers(res.data))
      .catch(() => showMessage("error", "Échec du chargement des utilisateurs"));
  };

  useEffect(() => {
    if (tab === "dashboard") loadStats();
    if (tab === "products") loadProducts();
    if (tab === "orders") loadOrders();
    if (tab === "users") loadUsers();
  }, [tab]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", stock: "", category: "" });
    setImageFile(null);
    setEditingId(null);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || "",
      price: p.price,
      stock: p.stock,
      category: p.category || "",
    });
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    const fd = new FormData();
    fd.append("image", imageFile);

    const res = await API.post("/products/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.filename;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const image = imageFile ? await uploadImage() : editingId ? undefined : null;
      const payload = {
        name: form.name,
        description: form.description,
        price: form.price,
        stock: form.stock || 0,
        category: form.category,
        ...(image ? { image } : {}),
      };

      if (editingId) {
        if (image === undefined) {
          const current = products.find((p) => p.id === editingId);
          payload.image = current?.image || null;
        }
        await API.put(`/products/${editingId}`, payload);
        showMessage("success", "Produit mis à jour avec succès");
      } else {
        payload.image = image;
        await API.post("/products", payload);
        showMessage("success", "Produit créé avec succès");
      }

      resetForm();
      loadProducts();
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer définitivement ce produit ?")) return;

    try {
      await API.delete(`/products/${id}`);
      showMessage("success", "Produit supprimé");
      loadProducts();
      if (editingId === id) resetForm();
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Échec de la suppression");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await API.put(`/orders/${id}/status`, { status });
      showMessage("success", `Commande #${id} marquée : ${status}`);
      loadOrders();
      if (tab === "dashboard") loadStats();
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Échec de la mise à jour du statut");
    }
  };

  const handleRoleChange = async (id, name, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!window.confirm(`Rendre "${name}" ${newRole === "admin" ? "administrateur" : "utilisateur"} ?`)) return;

    try {
      await API.put(`/users/${id}/role`, { role: newRole });
      showMessage("success", `${name} est maintenant ${newRole === "admin" ? "administrateur" : "utilisateur"}`);
      loadUsers();
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Échec de la mise à jour du rôle");
    }
  };

  const tabs = [
    { id: "dashboard", label: "Tableau de bord" },
    { id: "products", label: "Produits" },
    { id: "orders", label: "Commandes" },
    { id: "users", label: "Utilisateurs" },
  ];

  const inputClass =
    "border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Tableau de bord Admin</h1>

      {/* Tabs */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              tab === t.id ? "bg-emerald-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {message.text && (
        <div
          className={`mb-6 rounded-lg px-4 py-3 font-semibold ${
            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ===================== DASHBOARD ===================== */}
      {tab === "dashboard" && (
        <div>
          {!stats ? (
            <p className="text-center text-gray-400 py-10">Chargement du tableau de bord...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  label="Produits"
                  value={stats.totalProducts}
                  icon="📦"
                  accent="bg-emerald-50"
                />
                <StatCard
                  label="Commandes"
                  value={stats.totalOrders}
                  icon="🧾"
                  accent="bg-purple-50"
                />
                <StatCard
                  label="Revenus"
                  value={`${Number(stats.totalRevenue).toFixed(2)} DT`}
                  icon="💰"
                  accent="bg-green-50"
                />
                <StatCard
                  label="Clients"
                  value={stats.totalUsers}
                  icon="👥"
                  accent="bg-amber-50"
                />
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent orders */}
                <div className="bg-white shadow-xl rounded-2xl p-6">
                  <h2 className="text-xl font-bold mb-5">Commandes récentes</h2>
                  {stats.recentOrders.length === 0 ? (
                    <p className="text-gray-400 text-center py-6">Aucune commande.</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.recentOrders.map((o) => (
                        <div
                          key={o.id}
                          className="flex justify-between items-center border-b pb-3"
                        >
                          <div>
                            <p className="font-semibold">#{o.id} · {o.customer_name}</p>
                            <p className="text-sm text-gray-400">{new Date(o.created_at).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-600">{Number(o.total).toFixed(2)} DT</p>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full uppercase ${statusColors[o.status]}`}>
                              {STATUS_LABELS[o.status] || o.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Low stock */}
                <div className="bg-white shadow-xl rounded-2xl p-6">
                  <h2 className="text-xl font-bold mb-5">Alerte stock faible</h2>
                  {stats.lowStock.length === 0 ? (
                    <p className="text-green-600 font-semibold text-center py-6">
                      ✅ Tous les produits sont bien approvisionnés
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {stats.lowStock.map((p) => (
                        <div
                          key={p.id}
                          className="flex justify-between items-center border-b pb-3"
                        >
                          <p className="font-semibold">{p.name}</p>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            p.stock === 0 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                          }`}>
                            {p.stock} restant(s)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ===================== PRODUCTS ===================== */}
      {tab === "products" && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-white shadow-xl rounded-2xl p-6 h-fit lg:sticky lg:top-24">
            <h2 className="text-xl font-bold mb-5">
              {editingId ? `Modifier le produit #${editingId}` : "Ajouter un produit"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                placeholder="Nom du produit"
                value={form.name}
                onChange={handleChange}
                className={inputClass}
                required
              />
              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                className={`${inputClass} h-24`}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="Prix (DT)"
                  value={form.price}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  min="0.01"
                />
                <input
                  name="stock"
                  type="number"
                  placeholder="Stock"
                  value={form.stock}
                  onChange={handleChange}
                  className={inputClass}
                  min="0"
                />
              </div>
              <input
                name="category"
                placeholder="Catégorie"
                value={form.category}
                onChange={handleChange}
                className={inputClass}
              />
              <div>
                <label className="block text-sm text-gray-500 mb-2">Image du produit</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-sm text-gray-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {submitting ? "Enregistrement..." : editingId ? "Mettre à jour" : "Ajouter le produit"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-200 text-gray-700 px-4 rounded-lg hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">Tous les produits ({products.length})</h2>
              <button
                onClick={loadProducts}
                className="bg-gray-100 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200"
              >
                Actualiser
              </button>
            </div>

            {products.length === 0 && (
              <p className="text-center text-gray-400 py-10 bg-white rounded-2xl shadow">
                Aucun produit.
              </p>
            )}

            {products.map((p) => {
              const image = productImage(p.image);
              return (
                <div key={p.id} className="bg-white shadow rounded-2xl p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                      {image ? (
                        <img src={image} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl text-gray-300">📦</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold">{p.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{p.description}</p>
                      <p className="text-sm mt-1">
                        <span className="text-emerald-600 font-bold">{Number(p.price).toFixed(2)} DT</span>
                        <span className="text-gray-400 ml-3">Stock : {p.stock}</span>
                        {p.category && (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full ml-3">
                            {p.category}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => startEdit(p)}
                      className="flex-1 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 font-semibold"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 font-semibold"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================== ORDERS ===================== */}
      {tab === "orders" && (
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <h2 className="text-xl font-bold">Toutes les commandes ({orders.length})</h2>
            <button
              onClick={loadOrders}
              className="bg-gray-100 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200"
            >
              Actualiser
            </button>
          </div>

          {orders.length === 0 ? (
            <p className="text-center text-gray-400 py-12">Aucune commande.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-sm">
                  <tr>
                    <th className="px-6 py-4">Commande</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Articles</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="px-6 py-4 font-bold">#{o.id}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold">{o.customer_name}</p>
                        <p className="text-sm text-gray-400">{o.customer_email}</p>
                        <p className="text-sm text-gray-400">{o.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        {o.items && o.items.length > 0 ? (
                          <div className="space-y-1">
                            {o.items.map((it) => (
                              <div key={it.product_id} className="text-sm">
                                <span className="font-medium">{it.product_name || `Produit #${it.product_id}`}</span>
                                <span className="text-gray-400"> × {it.quantity}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-emerald-600">
                        {Number(o.total).toFixed(2)} DT
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className={`text-xs font-semibold px-3 py-1 rounded-full uppercase border-0 cursor-pointer focus:outline-none ${statusColors[o.status]}`}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(o.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={waLinkTo(
                            o.phone,
                            `Bonjour ${o.customer_name}, c'est ${STORE_NAME} à propos de votre commande #${o.id}.`
                          )}
                          target="_blank"
                          rel="noreferrer"
                          title="Contacter sur WhatsApp"
                          className="bg-[#25D366] text-white px-3 py-2 rounded-lg hover:bg-[#1ebe5b] font-semibold text-sm"
                        >
                          💬 WhatsApp
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===================== USERS ===================== */}
      {tab === "users" && (
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <h2 className="text-xl font-bold">Utilisateurs ({users.length})</h2>
            <button
              onClick={loadUsers}
              className="bg-gray-100 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200"
            >
              Actualiser
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Nom</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Rôle</th>
                  <th className="px-6 py-4">Inscrit le</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 font-bold">#{u.id}</td>
                    <td className="px-6 py-4 font-semibold">{u.name}</td>
                    <td className="px-6 py-4 text-gray-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full uppercase ${
                        u.role === "admin" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-600"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleRoleChange(u.id, u.name, u.role)}
                        className={
                          u.role === "admin"
                            ? "bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 font-semibold text-sm"
                            : "bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 font-semibold text-sm"
                        }
                      >
                        {u.role === "admin" ? "Retirer admin" : "Nommer admin"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
