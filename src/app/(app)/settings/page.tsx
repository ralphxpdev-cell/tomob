"use client";

import { useEffect, useState, useCallback } from "react";
import { Settings, Save, Loader2, Eye, EyeOff, Key } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiSettings, saveApiSettings } from "@/actions/settings";
import { toast } from "sonner";

interface KeyField {
  key: string;
  label: string;
  placeholder: string;
  description: string;
}

const keyFields: KeyField[] = [
  {
    key: "google_api_key",
    label: "Google AI (Gemini)",
    placeholder: "AIza...",
    description: "Used for website analysis and email drafting (Gemini 1.5 Flash)",
  },
  {
    key: "openai_api_key",
    label: "OpenAI",
    placeholder: "sk-...",
    description: "Used for DALL-E 3 image generation",
  },
  {
    key: "anthropic_api_key",
    label: "Anthropic (Claude)",
    placeholder: "sk-ant-...",
    description: "Used for React code generation and QA review",
  },
  {
    key: "resend_api_key",
    label: "Resend",
    placeholder: "re_...",
    description: "Used for sending cold emails",
  },
  {
    key: "jina_api_key",
    label: "Jina AI",
    placeholder: "jina_...",
    description: "Used for web scraping via r.jina.ai",
  },
  {
    key: "screenshotone_api_key",
    label: "ScreenshotOne",
    placeholder: "...",
    description: "Used for capturing website screenshots",
  },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fromEmail, setFromEmail] = useState("onboarding@resend.dev");

  const loadSettings = useCallback(async () => {
    try {
      const data = await getApiSettings();
      if (data) {
        const mapped: Record<string, string> = {};
        for (const field of keyFields) {
          mapped[field.key] = (data as unknown as Record<string, string>)[field.key] || "";
        }
        setSettings(mapped);
        setFromEmail(data.resend_from_email || "onboarding@resend.dev");
      }
    } catch {
      // First load may fail if no settings exist
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveApiSettings({
        ...settings,
        resend_from_email: fromEmail,
      });
      toast.success("API settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Settings"
        description="Configure API keys and integrations"
        actions={
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save All
          </Button>
        }
      />

      <div className="space-y-4">
        {keyFields.map((field) => (
          <Card key={field.key}>
            <CardContent className="py-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-neutral-800 rounded-lg">
                  <Key className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-white mb-0.5">
                    {field.label}
                  </h3>
                  <p className="text-xs text-neutral-400 mb-3">
                    {field.description}
                  </p>
                  <div className="relative">
                    <input
                      type={showKeys[field.key] ? "text" : "password"}
                      placeholder={field.placeholder}
                      value={settings[field.key] || ""}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 pr-10 text-sm text-white bg-neutral-900 border border-neutral-800 rounded-lg placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-colors font-mono"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowKeys((prev) => ({
                          ...prev,
                          [field.key]: !prev[field.key],
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                    >
                      {showKeys[field.key] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* From Email */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-neutral-800 rounded-lg">
                <Settings className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-white mb-0.5">
                  From Email Address
                </h3>
                <p className="text-xs text-neutral-400 mb-3">
                  The sender email address for outgoing cold emails
                </p>
                <Input
                  type="email"
                  placeholder="you@yourdomain.com"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
