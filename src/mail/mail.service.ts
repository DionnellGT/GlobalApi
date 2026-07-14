import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface Attachment {
  filename: string;
  content: string;
  contentType: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from: string;         // "Nombre <email@dominio.cl>" — requerido, ya viene construido
  domain: string;       // "elavellano.cl" | "globalterrenos.cl" — para elegir API key
  attachments?: Attachment[];
}

interface SendEmailResult {
  id?: string;
  error?: string;
}

// Configuración de cada dominio
interface DomainConfig {
  apiKey: string;
  client: Resend;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger('MailService');
  private readonly domains: Map<string, DomainConfig> = new Map();

  constructor(private readonly configService: ConfigService) {
    // Registrar dominios disponibles
    this.registerDomain(
      'elavellano.cl',
      this.configService.get<string>('RESEND_API_KEY_ELAVELLANO'),
    );
    this.registerDomain(
      'globalterrenos.cl',
      this.configService.get<string>('RESEND_API_KEY_GLOBALTERRENOS'),
    );
  }

  private registerDomain(domain: string, apiKey: string | undefined): void {
    if (!apiKey) {
      this.logger.warn(`No se encontró API key para el dominio ${domain} — se omitirá`);
      return;
    }
    this.domains.set(domain, { apiKey, client: new Resend(apiKey) });
    this.logger.log(`Dominio registrado: ${domain}`);
  }

  getAvailableDomains(): string[] {
    return Array.from(this.domains.keys());
  }

  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const config = this.domains.get(options.domain);

    if (!config) {
      const msg = `Dominio "${options.domain}" no está configurado`;
      this.logger.error(msg);
      return { error: msg };
    }

    try {
      const { data, error } = await config.client.emails.send({
        from:        options.from,
        to:          options.to,
        subject:     options.subject,
        html:        options.html,
        attachments: options.attachments?.map((a) => ({
          filename:    a.filename,
          content:     a.content,
          contentType: a.contentType,
        })),
      });

      if (error) {
        this.logger.warn(`Error Resend [${options.domain}] para ${options.to}: ${error.message}`);
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
