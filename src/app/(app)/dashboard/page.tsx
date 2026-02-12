"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Target,
  Clock,
  Loader2,
  Sparkles,
  CheckCircle2,
  Send,
  AlertTriangle,
  Upload,
  Plus,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { getDashboardStats } from "@/actions/prospects";
import { createProspect, createBulkProspects } from "@/actions/prospects";
import type { DashboardStats } from "@/types";
import Papa from "papaparse";
import { toast } from "sonner";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    queued: 0,
    analyzing: 0,
    generated: 0,
    approved: 0,
    sent: 0,
    error: 0,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [singleUrl, setSingleUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch {
      // Stats loading failed silently on first load
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleAddSingle = async () => {
    if (!singleUrl.trim()) return;
    setLoading(true);
    try {
      await createProspect(singleUrl.trim());
      toast.success("Prospect added successfully");
      setSingleUrl("");
      setShowAddModal(false);
      loadStats();
    } catch {
      toast.error("Failed to add prospect");
    } finally {
      setLoading(false);
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: async (results) => {
        const urls: string[] = [];
        for (const row of results.data as string[][]) {
          const url = row[0]?.trim();
          if (url && (url.includes(".") || url.startsWith("http"))) {
            urls.push(url);
          }
        }
        if (urls.length === 0) {
          toast.error("No valid URLs found in CSV");
          return;
        }
        setLoading(true);
        try {
          await createBulkProspects(urls);
          toast.success(`${urls.length} prospects imported`);
          setShowBulkModal(false);
          loadStats();
        } catch {
          toast.error("Failed to import prospects");
        } finally {
          setLoading(false);
        }
      },
      error: () => {
        toast.error("Failed to parse CSV file");
      },
    });
  };

  const statCards = [
    {
      label: "Total Prospects",
      value: stats.total,
      icon: Target,
      color: "text-white",
    },
    {
      label: "Queued",
      value: stats.queued,
      icon: Clock,
      color: "text-neutral-400",
    },
    {
      label: "Analyzing",
      value: stats.analyzing,
      icon: Loader2,
      color: "text-blue-400",
    },
    {
      label: "Generated",
      value: stats.generated,
      icon: Sparkles,
      color: "text-yellow-400",
    },
    {
      label: "Approved",
      value: stats.approved,
      icon: CheckCircle2,
      color: "text-green-400",
    },
    {
      label: "Sent",
      value: stats.sent,
      icon: Send,
      color: "text-emerald-300",
    },
    {
      label: "Errors",
      value: stats.error,
      icon: AlertTriangle,
      color: "text-red-400",
    },
  ];

  return (
    <div>
      <Header
        title="Dashboard"
        description="Overview of your agency automation pipeline"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowBulkModal(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Import
            </Button>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Prospect
            </Button>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="py-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-neutral-400">{stat.label}</span>
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="py-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Quick Add
            </h3>
            <p className="text-sm text-neutral-400 mb-4">
              Add a single website URL to analyze
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com"
                value={singleUrl}
                onChange={(e) => setSingleUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSingle()}
              />
              <Button
                onClick={handleAddSingle}
                disabled={loading || !singleUrl.trim()}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Pipeline Overview
            </h3>
            <p className="text-sm text-neutral-400 mb-4">
              Conversion funnel at a glance
            </p>
            <div className="space-y-2">
              {[
                { label: "Pending Review", count: stats.generated, total: stats.total },
                { label: "Approved", count: stats.approved, total: stats.total },
                { label: "Sent", count: stats.sent, total: stats.total },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-xs text-neutral-400 w-28">
                    {item.label}
                  </span>
                  <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                      style={{
                        width: `${item.total > 0 ? (item.count / item.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-neutral-300 w-8 text-right">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Single URL Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Prospect"
      >
        <div className="space-y-4">
          <Input
            label="Website URL"
            placeholder="https://example.com"
            value={singleUrl}
            onChange={(e) => setSingleUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddSingle()}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSingle}
              disabled={loading || !singleUrl.trim()}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Add Prospect
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal
        open={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Bulk Import (CSV)"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-400">
            Upload a CSV file with URLs in the first column. One URL per row.
          </p>
          <div className="border-2 border-dashed border-neutral-700 rounded-xl p-8 text-center">
            <Upload className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
            <label className="cursor-pointer">
              <span className="text-sm text-yellow-400 hover:text-yellow-300">
                Click to upload CSV
              </span>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCsvUpload}
                disabled={loading}
              />
            </label>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Importing prospects...
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
