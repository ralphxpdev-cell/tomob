"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Palette,
  AlertTriangle,
  Target,
  Send,
  Loader2,
  CheckCircle2,
  Eye,
  Code,
  Play,
} from "lucide-react";
import {
  SandpackProvider,
  SandpackPreview,
  SandpackCodeEditor,
} from "@codesandbox/sandpack-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { updateProspectStatus } from "@/actions/prospects";
import type { Prospect, Generation, AnalysisJson } from "@/types";
import { toast } from "sonner";

export default function ProspectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"after" | "before" | "code">(
    "after"
  );
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sending, setSending] = useState(false);
  const [runningWorkflow, setRunningWorkflow] = useState(false);

  const loadData = useCallback(async () => {
    const supabase = createClient();

    const { data: prospectData } = await supabase
      .from("prospects")
      .select("*")
      .eq("id", id)
      .single();

    if (prospectData) {
      setProspect(prospectData as Prospect);

      const { data: genData } = await supabase
        .from("generations")
        .select("*")
        .eq("prospect_id", id)
        .single();

      if (genData) {
        const gen = genData as Generation;
        setGeneration(gen);
        setEmailSubject(gen.email_subject || "");
        setEmailBody(gen.email_body || "");
      }
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApproveAndSend = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error("Please fill in email subject and body");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId: id,
          subject: emailSubject,
          body: emailBody,
        }),
      });

      if (!res.ok) throw new Error("Failed to send");

      await updateProspectStatus(id, "sent");
      toast.success("Email sent successfully!");
      loadData();
    } catch {
      toast.error("Failed to send email");
    } finally {
      setSending(false);
    }
  };

  const handleRunWorkflow = async () => {
    setRunningWorkflow(true);
    try {
      const res = await fetch("/api/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId: id }),
      });
      if (!res.ok) throw new Error("Workflow failed");
      toast.success("Workflow started - refreshing data...");
      // Poll for updates
      const interval = setInterval(async () => {
        await loadData();
      }, 3000);
      setTimeout(() => {
        clearInterval(interval);
        setRunningWorkflow(false);
        loadData();
      }, 60000);
    } catch {
      toast.error("Failed to start workflow");
      setRunningWorkflow(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
      </div>
    );
  }

  if (!prospect) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-400">Prospect not found</p>
      </div>
    );
  }

  const analysis = generation?.analysis_json as AnalysisJson | null;
  const redesignCode = generation?.redesign_code || "";

  const sandpackFiles: Record<string, string> = {
    "/App.js": redesignCode || '// No code generated yet\nexport default function App() {\n  return <div className="p-8 text-center text-gray-500">Run the workflow to generate a redesign</div>\n}',
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/campaigns")}
          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">
              {prospect.company_name || "Unknown"}
            </h1>
            <StatusBadge status={prospect.status} />
            <a
              href={prospect.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-neutral-300"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <p className="text-sm text-neutral-400 mt-0.5">{prospect.url}</p>
        </div>
        {prospect.status === "queued" && (
          <Button
            onClick={handleRunWorkflow}
            disabled={runningWorkflow}
          >
            {runningWorkflow ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Run AI Workflow
          </Button>
        )}
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Intel */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-yellow-400" />
                Analysis Report
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis ? (
                <>
                  {/* Brand Colors */}
                  <div>
                    <h4 className="text-xs font-medium text-neutral-400 mb-2 flex items-center gap-1">
                      <Palette className="w-3 h-3" />
                      Brand Colors
                    </h4>
                    <div className="flex gap-2 flex-wrap">
                      {analysis.brand_colors?.map((color, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 bg-neutral-800 rounded-full px-2 py-1"
                        >
                          <div
                            className="w-3 h-3 rounded-full border border-neutral-600"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-xs font-mono text-neutral-300">
                            {color}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Value Proposition */}
                  <div>
                    <h4 className="text-xs font-medium text-neutral-400 mb-1">
                      Value Proposition
                    </h4>
                    <p className="text-sm text-neutral-300">
                      {analysis.value_proposition}
                    </p>
                  </div>

                  {/* Pain Points */}
                  <div>
                    <h4 className="text-xs font-medium text-neutral-400 mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      UX Pain Points
                    </h4>
                    <ul className="space-y-1">
                      {analysis.pain_points?.map((point, i) => (
                        <li
                          key={i}
                          className="text-xs text-neutral-300 flex gap-2"
                        >
                          <span className="text-yellow-400 mt-0.5">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Quality Score */}
                  {generation?.quality_score !== null &&
                    generation?.quality_score !== undefined && (
                      <div>
                        <h4 className="text-xs font-medium text-neutral-400 mb-1">
                          Quality Score
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                generation.quality_score >= 80
                                  ? "bg-green-400"
                                  : generation.quality_score >= 60
                                    ? "bg-yellow-400"
                                    : "bg-red-400"
                              }`}
                              style={{ width: `${generation.quality_score}%` }}
                            />
                          </div>
                          <span className="text-sm font-mono text-white">
                            {generation.quality_score}
                          </span>
                        </div>
                      </div>
                    )}
                </>
              ) : (
                <p className="text-sm text-neutral-500">
                  No analysis data yet. Run the AI workflow to generate insights.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Workflow Log */}
          {generation?.current_step_log && (
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-white">
                  Workflow Log
                </h3>
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-neutral-400 whitespace-pre-wrap font-mono">
                  {generation.current_step_log}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Center Column - Visuals */}
        <div className="lg:col-span-5">
          <Card className="overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-neutral-800">
              {[
                { key: "after", label: "After (Preview)", icon: Eye },
                { key: "before", label: "Before", icon: ExternalLink },
                { key: "code", label: "Code", icon: Code },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                      activeTab === tab.key
                        ? "border-yellow-400 text-yellow-400"
                        : "border-transparent text-neutral-400 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
              {activeTab === "after" && (
                <div className="h-[500px]">
                  {redesignCode ? (
                    <SandpackProvider
                      template="react"
                      files={sandpackFiles}
                      theme="dark"
                      options={{
                        externalResources: [
                          "https://cdn.tailwindcss.com",
                        ],
                      }}
                    >
                      <SandpackPreview
                        style={{ height: "500px" }}
                        showNavigator={false}
                        showRefreshButton
                      />
                    </SandpackProvider>
                  ) : (
                    <div className="flex items-center justify-center h-full text-neutral-500">
                      No preview available yet
                    </div>
                  )}
                </div>
              )}

              {activeTab === "before" && (
                <div className="h-[500px] flex items-center justify-center">
                  {prospect.original_screenshot_url ? (
                    <img
                      src={prospect.original_screenshot_url}
                      alt="Original website"
                      className="max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <ExternalLink className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                      <p className="text-sm text-neutral-500">
                        Screenshot will be captured during analysis
                      </p>
                      <a
                        href={prospect.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-yellow-400 hover:text-yellow-300 mt-2 inline-block"
                      >
                        Open original site →
                      </a>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "code" && (
                <div className="h-[500px]">
                  {redesignCode ? (
                    <SandpackProvider
                      template="react"
                      files={sandpackFiles}
                      theme="dark"
                    >
                      <SandpackCodeEditor
                        style={{ height: "500px" }}
                        showLineNumbers
                        showTabs={false}
                      />
                    </SandpackProvider>
                  ) : (
                    <div className="flex items-center justify-center h-full text-neutral-500">
                      No code generated yet
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* DALL-E Generated Image */}
          {generation?.dall_e_image_url && (
            <Card className="mt-4">
              <CardHeader>
                <h3 className="text-sm font-semibold text-white">
                  DALL-E Generated Asset
                </h3>
              </CardHeader>
              <CardContent>
                <img
                  src={generation.dall_e_image_url}
                  alt="AI generated design asset"
                  className="rounded-lg w-full"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Action */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-yellow-400" />
                Email Editor
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Subject"
                placeholder="Quick thought on their homepage..."
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
              <Textarea
                label="Email Body (Markdown)"
                placeholder="Write your personalized email..."
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={12}
              />

              {/* Supervisor Feedback */}
              {generation?.supervisor_feedback && (
                <div className="p-3 bg-yellow-400/5 border border-yellow-400/20 rounded-lg">
                  <h4 className="text-xs font-medium text-yellow-400 mb-1">
                    AI Review Feedback
                  </h4>
                  <p className="text-xs text-neutral-300">
                    {generation.supervisor_feedback}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                {prospect.status === "generated" && (
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={async () => {
                      await updateProspectStatus(id, "approved");
                      toast.success("Prospect approved");
                      loadData();
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                )}
                {(prospect.status === "approved" ||
                  prospect.status === "generated") && (
                  <Button
                    className="flex-1"
                    onClick={handleApproveAndSend}
                    disabled={sending}
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Approve & Send
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
