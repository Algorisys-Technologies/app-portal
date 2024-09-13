import { api, APIError, Header } from "encore.dev/api";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prismaClient = new PrismaClient();

// JWT secret
const JWT_SECRET = process.env.SESSION_SECRET || 'your-secret-key';

interface LogoutRequest {
  headers: any;
}

interface LogoutResponse {
  success: boolean;
  message: string;
}

export const logout = api<LogoutRequest, LogoutResponse>(
  {
    method: "POST",
    path: "/api/logout",
    expose: true,
    auth: true, // Ensure the endpoint requires authentication
  },
  async (request): Promise<LogoutResponse> => {
    // Log the request body to debug the issue
    console.log("Request body:", request.body);

    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      console.error("No authorization header provided");
      throw APIError.unauthenticated("No authorization header provided");
    }

    const token = authHeader.replace(/^Bearer\s/, "");

    try {
      // Verify the token and extract user ID
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

      const userId = decoded.userId;

      // Update the user's record to clear tokens (if any)
      await prismaClient.user.update({
        where: { id: userId },
        data: {
          refreshToken: null,
          refreshTokenExpiry: null,
        },
      });

      return { success: true, message: 'Logged out successfully' };
    } catch (error: unknown) {
      if (error instanceof jwt.JsonWebTokenError) {
        console.error("Invalid or expired token");
        throw APIError.unauthenticated("Invalid or expired token");
      } else if (error instanceof Error) {
        console.error("Error during logout:", error);
      }
      throw APIError.internal("Failed to logout");
    }
  }
);

