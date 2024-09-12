import { api, APIError } from "encore.dev/api";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prismaClient = new PrismaClient();

interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
  org_id: number;
}

interface ResetPasswordResponse {
  message: string;
}

export const resetPassword = api(
  {
    method: "POST",
    path: "/api/resetPassword",
    expose: true,
  },
  async (params: { body: ResetPasswordRequest }): Promise<ResetPasswordResponse> => {
    const { resetToken, newPassword, org_id } = params.body;

    try {
      console.log('Received resetToken:', resetToken);
      console.log('Received org_id:', org_id);

      // Find the user with the matching reset token and not expired
      const user = await prismaClient.user.findFirst({
        where: {
          resetToken,
          resetTokenExpiry: {
            gte: new Date(), // Ensure the token has not expired
          },
          org_id: org_id,
        },
      });

      if (!user) {
        console.log('User not found or token expired');
        throw APIError.invalidArgument("Invalid or expired reset token");
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password and clear the reset token
      await prismaClient.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return { message: 'Password reset successfully' };
    } catch (error: unknown) {
      if (error instanceof APIError) {
        throw error; // Re-throw APIError to handle specific cases
      } else if (error instanceof Error) {
        console.error("Error during password reset:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      } else {
        console.error("Unknown error:", error);
      }
      throw APIError.internal("Failed to reset password");
    }
  }
);
