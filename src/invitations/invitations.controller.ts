// src/invitations/invitations.controller.ts

import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { InvitationsService } from "./invitations.service";
import { OrganizationService } from "src/controllers/organization/organization.service";
import { ERRORS } from "src/common/constants";

@Controller("invitations")
export class InvitationsController {
  constructor(
    private readonly invitationsService: InvitationsService,
    private readonly organizationsService: OrganizationService,
  ) {}

  @Post()
  async inviteUser(
    @Body("email") email: string,
    @Body("organizationId") organizationId: string,
  ) {
    const org = await this.organizationsService.findOne({
      where: { id: organizationId },
    });
    if (!org) {
      throw new HttpException(
        ERRORS.USER.ORGANIZATION_IS_INVALID,
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.invitationsService.createInvitation(email, org);
  }

  @Get("validate")
  async validate(@Query("token") token: string) {
    const invite = await this.invitationsService.validateToken(token);
    if (!invite) {
      return { valid: false };
    }
    return {
      valid: true,
      email: invite.email,
      organizationName: invite.organization.name,
    };
  }
}
