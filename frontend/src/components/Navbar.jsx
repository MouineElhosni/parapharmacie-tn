import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

  const linkClass = "hover:text-emerald-600 transition";
  const mobileLinkClass = "block px-4 py-2 hover:bg-emerald-50 rounded-lg";

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <img
            src="/logo.jpeg"
            alt="Parapharmacie.Tn"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-100"
          />
          <span className="text-emerald-600 text-xl">Parapharmacie</span>
          <span className="text-gray-900 text-xl">.Tn</span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex gap-6 text-gray-700 font-medium items-center">
          <Link to="/" className={linkClass}>
            Accueil
          </Link>
          <Link to="/shop" className={linkClass}>
            Boutique
          </Link>
          <Link to="/about" className={linkClass}>
            À propos
          </Link>
          <Link to="/contact" className={linkClass}>
            Contact
          </Link>
          {isAdmin && (
            <Link to="/admin" className={linkClass}>
              Admin
            </Link>
          )}

          <a
            href={waLinkStore("Bonjour 👋")}
            target="_blank"
            rel="noreferrer"
            className={`${linkClass} relative`}
            title="Commander sur WhatsApp"
          >
            💬
          </a>

          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/account" className="text-emerald-600">
                {user.name}
              </Link>
              <button onClick={handleLogout} className="hover:text-red-600 transition">
                Déconnexion
              </button>
            </div>
          ) : (
            <Link to="/login" className={linkClass}>
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
          <Link to="/" className={mobileLinkClass} onClick={() => setOpen(false)}>
            Accueil
          </Link>
          <Link to="/shop" className={mobileLinkClass} onClick={() => setOpen(false)}>
            Boutique
          </Link>
          <Link to="/about" className={mobileLinkClass} onClick={() => setOpen(false)}>
            À propos
          </Link>
          <Link to="/contact" className={mobileLinkClass} onClick={() => setOpen(false)}>
            Contact
          </Link>
          {isAdmin && (
            <Link to="/admin" className={mobileLinkClass} onClick={() => setOpen(false)}>
              Admin
            </Link>
          )}
          <a
            href={waLinkStore("Bonjour 👋")}
            target="_blank"
            rel="noreferrer"
            className={mobileLinkClass}
            onClick={() => setOpen(false)}
          >
            Commander sur WhatsApp 💬
          </a>

          {user ? (
            <div className="px-4 py-2">
              <Link to="/account" className="text-emerald-600" onClick={() => setOpen(false)}>
                Mon compte
              </Link>
              <button onClick={handleLogout} className="block mt-2 text-red-600">
                Déconnexion
              </button>
            </div>
          ) : (
            <Link to="/login" className={mobileLinkClass} onClick={() => setOpen(false)}>
              Connexion
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
