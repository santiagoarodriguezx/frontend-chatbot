// Shared TypeScript types matching the backend Pydantic schemas

export interface Company {
  id: string;
  name: string;
  slug: string;
  whatsapp_number: string | null;
  whatsapp_instance_name: string | null;
  plan: "free" | "pro" | "business";
  is_active: boolean;
  created_at: string;
}

export interface CompanyBootstrap {
  user_id: string;
  email: string | null;
  is_admin: boolean;
  company: Company | null;
}

export interface AgentConfig {
  id: string;
  company_id: string;
  agent_name: string;
  welcome_message: string | null;
  fallback_message: string | null;
  working_hours: Record<string, string>;
  human_handoff_keyword: string | null;
  system_prompt: string | null;
  llm_provider: "openai" | "ollama";
  llm_model: string;
  llm_temperature: number;
  llm_max_tokens: number;
  ollama_base_url: string | null;
  updated_at: string;
}

export interface LLMModel {
  id: string;
  provider: "openai" | "ollama";
  model_id: string;
  model_name: string;
  context_window: number | null;
  supports_tools: boolean;
  supports_vision: boolean;
  is_active: boolean;
}

export interface AvailableTool {
  id: string;
  tool_key: string;
  tool_name: string;
  tool_description: string;
  tool_parameters_schema: Record<string, unknown>;
  handler_function: string;
  category: string;
  is_active: boolean;
}

export interface CompanyTool {
  id: string;
  company_id: string;
  tool_id: string;
  is_enabled: boolean;
  custom_config: Record<string, unknown>;
  available_tools?: AvailableTool;
}

export interface Conversation {
  id: string;
  company_id: string;
  customer_phone: string;
  customer_name: string | null;
  last_message_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "tool";
  content: string | null;
  tool_name: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  company_id: string;
  customer_phone: string;
  customer_name: string | null;
  service_name: string;
  datetime: string;
  duration_minutes: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  company_id: string;
  customer_phone: string;
  customer_name: string | null;
  items: Array<{
    product_id: string;
    name: string;
    qty: number;
    price: number;
    line_total: number;
  }>;
  total: number;
  status: string;
  delivery_address: string | null;
  notes: string | null;
  created_at: string;
}

export interface DashboardMetrics {
  total_conversations: number;
  total_messages: number;
  total_orders: number;
  total_appointments: number;
  total_revenue: number;
}

export interface CompanyMetricsGeneral {
  company_id: string;
  total_interactions: number;
  avg_response_ms: number;
  p95_response_ms: number;
  with_tools: number;
  fallbacks: number;
  errors: number;
  first_seen_at: string | null;
  last_seen_at: string | null;
}

export interface CompanyMetricsDaily {
  company_id: string;
  metric_date: string;
  total_interactions: number;
  avg_response_ms: number;
  p95_response_ms: number;
  with_tools: number;
  fallbacks: number;
  errors: number;
}

export interface KnowledgeDoc {
  id: string;
  company_id: string;
  file_name: string;
  file_type: string;
  chunk_index: number;
  created_at: string;
}

export interface CannedResponse {
  id: string;
  company_id: string;
  intent_key: string;
  intent_description: string;
  response_template: string;
  keywords: string[];
  is_enabled: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface EvolutionInstanceCreateOut {
  instance_name: string;
  webhook_url: string;
  evolution: Record<string, unknown>;
}

export interface EvolutionInstanceStatusOut {
  instance_name: string;
  state: string;
  raw: Record<string, unknown>;
}

export interface EvolutionInstanceQrOut {
  instance_name: string;
  qrcode: string | null;
  raw: Record<string, unknown>;
}

export interface EvolutionInstanceDeleteOut {
  instance_name: string;
  deleted: boolean;
  evolution: Record<string, unknown>;
}
