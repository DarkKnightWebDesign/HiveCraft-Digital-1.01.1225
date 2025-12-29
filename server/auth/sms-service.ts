import { SmsClient } from "@azure/communication-sms";
import { db } from "../db";
import { users } from "../../shared/models/auth";
import { eq } from "drizzle-orm";

// Azure Communication Services configuration
const ACS_CONNECTION_STRING = process.env.ACS_CONNECTION_STRING || "";
const ACS_PHONE_NUMBER = process.env.ACS_PHONE_NUMBER || ""; // Your ACS SMS-enabled phone number

let smsClient: SmsClient | null = null;

// Initialize SMS client only if credentials are available
if (ACS_CONNECTION_STRING) {
  smsClient = new SmsClient(ACS_CONNECTION_STRING);
}

/**
 * Generate a 6-digit verification code
 */
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send SMS verification code to a phone number
 * @param phoneNumber - Phone number in E.164 format (e.g., +14255550123)
 * @param userId - User ID to associate the verification code with
 * @returns Success status and message
 */
export async function sendVerificationCode(
  phoneNumber: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  if (!smsClient || !ACS_PHONE_NUMBER) {
    return {
      success: false,
      message: "SMS service not configured. Please set ACS_CONNECTION_STRING and ACS_PHONE_NUMBER environment variables.",
    };
  }

  try {
    // Validate phone number format (basic E.164 validation)
    if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
      return {
        success: false,
        message: "Invalid phone number format. Use E.164 format (e.g., +14255550123)",
      };
    }

    // Generate verification code
    const code = generateVerificationCode();
    
    // Set expiry time (10 minutes from now)
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);

    // Update user record with verification code
    await db
      .update(users)
      .set({
        phoneNumber,
        verificationCode: code,
        verificationCodeExpiry: expiry,
        phoneVerified: "false",
      })
      .where(eq(users.id, userId));

    // Send SMS
    const message = `Your HiveCraft Digital verification code is: ${code}. This code expires in 10 minutes.`;
    
    const sendResult = await smsClient.send({
      from: ACS_PHONE_NUMBER,
      to: [phoneNumber],
      message,
    });

    // Check if message was sent successfully
    const result = sendResult[0];
    if (result.successful) {
      return {
        success: true,
        message: "Verification code sent successfully",
      };
    } else {
      return {
        success: false,
        message: `Failed to send SMS: ${result.errorMessage || "Unknown error"}`,
      };
    }
  } catch (error: any) {
    console.error("Error sending verification SMS:", error);
    return {
      success: false,
      message: error.message || "Failed to send verification code",
    };
  }
}

/**
 * Verify the code entered by the user
 * @param userId - User ID
 * @param code - Verification code entered by user
 * @returns Success status and message
 */
export async function verifyCode(
  userId: string,
  code: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Get user record
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Check if verification code exists
    if (!user.verificationCode) {
      return {
        success: false,
        message: "No verification code found. Please request a new code.",
      };
    }

    // Check if code has expired
    if (!user.verificationCodeExpiry || new Date() > user.verificationCodeExpiry) {
      return {
        success: false,
        message: "Verification code has expired. Please request a new code.",
      };
    }

    // Verify code matches
    if (user.verificationCode !== code) {
      return {
        success: false,
        message: "Invalid verification code",
      };
    }

    // Mark phone as verified and clear verification code
    await db
      .update(users)
      .set({
        phoneVerified: "true",
        verificationCode: null,
        verificationCodeExpiry: null,
      })
      .where(eq(users.id, userId));

    return {
      success: true,
      message: "Phone number verified successfully",
    };
  } catch (error: any) {
    console.error("Error verifying code:", error);
    return {
      success: false,
      message: error.message || "Failed to verify code",
    };
  }
}

/**
 * Check if SMS service is configured
 */
export function isSmsConfigured(): boolean {
  return !!(smsClient && ACS_CONNECTION_STRING && ACS_PHONE_NUMBER);
}
