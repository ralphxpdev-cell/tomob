export type ProspectStatus =
  | "queued"
  | "analyzing"
  | "generated"
  | "approved"
  | "sent"
  | "error";

export interface Profile {
  id: string;
  email: string;
  subscription_tier: string;
  created_at: string;
}

export interface Guideline {
  id: string;
  type: "admin_ui" | "email_tone";
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Prospect {
  id: string;
  user_id: string;
  url: string;
  company_name: string | null;
  status: ProspectStatus;
  original_screenshot_url: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  generation?: Generation;
}

export interface AnalysisJson {
  brand_colors: string[];
  value_proposition: string;
  pain_points: string[];
  industry: string;
  target_audience: string;
}

export interface Generation {
  id: string;
  prospect_id: string;
  analysis_json: AnalysisJson | null;
  dall_e_image_url: string | null;
  dall_e_prompt: string | null;
  redesign_code: string | null;
  email_subject: string | null;
  email_body: string | null;
  supervisor_feedback: string | null;
  current_step_log: string | null;
  quality_score: number | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

export interface ApiSettings {
  id: string;
  user_id: string;
  google_api_key: string | null;
  openai_api_key: string | null;
  anthropic_api_key: string | null;
  resend_api_key: string | null;
  jina_api_key: string | null;
  screenshotone_api_key: string | null;
  resend_from_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total: number;
  queued: number;
  analyzing: number;
  generated: number;
  approved: number;
  sent: number;
  error: number;
}

export interface WorkflowStep {
  phase: string;
  status: "pending" | "running" | "complete" | "error";
  message: string;
  timestamp?: string;
}
