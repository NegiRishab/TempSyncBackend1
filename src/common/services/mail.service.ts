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
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9f9f9; border-radius: 8px; color: #333;">
    <h2 style="color: #2c3e50;">You're Invited to Join <span style="color: #007bff;">${orgName}</span>!</h2>
    
    <p>Hi there,</p>
    
    <p>
      You've been invited to join <strong>${orgName}</strong> on <strong>YourApp</strong>, a platform built for better collaboration and productivity.
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
    <p style="font-size: 12px; color: #aaa;">© ${new Date().getFullYear()} YourApp. All rights reserved.</p>
  </div>
`,
    });
  }
}
