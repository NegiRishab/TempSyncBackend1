import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly apiKey: string;
  private readonly emailFrom: string;

  constructor(private configService: ConfigService) {
    this.emailFrom =
      this.configService.getOrThrow<string>("ELASTIC_EMAIL_FROM");
    this.apiKey = this.configService.getOrThrow<string>(
      "ELASTIC_EMAIL_API_KEY",
    );
  }

  async sendInvitationEmail(to: string, orgName: string, link: string) {
    const invitationLink = link;
    const subject = `You're invited to join ${orgName}`;
    const text = `You're invited to join ${orgName} on DevSync. Accept your invitation: ${link}\nThis invitation link will expire in 24 hours.`;
    orgName = this.escapeHtml(orgName);
    link = this.escapeHtml(link);
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9f9f9; border-radius: 8px; color: #333;">
          <h2 style="color: #2c3e50;">You're Invited to Join <span style="color: #007bff;">${orgName}</span>!</h2>
          
          <p>Hi there,</p>
          
          <p>
            You've been invited to join <strong>${orgName}</strong> on <strong>DevSync</strong>, a platform built for better collaboration and productivity.
          </p>
          
          <p>
            Click the button below to accept your invitation and get started:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="background-color: #007bff; color: #ffffff; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p>
            If the button doesn't work, you can also copy and paste this link into your browser:
          </p>
          <p style="word-break: break-all;"><a href="${link}" style="color: #007bff;">${link}</a></p>

          <p style="font-size: 12px; color: #888;">This invitation link will expire in 24 hours.</p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;">
          <p style="font-size: 12px; color: #aaa;">© ${new Date().getFullYear()} DevSync. All rights reserved.</p>
        </div>
      `;
    try {
      await axios.post(
        "https://api.elasticemail.com/v4/emails/transactional",
        {
          Recipients: { To: [to] },
          Content: {
            From: this.emailFrom,
            Subject: subject,
            Body: [
              { ContentType: "HTML", Content: html },
              { ContentType: "PlainText", Content: text },
            ],
          },
        },
        {
          headers: { "X-ElasticEmail-ApiKey": this.apiKey },
          timeout: 15000,
        },
      );
    } catch (error) {
      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined;
      const detail = this.providerError(
        axios.isAxiosError(error) ? error.response?.data : undefined,
        [this.apiKey, invitationLink, link, to, this.emailFrom],
      );
      this.logger.error(
        `Elastic Email invitation delivery failed (HTTP ${status ?? "unavailable"}): ${detail}`,
      );
      throw new ServiceUnavailableException("Unable to send invitation email");
    }
    this.logger.log("Invitation email accepted by Elastic Email");
  }

  private providerError(data: unknown, secrets: string[]): string {
    let messages: unknown[] = [];
    if (typeof data === "string") {
      messages = [data];
    } else if (data && typeof data === "object") {
      const body = data as Record<string, unknown>;
      // Read provider messages only, never the Axios request/config (API key).
      messages = [
        body.Error,
        body.Message,
        body.message,
        body.detail,
        body.title,
      ];
      const errors = body.Errors ?? body.errors;
      if (errors && typeof errors === "object") {
        messages.push(...Object.values(errors).flat());
      }
    }
    let detail = messages
      .filter((value): value is string => typeof value === "string")
      .join("; ");
    for (const secret of secrets.filter(Boolean)) {
      detail = detail.split(secret).join("[redacted]");
    }
    detail = detail
      .replace(/https?:\/\/[^\s<>"']+/gi, "[redacted URL]")
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted email]")
      .replace(/[\r\n\t]/g, " ")
      .slice(0, 1000);
    return (
      detail ||
      "No provider error details returned (check connection or timeout)"
    );
  }

  private escapeHtml(value: string): string {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return value.replace(/[&<>"']/g, (character) => entities[character]);
  }
}
