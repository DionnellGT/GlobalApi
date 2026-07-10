export type ResendWebhookType =
  | 'email.sent'
  | 'email.delivered'
  | 'email.delivery_delayed'
  | 'email.bounced'
  | 'email.complained'

export interface ResendWebhookPayload {
  type: ResendWebhookType
  created_at: string
  data: {
    email_id: string
    from: string
    to: string[]
    subject: string
    bounce?: {
      type: 'hard' | 'soft'
      message?: string
    }
    complaint?: {
      complaint_type: string
    }
  }
}
