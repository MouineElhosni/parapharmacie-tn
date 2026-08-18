import { Link } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle";

function NotFound() {
  usePageTitle("Page introuvable");

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <p className="text-8xl font-bold text-brand-100">404</p>
      <h1 className="text-3xl font-bold text-gray-800 mt-4">Page introuvable</h1>
      <p className="text-gray-500 mt-3">
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <Link
        to="/"
        className="mt-8 bg-brand-800 text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-900 transition"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}

export default NotFound;
