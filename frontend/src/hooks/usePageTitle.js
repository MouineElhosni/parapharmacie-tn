import { useEffect } from "react";

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title
      ? `${title} | Parapharmacie.Tn`
      : "Parapharmacie.Tn – Parapharmacie en Ligne";
  }, [title]);
}
