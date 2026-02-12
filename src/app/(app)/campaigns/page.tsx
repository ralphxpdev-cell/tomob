"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  ExternalLink,
  Trash2,
  Play,
  Loader2,
  MoreVertical,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { getProspects, deleteProspect } from "@/actions/prospects";
import type { Prospect, ProspectStatus } from "@/types";
import { toast } from "sonner";

const statusFilters: (ProspectStatus | "all")[] = [
  "all",
  "queued",
  "analyzing",
  "generated",
  "approved",
  "sent",
  "error",
];

export default function CampaignsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProspectStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadProspects = useCallback(async () => {
    try {
      const data = await getProspects();
      setProspects(data as Prospect[]);
    } catch {
      toast.error("Failed to load prospects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProspects();
  }, [loadProspects]);

  const handleDelete = async (id: string) => {
    try {
      await deleteProspect(id);
      setProspects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Prospect deleted");
    } catch {
      toast.error("Failed to delete prospect");
    }
  };

  const handleRunWorkflow = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch("/api/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId: id }),
      });
      if (!res.ok) throw new Error("Workflow failed");
      toast.success("Workflow started");
      loadProspects();
    } catch {
      toast.error("Failed to start workflow");
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = prospects.filter((p) => {
    const matchesSearch =
      !search ||
      p.url.toLowerCase().includes(search.toLowerCase()) ||
      p.company_name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <Header
        title="Campaigns"
        description={`${prospects.length} total prospects`}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <Input
            placeholder="Search by URL or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                filter === s
                  ? "bg-yellow-400 text-black"
                  : "bg-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Prospects List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <p className="text-neutral-400">No prospects found</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((prospect) => (
            <Card
              key={prospect.id}
              className="hover:bg-neutral-800/50 transition-colors duration-200"
            >
              <div className="flex items-center gap-4 px-6 py-4">
                {/* Company Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/campaigns/${prospect.id}`}
                      className="text-sm font-medium text-white hover:text-yellow-400 transition-colors truncate"
                    >
                      {prospect.company_name || "Unknown"}
                    </Link>
                    <a
                      href={prospect.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-500 hover:text-neutral-300"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-xs text-neutral-500 truncate mt-0.5">
                    {prospect.url}
                  </p>
                </div>

                {/* Status */}
                <StatusBadge status={prospect.status} />

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {prospect.status === "queued" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRunWorkflow(prospect.id)}
                      disabled={processingId === prospect.id}
                    >
                      {processingId === prospect.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(prospect.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Link href={`/campaigns/${prospect.id}`}>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
