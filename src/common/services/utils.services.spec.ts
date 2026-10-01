import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UtilitiesServices } from "./utils.services";

describe("UtilitiesServices dependency compatibility", () => {
  const jwt = new JwtService();
  const config = new ConfigService({
    JWT_SECRET: "unit-test-only-secret",
    JWT_EXPIRES_IN_HOURS: "2",
  });
  const service = new UtilitiesServices(jwt, config);

  it("converts an image to PNG using the installed Sharp runtime", async () => {
    const input = Buffer.from('<svg width="2" height="2"><rect width="2" height="2" fill="red"/></svg>');
    const png = await service.convertImageToPng(input);
    expect(png.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  });

  it("keeps the configured JWT lifetime in hours", async () => {
    const user = { id: "user-1", email: "test@example.com", accountId: "account-1" };
    const token = await service.generateToken(user);
    const payload = jwt.verify(token, { secret: "unit-test-only-secret" });
    expect(payload).toMatchObject(user);
    expect(payload.exp - payload.iat).toBe(2 * 60 * 60);
  });

  it("rejects missing JWT expiry configuration", async () => {
    const missingExpiry = new UtilitiesServices(jwt, new ConfigService({ JWT_SECRET: "unit-test-only-secret" }));
    await expect(missingExpiry.generateToken({ id: "user-1", email: "test@example.com", accountId: "account-1" }))
      .rejects.toThrow("JWT_EXPIRES_IN_HOURS");
  });
});
