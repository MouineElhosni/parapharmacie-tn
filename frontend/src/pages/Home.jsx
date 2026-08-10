import Hero from "../components/Hero";
import CategoryCard from "../components/CategoryCard";
import ProductSection from "../components/ProductSection";
import TrustBadges from "../components/TrustBadges";
import Newsletter from "../components/Newsletter";
import PromoBanner from "../components/PromoBanner";
import { useEffect, useState } from "react";
import API from "../services/api";
import usePageTitle from "../hooks/usePageTitle";

function Home() {
  const [categories, setCategories] = useState([]);

  usePageTitle("");

  useEffect(() => {
    API.get("/products/categories")
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  return (
    <div>
      <PromoBanner />
      <Hero />

      <TrustBadges />

      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">
            Nos catégories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <CategoryCard key={category} category={category} />
            ))}
          </div>
        </section>
      )}

      <ProductSection />

      <Newsletter />
    </div>
  );
}

export default Home;
