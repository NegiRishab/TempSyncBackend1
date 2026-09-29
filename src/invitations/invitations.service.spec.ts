import { ConfigService } from "@nestjs/config";
import { InvitationsService } from "./invitations.service";

jest.mock("uuid", () => ({ v4: () => "test-token" }));

describe("Invitation links", () => {
  const repository = {
    create: jest.fn((data) => data),
    save: jest.fn().mockResolvedValue(undefined),
  };
  const mailer = {
    sendInvitationEmail: jest.fn().mockResolvedValue(undefined),
  };
  beforeEach(() => jest.clearAllMocks());

  it.each([
    [
      {
        PUBLIC_FRONTEND_URL: "https://app.example.com/",
        FRONTEND_URL: "http://localhost,http://localhost:80",
      },
      "https://app.example.com/invite/accept?token=test-token",
    ],
    [
      { FRONTEND_URL: "http://localhost,http://localhost:80" },
      "http://localhost/invite/accept?token=test-token",
    ],
    [
      { PUBLIC_FRONTEND_URL: "https://app.example.com/devsync/?old=1#section" },
      "https://app.example.com/devsync/invite/accept?token=test-token",
    ],
  ])(
    "builds a frontend link from configuration %j",
    async (settings, expected) => {
      const service = new InvitationsService(
        repository as any,
        mailer as any,
        new ConfigService(settings),
      );
      const invitation = await service.createInvitation("to@example.com", {
        id: "org-id",
        name: "Team",
      } as any);
      expect(mailer.sendInvitationEmail).toHaveBeenCalledWith(
        "to@example.com",
        "Team",
        expected,
      );
      expect(invitation.token).toBe("test-token");
      expect(repository.save).toHaveBeenCalledWith(invitation);
    },
  );

  it.each([
    {},
    { PUBLIC_FRONTEND_URL: "invalid" },
    { PUBLIC_FRONTEND_URL: "javascript:alert(1)" },
  ])(
    "rejects invalid frontend configuration before saving or sending",
    async (settings) => {
      const service = new InvitationsService(
        repository as any,
        mailer as any,
        new ConfigService(settings),
      );
      await expect(
        service.createInvitation("to@example.com", {
          id: "org-id",
          name: "Team",
        } as any),
      ).rejects.toThrow();
      expect(repository.save).not.toHaveBeenCalled();
      expect(mailer.sendInvitationEmail).not.toHaveBeenCalled();
    },
  );
});
