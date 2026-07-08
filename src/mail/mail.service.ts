import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface Attachment {
  filename: string;
  content: string;   // base64
  contentType: string;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  attachments?: Attachment[];
}

interface SendEmailResult {
  id?: string;
  error?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger('MailService');
  private readonly resend: Resend;
  private readonly defaultFrom: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) throw new InternalServerErrorException('RESEND_API_KEY no está configurada');
    this.resend       = new Resend(apiKey);
    this.defaultFrom  = this.configService.get<string>('MAIL_FROM') ?? 'onboarding@resend.dev';
  }

  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      const { data, error } = await this.resend.emails.send({
        from:        options.from ?? this.defaultFrom,
        to:          options.to,
        subject:     options.subject,
        html:        options.html,
        attachments: options.attachments?.map((a) => ({
          filename:    a.filename,
          content:     a.content,
          content_type: a.contentType,
        })),
      });

      if (error) {
        this.logger.warn(`Error Resend para ${options.to}: ${error.message}`);
        return { error: error.message };
      }

      return { id: data.id };
    } catch (err) {
      this.logger.error(`Excepción enviando a ${options.to}`, err);
      return { error: err.message ?? 'Error desconocido' };
    }
  }

  textToHtml(text: string): string {
    return text
      .split('\n')
      .map((line) => `<p>${line || '&nbsp;'}</p>`)
      .join('');
  }

  interpolate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => variables[key] ?? `{${key}}`);
  }
}
