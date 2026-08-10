function StarRating({ value = 0, onChange, size = "text-lg" }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={`flex items-center gap-1 ${size}`}>
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          disabled={!onChange}
          onClick={onChange ? () => onChange(s) : undefined}
          className={`${
            onChange ? "cursor-pointer hover:scale-110 transition" : "cursor-default"
          } ${s <= Math.round(value) ? "text-amber-400" : "text-gray-300"}`}
          aria-label={`${s} étoile(s)`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default StarRating;
