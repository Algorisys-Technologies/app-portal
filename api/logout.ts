import { api, APIError, Header } from "encore.dev/api";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prismaClient = new PrismaClient();

// JWT secret
const JWT_SECRET = process.env.SESSION_SECRET || 'your-secret-key';

interface LogoutRequest {}

interface LogoutResponse {
  message: string;
}

export const logout = api(
  {
    method: "POST",
    path: "/api/logout",
    expose: true,
    auth: true, // Ensure the endpoint requires authentication
  },
  async (params: { body: LogoutRequest }, context: { authorization: Header<"Authorization"> }): Promise<LogoutResponse> => {
    const authHeader = context.authorization;

    if (!authHeader) {
      console.error("No authorization header provided");
      throw APIError.unauthenticated("No authorization header provided");
    }

    const token = authHeader.replace(/^Bearer\s/, "");

    try {
      // Verify the token and extract user ID
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

      const userId = decoded.userId;

      // Update the user's record to clear tokens
      await prismaClient.user.update({
        where: { id: userId },
        data: {
          refreshToken: null,
          refreshTokenExpiry: null,
        },
      });

      console.log('Logout successful');
      return { message: 'Logged out successfully' };
    } catch (error: unknown) {
      if (error instanceof jwt.JsonWebTokenError) {
        console.error("Invalid or expired token");
        throw APIError.unauthenticated("Invalid or expired token");
      } else if (error instanceof Error) {
        console.error("Error during logout:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      } else {
        console.error("Unknown error:", error);
      }
      throw APIError.internal("Failed to logout");
    }
  }
);
