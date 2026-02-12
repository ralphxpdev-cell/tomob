import { create } from "zustand";
import type { Prospect, DashboardStats, WorkflowStep } from "@/types";

interface AppState {
  // Prospects
  prospects: Prospect[];
  setProspects: (prospects: Prospect[]) => void;
  updateProspect: (id: string, updates: Partial<Prospect>) => void;

  // Stats
  stats: DashboardStats;
  setStats: (stats: DashboardStats) => void;

  // Workflow tracking
  workflowSteps: Record<string, WorkflowStep[]>;
  setWorkflowSteps: (prospectId: string, steps: WorkflowStep[]) => void;

  // UI State
  selectedProspectId: string | null;
  setSelectedProspectId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  prospects: [],
  setProspects: (prospects) => set({ prospects }),
  updateProspect: (id, updates) =>
    set((state) => ({
      prospects: state.prospects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  stats: { total: 0, queued: 0, analyzing: 0, generated: 0, approved: 0, sent: 0, error: 0 },
  setStats: (stats) => set({ stats }),

  workflowSteps: {},
  setWorkflowSteps: (prospectId, steps) =>
    set((state) => ({
      workflowSteps: { ...state.workflowSteps, [prospectId]: steps },
    })),

  selectedProspectId: null,
  setSelectedProspectId: (id) => set({ selectedProspectId: id }),
}));
