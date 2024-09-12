import { api, APIError } from "encore.dev/api";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prismaClient = new PrismaClient();
const JWT_SECRET = process.env.SESSION_SECRET || "default_secret";

function generateAccessToken(user: { userId: number; email: string }) {
  return jwt.sign({ userId: user.userId, email: user.email }, JWT_SECRET, {
    expiresIn: "15m",
  });
}

function generateRefreshToken(user: { userId: number; email: string }) {
  return jwt.sign({ userId: user.userId, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export const refreshToken = api(
  {
    method: "POST",
    path: "/api/token/refresh",
    expose: true,
  },
  async (params: { body: RefreshTokenRequest }): Promise<RefreshTokenResponse> => {
    const { refreshToken } = params.body;

    if (!refreshToken) {
      throw APIError.unauthenticated("Refresh token required");
    }

    // Log the incoming refresh token
    console.log("Incoming refreshToken:", refreshToken);

    try {
      const user = await prismaClient.user.findFirst({
        where: {
          refreshToken: refreshToken,
          refreshTokenExpiry: {
            gte: new Date(), // Ensure the token hasn't expired
          },
        },
      });

      // Log user data
      console.log("User found:", user);

      if (!user) {
        console.log("No user found or token expired");
        throw APIError.unauthenticated("Invalid or expired refresh token");
      }

      let decodedUser;
      try {
        decodedUser = jwt.verify(refreshToken, JWT_SECRET) as { userId: number; email: string };
        console.log("Decoded user from refresh token:", decodedUser);
      } catch (err) {
        console.error("JWT verification failed:", err);
        throw APIError.unauthenticated("Invalid refresh token");
      }

      const newAccessToken = generateAccessToken(decodedUser);
      const newRefreshToken = generateRefreshToken(decodedUser);

      // Update user's refresh token in the database
      await prismaClient.user.update({
        where: { id: user.id },
        data: {
          refreshToken: newRefreshToken,
          refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      console.log("New tokens generated");
      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error: unknown) {
      console.error("Error during token refresh:", error);
      throw APIError.internal("Failed to refresh token");
    }
  }
);
