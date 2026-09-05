"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import ApiKeyField from "@/components/dashboard/ApiKeyField";

export default function ApiKeysPage() {
  const { user } = useAuth();
  const hasApi = user?.plan !== "drop";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading text-[clamp(1.6rem,4vw,2rem)] text-text">API Key</h1>
      </div>

      {!hasApi && (
        <div className="glass-sm p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-text font-medium">Limited API access</p>
            <p className="text-xs text-muted mt-0.5">
              Drop plan has restricted API access. Upgrade to Spark or above for full API features.
            </p>
            <Link href="/pricing" className="text-xs text-accent hover:text-accent-dim font-medium mt-1 inline-block">
              Upgrade →
            </Link>
          </div>
        </div>
      )}

      <ApiKeyField />
    </div>
  );
}
