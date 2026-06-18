export type Role = "startup" | "investor" | "admin";
export type ConnectionStatus = "pending" | "accepted" | "declined";

export interface Invitation {
  id: string;
  email: string;
  role: Role | null;
  token: string;
  invited_by: string | null;
  used_at: string | null;
  created_at: string;
}

export interface StartupProfile {
  id: string;
  user_id: string | null;
  company_name: string | null;
  sector: string | null;
  stage: string | null;
  country: string | null;
  website: string | null;
  pitch_data: Record<string, unknown> | null;
  logo_url: string | null;
  is_published: boolean;
  created_at: string;
}

export interface InvestorProfile {
  id: string;
  user_id: string | null;
  name: string | null;
  firm: string | null;
  criteria: Record<string, unknown> | null;
  created_at: string;
}

export interface Connection {
  id: string;
  investor_id: string | null;
  startup_id: string | null;
  status: ConnectionStatus;
  created_at: string;
}

export interface Message {
  id: string;
  connection_id: string | null;
  sender_id: string | null;
  content: string;
  admin_visible: boolean;
  created_at: string;
}

// Joined shapes used in queries
export interface ConnectionWithParties extends Connection {
  investor_profiles: InvestorProfile | null;
  startup_profiles: StartupProfile | null;
}

export interface MessageWithSender extends Message {
  sender: { email: string } | null;
}
