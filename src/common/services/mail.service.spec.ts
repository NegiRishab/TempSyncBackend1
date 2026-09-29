import { ConfigService } from "@nestjs/config";
import { Logger, ServiceUnavailableException } from "@nestjs/common";
import axios from "axios";
import { MailerService } from "./mail.service";

jest.mock("axios");
const post = axios.post as jest.Mock;

describe("Elastic Email invitations", () => {
  const config = new ConfigService({
    ELASTIC_EMAIL_API_KEY: "test-key",
    ELASTIC_EMAIL_FROM: "sender@example.com",
  });
  beforeEach(() => jest.clearAllMocks());
  afterEach(() => jest.restoreAllMocks());

  it("sends the recipient, sender, escaped HTML and plain text using the API key", async () => {
    post.mockResolvedValue({ data: { TransactionID: "test-id" } });
    await new MailerService(config).sendInvitationEmail(
      "invitee@example.com",
      '<Team & "friends">',
      "https://app.example.com/invite/accept?token=abc&extra=1",
    );
    const [url, payload, options] = post.mock.calls[0];
    expect(url).toBe("https://api.elasticemail.com/v4/emails/transactional");
    expect(payload.Recipients.To).toEqual(["invitee@example.com"]);
    expect(payload.Content.From).toBe("sender@example.com");
    expect(payload.Content.Body[0].Content).toContain(
      "&lt;Team &amp; &quot;friends&quot;&gt;",
    );
    expect(payload.Content.Body[0].Content).toContain("token=abc&amp;extra=1");
    expect(payload.Content.Body[1].Content).toContain("token=abc&extra=1");
    expect(options.headers["X-ElasticEmail-ApiKey"]).toBe("test-key");
    expect(options.timeout).toBe(15000);
  });

  it("reports provider/network failures without exposing credentials", async () => {
    post.mockRejectedValue(new Error("secret provider detail"));
    await expect(
      new MailerService(config).sendInvitationEmail(
        "to@example.com",
        "Team",
        "https://app.example.com",
      ),
    ).rejects.toThrow(
      new ServiceUnavailableException("Unable to send invitation email"),
    );
  });
  it("logs the provider rejection while redacting credentials and invitation details", async () => {
    const log = jest
      .spyOn(Logger.prototype, "error")
      .mockImplementation(() => undefined);
    (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);
    post.mockRejectedValue({
      response: {
        status: 400,
        data: {
          Error: "Sender sender@example.com is not verified. test-key",
          errors: {
            link: [
              "Rejected https://app.example.com/invite/accept?token=secret-token",
            ],
          },
        },
      },
      config: { headers: { "X-ElasticEmail-ApiKey": "test-key" } },
    });
    await expect(
      new MailerService(config).sendInvitationEmail(
        "to@example.com",
        "Team",
        "https://app.example.com/invite/accept?token=secret-token",
      ),
    ).rejects.toThrow("Unable to send invitation email");
    const message = log.mock.calls[0][0];
    expect(message).toContain("HTTP 400");
    expect(message).toContain("is not verified");
    expect(message).not.toContain("test-key");
    expect(message).not.toContain("sender@example.com");
    expect(message).not.toContain("secret-token");
  });
});
