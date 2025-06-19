import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailerService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: {
        user: "apikey",
        pass: this.configService.get<string>("SENDGRID_API_KEY"),
      },
    });
  }

  async sendInvitationEmail(to: string, orgName: string, link: string) {
    await this.transporter.sendMail({
      from: `<${this.configService.get("EMAIL_FROM")}>`,
      to,
      subject: `You're invited to join ${orgName}`,
      html: `
        <p>Hi,</p>
        <p>You’ve been invited to join <strong>${orgName}</strong> on YourApp.</p>
        <p><a href="${link}">Click here to accept your invitation</a></p>
        <p>This link will expire in 24 hours.</p>
      `,
    });
  }
}
