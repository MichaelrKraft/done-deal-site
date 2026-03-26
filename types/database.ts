// TypeScript types matching every table in db/schema.sql
// Keep in sync with the Postgres schema.

// ============================================================
// UNION TYPES (domain enums)
// ============================================================

export type AutonomyMode = 'supervised' | 'autonomous'

export type EmailProvider = 'none' | 'outlook' | 'google'
export type CalendarProvider = 'none' | 'outlook' | 'google'

export type TransactionSide = 'buyer' | 'seller'

export type TransactionStage =
  | 'pre_listing'
  | 'active_listing'
  | 'under_contract'
  | 'pre_closing'
  | 'closed'
  | 'archived'

export type PartyRole =
  | 'buyer'
  | 'seller'
  | 'buyer_agent'
  | 'seller_agent'
  | 'lender'
  | 'title'
  | 'inspector'
  | 'appraiser'
  | 'hoa'
  | 'other'

export type DeadlineStatus = 'pending' | 'completed' | 'waived' | 'extended' | 'breached'

export type DeadlineCalculatedFrom = 'mec' | 'closing'

export type RiskLevel = 'low' | 'medium' | 'high'

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'n_a'

export type TaskAssignedTo =
  | 'agent'
  | 'ai'
  | 'lender'
  | 'title'
  | 'inspector'
  | 'buyer'
  | 'seller'

export type DocumentStatus = 'missing' | 'uploaded' | 'sent' | 'signed' | 'n_a' | 'superseded'

export type DocumentUploadedVia = 'ui' | 'inbound_email' | 'client_portal' | 'docusign'

export type DocumentVisibility = 'agent_only' | 'shared' | 'client_visible'

export type EsignStatus = 'created' | 'sent' | 'delivered' | 'signed' | 'declined' | 'voided'
export type EsignProvider = 'docusign' | 'dotloop'

export type AIActionStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'executed'
  | 'auto_executed'
  | 'expired'
  | 'skipped'

export type MemoryType = 'rule' | 'preference' | 'context' | 'correction'

export type TeamRole = 'assistant' | 'team_lead' | 'tc' | 'broker'

export interface TeamPermissions {
  can_view_transactions: boolean
  can_approve_actions: boolean
  can_edit_transactions: boolean
  can_manage_documents: boolean
  can_view_analytics: boolean
}

export type VendorCategory = 'title' | 'lender' | 'inspector' | 'attorney' | 'hoa'

export type ComplianceStatus = 'pending' | 'in_progress' | 'complete' | 'n_a' | 'waived'

export type InboundEmailProcessingStatus = 'received' | 'processing' | 'completed' | 'failed' | 'duplicate'

export type InboundAttachmentExtractionStatus = 'pending' | 'processing' | 'success' | 'failed' | 'skipped'

export type EmailTemplateCategory =
  | 'general'
  | 'under_contract'
  | 'pre_closing'
  | 'post_close'
  | 'follow_up'
  | 'compliance'

// ============================================================
// DATABASE TYPE MAP
// ============================================================

export type Database = {
  public: {
    Tables: {
      brokerages: {
        Row: {
          id: string
          name: string
          email_domain: string | null
          config: Record<string, unknown>
          branding: Record<string, unknown>
          checklist_template: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email_domain?: string | null
          config?: Record<string, unknown>
          branding?: Record<string, unknown>
          checklist_template?: Record<string, unknown>
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email_domain?: string | null
          config?: Record<string, unknown>
          branding?: Record<string, unknown>
          checklist_template?: Record<string, unknown>
          created_at?: string
        }
        Relationships: []
      }
      agents: {
        Row: {
          id: string
          brokerage_id: string
          auth_user_id: string | null
          name: string
          email: string
          outlook_token: Record<string, unknown> | null
          google_token: Record<string, unknown> | null
          email_provider: EmailProvider
          calendar_provider: CalendarProvider
          telegram_id: string | null
          whatsapp_id: string | null
          autonomy_default: AutonomyMode
          preferences: Record<string, unknown>
          soul_document: string
          docusign_token: Record<string, unknown> | null
          inbox_address: string | null
          preferred_model: string
          created_at: string
          stripe_customer_id: string | null
          plan: 'trial' | 'starter' | 'professional' | 'team' | 'canceled'
          subscription_status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid'
          trial_ends_at: string | null
          stripe_subscription_id: string | null
        }
        Insert: {
          id?: string
          brokerage_id: string
          auth_user_id?: string | null
          name: string
          email: string
          outlook_token?: Record<string, unknown> | null
          google_token?: Record<string, unknown> | null
          email_provider?: EmailProvider
          calendar_provider?: CalendarProvider
          telegram_id?: string | null
          whatsapp_id?: string | null
          autonomy_default?: AutonomyMode
          preferences?: Record<string, unknown>
          soul_document?: string
          docusign_token?: Record<string, unknown> | null
          inbox_address?: string | null
          preferred_model?: string
          created_at?: string
          stripe_customer_id?: string | null
          plan?: 'trial' | 'starter' | 'professional' | 'team' | 'canceled'
          subscription_status?: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid'
          trial_ends_at?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          id?: string
          brokerage_id?: string
          auth_user_id?: string | null
          name?: string
          email?: string
          outlook_token?: Record<string, unknown> | null
          google_token?: Record<string, unknown> | null
          email_provider?: EmailProvider
          calendar_provider?: CalendarProvider
          telegram_id?: string | null
          whatsapp_id?: string | null
          autonomy_default?: AutonomyMode
          preferences?: Record<string, unknown>
          soul_document?: string
          docusign_token?: Record<string, unknown> | null
          inbox_address?: string | null
          preferred_model?: string
          created_at?: string
          stripe_customer_id?: string | null
          plan?: 'trial' | 'starter' | 'professional' | 'team' | 'canceled'
          subscription_status?: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid'
          trial_ends_at?: string | null
          stripe_subscription_id?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          agent_id: string
          brokerage_id: string
          property_address: string
          side: TransactionSide
          stage: TransactionStage
          mec_date: string | null
          closing_date: string | null
          list_price: number | null
          sale_price: number | null
          earnest_money: number | null
          property_details: Record<string, unknown>
          autonomy_mode: AutonomyMode
          photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          brokerage_id: string
          property_address: string
          side: TransactionSide
          stage?: TransactionStage
          mec_date?: string | null
          closing_date?: string | null
          list_price?: number | null
          sale_price?: number | null
          earnest_money?: number | null
          property_details?: Record<string, unknown>
          autonomy_mode?: AutonomyMode
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          brokerage_id?: string
          property_address?: string
          side?: TransactionSide
          stage?: TransactionStage
          mec_date?: string | null
          closing_date?: string | null
          list_price?: number | null
          sale_price?: number | null
          earnest_money?: number | null
          property_details?: Record<string, unknown>
          autonomy_mode?: AutonomyMode
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      parties: {
        Row: {
          id: string
          transaction_id: string
          role: PartyRole
          name: string
          email: string | null
          phone: string | null
          company: string | null
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          role: PartyRole
          name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          role?: PartyRole
          name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          created_at?: string
        }
        Relationships: []
      }
      deadlines: {
        Row: {
          id: string
          transaction_id: string
          name: string
          due_date: string
          status: DeadlineStatus
          calculated_from: DeadlineCalculatedFrom | null
          days_offset: number | null
          is_business_days: boolean
          risk_level: RiskLevel
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          name: string
          due_date: string
          status?: DeadlineStatus
          calculated_from?: DeadlineCalculatedFrom | null
          days_offset?: number | null
          is_business_days?: boolean
          risk_level?: RiskLevel
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          name?: string
          due_date?: string
          status?: DeadlineStatus
          calculated_from?: DeadlineCalculatedFrom | null
          days_offset?: number | null
          is_business_days?: boolean
          risk_level?: RiskLevel
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          transaction_id: string
          stage: string
          title: string
          description: string | null
          status: TaskStatus
          risk_level: RiskLevel
          assigned_to: TaskAssignedTo
          due_date: string | null
          sort_order: number
          completed_by: string | null
          completed_at: string | null
          completion_method: 'manual' | 'ai_auto' | 'ai_approved' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          stage: string
          title: string
          description?: string | null
          status?: TaskStatus
          risk_level?: RiskLevel
          assigned_to?: TaskAssignedTo
          due_date?: string | null
          sort_order?: number
          completed_by?: string | null
          completed_at?: string | null
          completion_method?: 'manual' | 'ai_auto' | 'ai_approved' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          stage?: string
          title?: string
          description?: string | null
          status?: TaskStatus
          risk_level?: RiskLevel
          assigned_to?: TaskAssignedTo
          due_date?: string | null
          sort_order?: number
          completed_by?: string | null
          completed_at?: string | null
          completion_method?: 'manual' | 'ai_auto' | 'ai_approved' | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          id: string
          transaction_id: string
          doc_type: string
          display_name: string
          status: DocumentStatus
          required: boolean
          file_path: string | null
          docusign_envelope_id: string | null
          notes: string | null
          version: number
          previous_version_id: string | null
          uploaded_by: string | null
          uploaded_via: DocumentUploadedVia
          file_size_bytes: number | null
          content_type: string | null
          content_hash: string | null
          visibility: DocumentVisibility
          esign_status: EsignStatus | null
          esign_provider: EsignProvider | null
          esign_metadata: Record<string, unknown>
          scan_findings: Array<{ text: string; severity: 'error' | 'warning' | 'info' }> | null
          scan_status: 'pending' | 'scanning' | 'complete' | 'failed' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          doc_type: string
          display_name: string
          status?: DocumentStatus
          required?: boolean
          file_path?: string | null
          docusign_envelope_id?: string | null
          notes?: string | null
          version?: number
          previous_version_id?: string | null
          uploaded_by?: string | null
          uploaded_via?: DocumentUploadedVia
          file_size_bytes?: number | null
          content_type?: string | null
          content_hash?: string | null
          visibility?: DocumentVisibility
          esign_status?: EsignStatus | null
          esign_provider?: EsignProvider | null
          esign_metadata?: Record<string, unknown>
          scan_findings?: Array<{ text: string; severity: 'error' | 'warning' | 'info' }> | null
          scan_status?: 'pending' | 'scanning' | 'complete' | 'failed' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          doc_type?: string
          display_name?: string
          status?: DocumentStatus
          required?: boolean
          file_path?: string | null
          docusign_envelope_id?: string | null
          notes?: string | null
          version?: number
          previous_version_id?: string | null
          uploaded_by?: string | null
          uploaded_via?: DocumentUploadedVia
          file_size_bytes?: number | null
          content_type?: string | null
          content_hash?: string | null
          visibility?: DocumentVisibility
          esign_status?: EsignStatus | null
          esign_provider?: EsignProvider | null
          esign_metadata?: Record<string, unknown>
          scan_findings?: Array<{ text: string; severity: 'error' | 'warning' | 'info' }> | null
          scan_status?: 'pending' | 'scanning' | 'complete' | 'failed' | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_actions: {
        Row: {
          id: string
          transaction_id: string
          agent_id: string
          action_type: string
          risk_level: RiskLevel
          status: AIActionStatus
          draft_content: Record<string, unknown>
          context_summary: string | null
          executed_at: string | null
          approved_by: string | null
          approved_at: string | null
          expires_at: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          transaction_id: string
          agent_id: string
          action_type: string
          risk_level?: RiskLevel
          status?: AIActionStatus
          draft_content?: Record<string, unknown>
          context_summary?: string | null
          executed_at?: string | null
          approved_by?: string | null
          approved_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          transaction_id?: string
          agent_id?: string
          action_type?: string
          risk_level?: RiskLevel
          status?: AIActionStatus
          draft_content?: Record<string, unknown>
          context_summary?: string | null
          executed_at?: string | null
          approved_by?: string | null
          approved_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      agent_memories: {
        Row: {
          id: string
          agent_id: string
          memory_type: MemoryType
          content: string
          source: string
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          memory_type: MemoryType
          content: string
          source?: string
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          memory_type?: MemoryType
          content?: string
          source?: string
          active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      compliance_requirements: {
        Row: {
          id: string
          transaction_id: string
          requirement_type: string
          triggered_by: string | null
          status: ComplianceStatus
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          requirement_type: string
          triggered_by?: string | null
          status?: ComplianceStatus
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          requirement_type?: string
          triggered_by?: string | null
          status?: ComplianceStatus
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      email_threads: {
        Row: {
          id: string
          transaction_id: string
          party_id: string | null
          subject: string | null
          outlook_conversation_id: string | null
          messages: unknown[]
          last_message_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          party_id?: string | null
          subject?: string | null
          outlook_conversation_id?: string | null
          messages?: unknown[]
          last_message_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          party_id?: string | null
          subject?: string | null
          outlook_conversation_id?: string | null
          messages?: unknown[]
          last_message_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      task_notes: {
        Row: {
          id: string
          task_id: string
          author_type: string
          author_id: string | null
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          author_type: string
          author_id?: string | null
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          author_type?: string
          author_id?: string | null
          content?: string
          created_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          id: string
          agent_id: string | null
          brokerage_id: string
          name: string
          category: EmailTemplateCategory
          subject: string
          body: string
          variables: string[]
          is_shared: boolean
          usage_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id?: string | null
          brokerage_id: string
          name: string
          category?: EmailTemplateCategory
          subject: string
          body: string
          variables?: string[]
          is_shared?: boolean
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string | null
          brokerage_id?: string
          name?: string
          category?: EmailTemplateCategory
          subject?: string
          body?: string
          variables?: string[]
          is_shared?: boolean
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      portal_links: {
        Row: {
          id: string
          transaction_id: string
          token: string
          party_role: 'buyer' | 'seller'
          created_by: string
          is_active: boolean
          expires_at: string | null
          access_count: number
          last_accessed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          token: string
          party_role: 'buyer' | 'seller'
          created_by: string
          is_active?: boolean
          expires_at?: string | null
          access_count?: number
          last_accessed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          token?: string
          party_role?: 'buyer' | 'seller'
          created_by?: string
          is_active?: boolean
          expires_at?: string | null
          access_count?: number
          last_accessed_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      esign_events: {
        Row: {
          id: string
          document_id: string | null
          transaction_id: string
          provider: string
          event_type: string
          envelope_id: string
          payload: Record<string, unknown>
          processed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          document_id?: string | null
          transaction_id: string
          provider?: string
          event_type: string
          envelope_id: string
          payload?: Record<string, unknown>
          processed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string | null
          transaction_id?: string
          provider?: string
          event_type?: string
          envelope_id?: string
          payload?: Record<string, unknown>
          processed?: boolean
          created_at?: string
        }
        Relationships: []
      }
      inbound_emails: {
        Row: {
          id: string
          agent_id: string | null
          transaction_id: string | null
          from_email: string
          from_name: string | null
          subject: string | null
          body_text: string | null
          message_id: string | null
          in_reply_to: string | null
          attachment_count: number
          processing_status: InboundEmailProcessingStatus
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          agent_id?: string | null
          transaction_id?: string | null
          from_email: string
          from_name?: string | null
          subject?: string | null
          body_text?: string | null
          message_id?: string | null
          in_reply_to?: string | null
          attachment_count?: number
          processing_status?: InboundEmailProcessingStatus
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string | null
          transaction_id?: string | null
          from_email?: string
          from_name?: string | null
          subject?: string | null
          body_text?: string | null
          message_id?: string | null
          in_reply_to?: string | null
          attachment_count?: number
          processing_status?: InboundEmailProcessingStatus
          error_message?: string | null
          created_at?: string
        }
        Relationships: []
      }
      inbound_attachments: {
        Row: {
          id: string
          inbound_email_id: string
          document_id: string | null
          filename: string
          content_type: string
          size_bytes: number
          storage_path: string | null
          is_pdf: boolean
          content_hash: string | null
          extraction_status: InboundAttachmentExtractionStatus
          extracted_data: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id?: string
          inbound_email_id: string
          document_id?: string | null
          filename: string
          content_type: string
          size_bytes: number
          storage_path?: string | null
          is_pdf?: boolean
          content_hash?: string | null
          extraction_status?: InboundAttachmentExtractionStatus
          extracted_data?: Record<string, unknown> | null
          created_at?: string
        }
        Update: {
          id?: string
          inbound_email_id?: string
          document_id?: string | null
          filename?: string
          content_type?: string
          size_bytes?: number
          storage_path?: string | null
          is_pdf?: boolean
          content_hash?: string | null
          extraction_status?: InboundAttachmentExtractionStatus
          extracted_data?: Record<string, unknown> | null
          created_at?: string
        }
        Relationships: []
      }
      team_memberships: {
        Row: {
          id: string
          agent_id: string
          member_id: string
          role: TeamRole
          permissions: TeamPermissions
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          member_id: string
          role: TeamRole
          permissions?: TeamPermissions
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          member_id?: string
          role?: TeamRole
          permissions?: TeamPermissions
          created_at?: string
        }
        Relationships: []
      }
      preferred_vendors: {
        Row: {
          id: string
          agent_id: string
          category: VendorCategory
          name: string
          company: string | null
          email: string | null
          phone: string | null
          notes: string | null
          is_brokerage_shared: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          category: VendorCategory
          name: string
          company?: string | null
          email?: string | null
          phone?: string | null
          notes?: string | null
          is_brokerage_shared?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          category?: VendorCategory
          name?: string
          company?: string | null
          email?: string | null
          phone?: string | null
          notes?: string | null
          is_brokerage_shared?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// ============================================================
// CONVENIENCE ROW TYPES
// ============================================================

export type Brokerage = Database['public']['Tables']['brokerages']['Row']
export type Agent = Database['public']['Tables']['agents']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type Party = Database['public']['Tables']['parties']['Row']
export type Deadline = Database['public']['Tables']['deadlines']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Document = Database['public']['Tables']['documents']['Row']
export type AIAction = Database['public']['Tables']['ai_actions']['Row']
export type AgentMemory = Database['public']['Tables']['agent_memories']['Row']
export type ComplianceRequirement = Database['public']['Tables']['compliance_requirements']['Row']
export type EmailThread = Database['public']['Tables']['email_threads']['Row']
export type EmailTemplate = Database['public']['Tables']['email_templates']['Row']

// Task notes
export interface TaskNoteRow {
  id: string
  task_id: string
  author_type: 'agent' | 'ai' | 'system'
  author_id: string | null
  content: string
  created_at: string
}
export type TaskNoteInsert = Omit<TaskNoteRow, 'id' | 'created_at'>

// Email templates
export interface EmailTemplateRow {
  id: string
  agent_id: string | null
  brokerage_id: string
  name: string
  category: EmailTemplateCategory
  subject: string
  body: string
  variables: string[]
  is_shared: boolean
  usage_count: number
  created_at: string
  updated_at: string
}
export type EmailTemplateInsert = Omit<EmailTemplateRow, 'id' | 'created_at' | 'updated_at' | 'usage_count'>
export type EmailTemplateUpdate = Partial<Omit<EmailTemplateRow, 'id' | 'created_at' | 'updated_at'>>

// Portal links
export interface PortalLinkRow {
  id: string
  transaction_id: string
  token: string
  party_role: 'buyer' | 'seller'
  created_by: string
  is_active: boolean
  expires_at: string | null
  access_count: number
  last_accessed_at: string | null
  created_at: string
}
export type PortalLinkInsert = Omit<PortalLinkRow, 'id' | 'created_at' | 'access_count' | 'last_accessed_at'>

// E-sign events
export interface EsignEventRow {
  id: string
  document_id: string | null
  transaction_id: string
  provider: string
  event_type: string
  envelope_id: string
  payload: Record<string, unknown>
  processed: boolean
  created_at: string
}
export type EsignEventInsert = Omit<EsignEventRow, 'id' | 'created_at' | 'processed'>

// Inbound emails
export interface InboundEmailRow {
  id: string
  agent_id: string | null
  transaction_id: string | null
  from_email: string
  from_name: string | null
  subject: string | null
  body_text: string | null
  message_id: string | null
  in_reply_to: string | null
  attachment_count: number
  processing_status: InboundEmailProcessingStatus
  error_message: string | null
  created_at: string
}
export type InboundEmailInsert = Omit<InboundEmailRow, 'id' | 'created_at' | 'attachment_count' | 'processing_status'>
  & Partial<Pick<InboundEmailRow, 'attachment_count' | 'processing_status'>>

// Inbound attachments
export interface InboundAttachmentRow {
  id: string
  inbound_email_id: string
  document_id: string | null
  filename: string
  content_type: string
  size_bytes: number
  storage_path: string | null
  is_pdf: boolean
  content_hash: string | null
  extraction_status: InboundAttachmentExtractionStatus
  extracted_data: Record<string, unknown> | null
  created_at: string
}
export type InboundAttachmentInsert = Omit<InboundAttachmentRow, 'id' | 'created_at' | 'is_pdf' | 'extraction_status'>
  & Partial<Pick<InboundAttachmentRow, 'is_pdf' | 'extraction_status'>>

// Team memberships
export interface TeamMembershipRow {
  id: string
  agent_id: string
  member_id: string
  role: TeamRole
  permissions: TeamPermissions
  created_at: string
}
export type TeamMembershipInsert = Omit<TeamMembershipRow, 'id' | 'created_at'>
  & Partial<Pick<TeamMembershipRow, 'permissions'>>

// Preferred vendors
export interface PreferredVendor {
  id: string
  agent_id: string
  category: VendorCategory
  name: string
  company: string | null
  email: string | null
  phone: string | null
  notes: string | null
  is_brokerage_shared: boolean
  created_at: string
}

// Document scan finding (matches scan_findings JSONB column)
export interface ScanFinding {
  text: string
  severity: 'error' | 'warning' | 'info'
}

// Enriched type returned by /api/feed (AIAction + joined transaction fields)
export interface AIActionWithTransaction extends AIAction {
  transaction: {
    property_address: string
    stage: string
  } | null
}

// Insert types
export type BrokerageInsert = Database['public']['Tables']['brokerages']['Insert']
export type AgentInsert = Database['public']['Tables']['agents']['Insert']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type PartyInsert = Database['public']['Tables']['parties']['Insert']
export type DeadlineInsert = Database['public']['Tables']['deadlines']['Insert']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type DocumentInsert = Database['public']['Tables']['documents']['Insert']
export type AIActionInsert = Database['public']['Tables']['ai_actions']['Insert']
export type AgentMemoryInsert = Database['public']['Tables']['agent_memories']['Insert']
export type ComplianceRequirementInsert = Database['public']['Tables']['compliance_requirements']['Insert']
export type EmailThreadInsert = Database['public']['Tables']['email_threads']['Insert']
export type EmailTemplateDbInsert = Database['public']['Tables']['email_templates']['Insert']

// Update types
export type BrokerageUpdate = Database['public']['Tables']['brokerages']['Update']
export type AgentUpdate = Database['public']['Tables']['agents']['Update']
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update']
export type PartyUpdate = Database['public']['Tables']['parties']['Update']
export type DeadlineUpdate = Database['public']['Tables']['deadlines']['Update']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']
export type DocumentUpdate = Database['public']['Tables']['documents']['Update']
export type AIActionUpdate = Database['public']['Tables']['ai_actions']['Update']
export type AgentMemoryUpdate = Database['public']['Tables']['agent_memories']['Update']
export type ComplianceRequirementUpdate = Database['public']['Tables']['compliance_requirements']['Update']
export type EmailThreadUpdate = Database['public']['Tables']['email_threads']['Update']
export type EmailTemplateDbUpdate = Database['public']['Tables']['email_templates']['Update']
