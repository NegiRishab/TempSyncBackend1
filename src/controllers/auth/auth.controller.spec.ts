import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";
import axios from "axios";
import { AuthController } from "./auth.controller";

jest.mock("axios");
jest.mock("uuid", () => ({ v4: () => "test-token" }));

describe("Invitation signup", () => {
  const users = { findOne: jest.fn(), create: jest.fn() };
  const invitations = { validateToken: jest.fn(), markAsUsed: jest.fn() };
  const dto = {
    token: "test-token",
    firstName: "Test",
    lastName: "User",
    password: "Test-pass1!",
  };
  const controller = () =>
    new AuthController(
      users as any,
      {} as any,
      { encodePassword: () => "hashed" } as any,
      {} as any,
      new ConfigService({ CHAT_SERVICE_URL: "http://chat:4000/" }),
      {} as any,
      invitations as any,
    );

  beforeEach(() => {
    jest.resetAllMocks();
    users.findOne.mockResolvedValue(null);
    users.create.mockResolvedValue({ id: "user-id" });
    invitations.validateToken.mockResolvedValue({
      email: "test@example.com",
      organization: { id: "org-id" },
    });
    invitations.markAsUsed.mockResolvedValue(undefined);
    jest.spyOn(Logger.prototype, "warn").mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it("creates the account and adds it to chat using the configured internal URL", async () => {
    (axios.post as jest.Mock).mockResolvedValue({ data: {} });
    await expect(controller().signUpFromInvite(dto)).resolves.toEqual({
      message: "User created successfully from invitation",
    });
    expect(invitations.markAsUsed).toHaveBeenCalledWith(dto.token);
    expect(axios.post).toHaveBeenCalledWith(
      "http://chat:4000/api/conversations/add-new-user-global",
      { userId: "user-id", orgId: "org-id" },
      { timeout: 10000 },
    );
  });

  it("keeps signup successful if chat fails after the account is created", async () => {
    (axios.post as jest.Mock).mockRejectedValue(new Error("chat unavailable"));
    await expect(controller().signUpFromInvite(dto)).resolves.toEqual({
      message: "User created successfully from invitation",
    });
    expect(users.create).toHaveBeenCalledTimes(1);
    expect(invitations.markAsUsed).toHaveBeenCalledWith(dto.token);
    expect(Logger.prototype.warn).toHaveBeenCalled();
  });

  it("rejects consumed invitations without creating another account", async () => {
    invitations.validateToken.mockResolvedValue(null);
    await expect(controller().signUpFromInvite(dto)).rejects.toThrow(
      "Invitation is invalid or expired.",
    );
    expect(users.create).not.toHaveBeenCalled();
    expect(axios.post).not.toHaveBeenCalled();
  });
});
