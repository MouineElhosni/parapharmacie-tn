import { useState } from "react";
import { useToast } from "../context/ToastContext";

function Newsletter() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    showToast("Merci ! Vous êtes inscrit(e) à notre newsletter.");
    setEmail("");
  };

  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-10 text-center text-white shadow-xl">
        <h2 className="text-3xl font-bold">Restez au courant</h2>
        <p className="mt-3 text-emerald-100">
          Promotions exclusives, nouveautés et conseils bien-être dans votre boîte mail.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre adresse email"
            className="flex-1 px-4 py-3 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
          <button className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition">
            S'inscrire
          </button>
        </form>
      </div>
    </section>
  );
}

export default Newsletter;
