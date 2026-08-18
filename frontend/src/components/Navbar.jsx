import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { waLinkStore } from "../config";

function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `transition hover:text-brand-800 ${isActive ? "text-brand-800 font-semibold" : ""}`;
  const mobileNavLinkClass = ({ isActive }) =>
    `block px-4 py-2 hover:bg-gold-50 rounded-lg ${isActive ? "bg-gold-50 text-brand-800 font-semibold" : ""}`;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <img
            src="/logo.jpeg"
            alt="Parapharmacie.Tn"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gold-200"
          />
          <span className="text-brand-800 text-xl">Parapharmacie</span>
          <span className="text-gray-900 text-xl">.Tn</span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex gap-6 text-gray-700 font-medium items-center">
          <NavLink to="/" end className={navLinkClass}>
            Accueil
          </NavLink>
          <NavLink to="/shop" className={navLinkClass}>
            Boutique
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            À propos
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            Contact
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}

          <a
            href={waLinkStore("Bonjour 👋")}
            target="_blank"
            rel="noreferrer"
            className={`transition hover:text-brand-800 relative`}
            title="Commander sur WhatsApp"
          >
            💬
          </a>

          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to="/account"
                className="bg-brand-800 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-brand-900 transition"
              >
                Profil
              </Link>
              <button onClick={handleLogout} className="hover:text-red-600 transition">
                Déconnexion
              </button>
            </div>
          ) : (
            <Link to="/login" className="transition hover:text-brand-800">
              Connexion
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-2xl text-gray-700"
          aria-label="Ouvrir le menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 py-2 text-gray-700 font-medium">
          <NavLink to="/" end className={mobileNavLinkClass} onClick={() => setOpen(false)}>
            Accueil
          </NavLink>
          <NavLink to="/shop" className={mobileNavLinkClass} onClick={() => setOpen(false)}>
            Boutique
          </NavLink>
          <NavLink to="/about" className={mobileNavLinkClass} onClick={() => setOpen(false)}>
            À propos
          </NavLink>
          <NavLink to="/contact" className={mobileNavLinkClass} onClick={() => setOpen(false)}>
            Contact
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={mobileNavLinkClass} onClick={() => setOpen(false)}>
              Admin
            </NavLink>
          )}
          <a
            href={waLinkStore("Bonjour 👋")}
            target="_blank"
            rel="noreferrer"
            className="block px-4 py-2 hover:bg-gold-50 rounded-lg"
            onClick={() => setOpen(false)}
          >
            Commander sur WhatsApp 💬
          </a>

          {user ? (
            <div className="px-4 py-3 space-y-2">
              <Link
                to="/account"
                onClick={() => setOpen(false)}
                className="block text-center bg-brand-800 text-white font-bold py-3 rounded-xl hover:bg-brand-900"
              >
                Profil
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-center text-red-600 font-semibold py-3 rounded-xl bg-red-50 hover:bg-red-100"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <Link to="/login" className="block px-4 py-2 hover:bg-gold-50 rounded-lg" onClick={() => setOpen(false)}>
              Connexion
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
