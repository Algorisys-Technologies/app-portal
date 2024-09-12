import { api, APIError } from "encore.dev/api";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prismaClient = new PrismaClient();

interface ResetTokenRequest {
  email: string;
  org_id: number;
}

interface ResetTokenResponse {
  message: string;
  resetToken?: string;  
}

export const resetToken = api(
  {
    method: "POST",
    path: "/api/resetToken",
    expose: true,
  },
  async (params: { body: ResetTokenRequest }): Promise<ResetTokenResponse> => {
    const { email, org_id } = params.body;

    console.log('Email:', email);
    console.log('Org ID:', org_id);

    try {
      const user = await prismaClient.user.findFirst({
        where: {
          name: email,
          org_id: org_id,
        },
      });

      if (!user) {
        throw APIError.notFound("User not found in the specified organization");
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000);

      console.log('Generated Reset Token:', resetToken);

      await prismaClient.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });

      // Optionally include the resetToken in the response for debugging purposes
      return { 
        message: 'Reset token generated and sent to email',
        resetToken: resetToken,  // Include this only if you are sure it's safe
      };
    } catch (error: unknown) {
      if (error instanceof APIError) {
        throw error; // Re-throw APIError to handle specific cases
      } else if (error instanceof Error) {
        console.error("Error during reset token generation:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      } else {
        console.error("Unknown error:", error);
      }
      throw APIError.internal("Failed to generate reset token");
    }
  }
);
