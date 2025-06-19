// src/invitations/invitations.service.ts

import { Injectable } from "@nestjs/common";
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
  ) {}

  async createInvitation(
    email: string,
    organization: Organization,
  ): Promise<Invitation> {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h expiry

    const invitation = this.invitationRepo.create({
      email,
      organization,
      organizationId: organization.id,
      token,
      expiresAt,
    });

    await this.invitationRepo.save(invitation);

    const invitationUrl = `http://localhost:5173/invite/accept?token=${token}`;
    await this.mailerService.sendInvitationEmail(
      email,
      organization.name,
      invitationUrl,
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
