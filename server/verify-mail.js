import "./env.js";
import { createMailService } from "./mail.js";

try {
  const service = createMailService();
  if (!service) throw new Error("MISSING_CONFIGURATION");
  await service.verify();
  console.log("Gmail authentication succeeded. No email was sent.");
} catch (error) {
  console.error(
    "Gmail verification failed. Check GMAIL_USER, GMAIL_APP_PASSWORD, and network access.",
  );
  console.error(`Reason: ${error.code || "MISSING_OR_INVALID_CONFIGURATION"}`);
  process.exitCode = 1;
}
