export default function DashboardLoading() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <p className="text-sm text-muted">Loading dashboard...</p>
      </div>
    </div>
  );
}
