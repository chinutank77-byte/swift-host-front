export default function OneTimeAddonCard({ name, price, description }) {
  return (
    <div className="glass-nm p-6 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-text">{name}</h3>
        <p className="text-sm text-muted mt-1">{description}</p>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <span className="text-xl font-bold text-text">${price.toFixed(2)}</span>
        <button className="nm-btn px-4 py-2 text-accent text-sm font-medium whitespace-nowrap">
          Purchase
        </button>
      </div>
    </div>
  );
}
