// src/invitations/invitations.service.ts

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Invitation } from "./entities/invitation.entity";
import { Repository } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { Organization } from "src/controllers/organization/entities/organization.entity";
import { MailerService } from "src/common/services/mail.service";

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationRepo: Repository<Invitation>,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async createInvitation(
    email: string,
    organization: Organization,
  ): Promise<Invitation> {
    const token = uuidv4();
    const frontendUrl =
      this.configService.get<string>("PUBLIC_FRONTEND_URL")?.trim() ||
      this.configService.get<string>("FRONTEND_URL")?.split(",")[0].trim();
    if (!frontendUrl) {
      throw new Error("PUBLIC_FRONTEND_URL must be configured for invitations");
    }
    const invitationUrl = new URL(frontendUrl);
    if (
      !["http:", "https:"].includes(invitationUrl.protocol) ||
      invitationUrl.username ||
      invitationUrl.password
    ) {
      throw new Error("PUBLIC_FRONTEND_URL must be an HTTP(S) frontend URL");
    }
    invitationUrl.pathname = `${invitationUrl.pathname.replace(/\/$/, "")}/invite/accept`;
    invitationUrl.search = "";
    invitationUrl.hash = "";
    invitationUrl.searchParams.set("token", token);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h expiry

    const invitation = this.invitationRepo.create({
      email,
      organization,
      organizationId: organization.id,
      token,
      expiresAt,
    });

    await this.invitationRepo.save(invitation);

    await this.mailerService.sendInvitationEmail(
      email,
      organization.name,
      invitationUrl.toString(),
    );

    return invitation;
  }

  async validateToken(token: string): Promise<Invitation | null> {
    const invitation = await this.invitationRepo.findOne({ where: { token } });
    if (
      !invitation ||
      invitation.status !== "pending" ||
      invitation.expiresAt < new Date()
    ) {
      return null;
    }
    return invitation;
  }

  async markAsUsed(token: string) {
    await this.invitationRepo.update({ token }, { status: "used" });
  }
}
