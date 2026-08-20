export type User = {
  id: number;
  name: string;
  email: string;
  created_at?: string;
};

export type Case = {
  id: number;
  title: string;
  description: string | null;
  created_at: string;
  document_count?: number;
};

export type Document = {
  id: number;
  original_name: string;
  file_size: number;
  created_at: string;
  ai_analysis: string | null;
};

export type CaseEvent = {
  id: number;
  event_type: string;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type ActionPlan = {
  id: number;
  content: string;
  created_at: string;
};
