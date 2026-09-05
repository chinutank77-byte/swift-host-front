import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

const statusConfig = {
  operational: { icon: CheckCircle, color: "text-success", bg: "bg-success/10 border border-success/20", label: "All systems operational" },
  degraded: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-50 border border-yellow-200", label: "Some systems degraded" },
  down: { icon: XCircle, color: "text-danger", bg: "bg-danger/10 border border-danger/20", label: "Systems down — investigating" },
};

export default function SystemStatusBanner({ status = "operational" }) {
  const config = statusConfig[status] || statusConfig.operational;
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl glass-sm ${config.bg}`}>
      <Icon size={16} className={config.color} />
      <span className="text-sm font-medium text-text">{config.label}</span>
    </div>
  );
}
