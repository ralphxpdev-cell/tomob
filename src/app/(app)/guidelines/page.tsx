"use client";

import { useEffect, useState, useCallback } from "react";
import { BookOpen, Save, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getGuidelines,
  updateGuideline,
  toggleGuideline,
} from "@/actions/guidelines";
import type { Guideline } from "@/types";
import { toast } from "sonner";

const typeLabels: Record<string, string> = {
  admin_ui: "Admin UI (Nano Banana)",
  email_tone: "Email Tone & Persona",
};

const typeDescriptions: Record<string, string> = {
  admin_ui: "Controls the visual design system for all admin dashboard pages",
  email_tone:
    "Guides the AI when drafting cold emails - tone, structure, and persona",
};

export default function GuidelinesPage() {
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [editedContent, setEditedContent] = useState<Record<string, string>>(
    {}
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadGuidelines = useCallback(async () => {
    try {
      const data = await getGuidelines();
      setGuidelines(data as Guideline[]);
      const contentMap: Record<string, string> = {};
      for (const g of data as Guideline[]) {
        contentMap[g.id] = g.content;
      }
      setEditedContent(contentMap);
    } catch {
      toast.error("Failed to load guidelines");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGuidelines();
  }, [loadGuidelines]);

  const handleSave = async (id: string) => {
    setSaving(id);
    try {
      await updateGuideline(id, editedContent[id]);
      toast.success("Guideline saved");
    } catch {
      toast.error("Failed to save guideline");
    } finally {
      setSaving(null);
    }
  };

  const handleToggle = async (id: string, currentState: boolean) => {
    try {
      await toggleGuideline(id, !currentState);
      setGuidelines((prev) =>
        prev.map((g) => (g.id === id ? { ...g, is_active: !currentState } : g))
      );
      toast.success(`Guideline ${!currentState ? "enabled" : "disabled"}`);
    } catch {
      toast.error("Failed to toggle guideline");
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
        title="Guidelines"
        description="Configure AI behavior and design system rules"
      />

      <div className="space-y-6">
        {guidelines.map((guideline) => (
          <Card key={guideline.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-yellow-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {typeLabels[guideline.type] || guideline.type}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {typeDescriptions[guideline.type]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      handleToggle(guideline.id, guideline.is_active)
                    }
                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                      guideline.is_active
                        ? "text-green-400"
                        : "text-neutral-500"
                    }`}
                  >
                    {guideline.is_active ? (
                      <ToggleRight className="w-5 h-5" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                    {guideline.is_active ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editedContent[guideline.id] || ""}
                onChange={(e) =>
                  setEditedContent((prev) => ({
                    ...prev,
                    [guideline.id]: e.target.value,
                  }))
                }
                rows={16}
                className="font-mono text-xs"
              />
              <div className="flex justify-end mt-4">
                <Button
                  size="sm"
                  onClick={() => handleSave(guideline.id)}
                  disabled={
                    saving === guideline.id ||
                    editedContent[guideline.id] === guideline.content
                  }
                >
                  {saving === guideline.id ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {guidelines.length === 0 && (
          <Card>
            <div className="py-16 text-center">
              <BookOpen className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-neutral-400">
                No guidelines configured yet. Run the seed SQL to populate
                defaults.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
