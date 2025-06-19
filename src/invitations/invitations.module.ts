// invitations.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Invitation } from "./entities/invitation.entity";
import { InvitationsService } from "./invitations.service";
import { InvitationsController } from "./invitations.controller";
import { OrganizationModule } from "src/controllers/organization/organization.module";
import { MailModule } from "src/common/services/mail.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Invitation]),
    MailModule,
    OrganizationModule,
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}
