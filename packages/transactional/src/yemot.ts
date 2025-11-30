import { env } from "../env";

interface SendVoiceOTPOptions {
  /**
   * The phone number to send the voice verification to in E.164 format (e.g., +972501234567)
   */
  to: string;
}

const YEMOT_API_URL = "https://www.call2all.co.il/ym/api";

/**
 * Uses Yemot API to call the provided phone from a random caller ID.
 * The last 4 digits of the caller ID will be the OTP code.
 */
export async function sendVoicePhoneVerification({
  to,
}: SendVoiceOTPOptions): Promise<string> {
  if (!to.startsWith("+972")) {
    throw new Error("Only Israeli phone numbers are supported, got: " + to);
  }

  const phone = to.replace("+972", "0");

  const response = await fetch(`${YEMOT_API_URL}/RunTzintuk`, {
    method: "POST",
    headers: {
      Authorization: `${env.YEMOT_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      callerId: "RAND",
      phones: [phone],
    }),
  });

  if (!response.ok) {
    throw new Error(
      "Failed to send voice phone verification: " + response.statusText,
    );
  }

  const data = (await response.json()) as {
    responseStatus: string;
    verifyCode: string;
  };

  if (data.responseStatus !== "OK") {
    console.error("Failed to send voice phone verification", data);
    throw new Error(
      "Failed to send voice phone verification: " + data.responseStatus,
    );
  }

  console.log(data);

  return data.verifyCode;
}

interface SendSMSOptions {
  /**
   * The phone number to send the SMS to in E.164 format (e.g., +972501234567)
   */
  to: string;
  /**
   * The message to send in the SMS
   */
  message: string;

  /**
   * The sender ID to use for the SMS
   * By default, it will be your Yemot caller ID
   * Can also be a secondary caller ID from your Yemot account
   * or a custom text sender ID if allowed by your Yemot account
   */
  senderId?: string;
}

export async function sendSMS({
  to,
  message,
  senderId,
}: SendSMSOptions): Promise<void> {
  if (!to.startsWith("+972")) {
    throw new Error("Only Israeli phone numbers are supported, got: " + to);
  }

  const phone = to.replace("+972", "0");

  const response = await fetch(`${YEMOT_API_URL}/SendSms`, {
    method: "POST",
    headers: {
      Authorization: `${env.YEMOT_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phones: phone,
      from: senderId,
      message,
    }),
  });

  if (!response.ok) {
    console.error(
      "Failed to send SMS",
      await response.json().catch((error) => console.error(error)),
    );
    throw new Error("Failed to send SMS: " + response.statusText);
  }

  const data = (await response.json()) as {
    responseStatus: string;
  };

  if (data.responseStatus !== "OK") {
    console.error("Failed to send SMS", data);
    throw new Error("Failed to send SMS: " + data.responseStatus);
  }
}
