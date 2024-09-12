import { api, APIError, Header } from "encore.dev/api";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

// JWT secret
const JWT_SECRET = process.env.SESSION_SECRET;

const prismaClient = new PrismaClient();

interface LoginRequest {
  email: string;
  password: string;
  org_id: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  message?: string;
}

// Function to generate access token
function generateAccessToken(user: {
  id: number;
  org_id: number;
  role_id: number;
}) {
  return jwt.sign(
    { userId: user.id, orgId: user.org_id, roleId: user.role_id },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

// Function to generate refresh token
function generateRefreshToken(user: {
  id: number;
  org_id: number;
  role_id: number;
}) {
  return jwt.sign(
    { userId: user.id, orgId: user.org_id, roleId: user.role_id },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Middleware for request validation
const validateLoginRequest = (request: { body: LoginRequest }) => {
  const { email, password, org_id } = request.body;

  if (!email || !password || !org_id) {
    throw APIError.invalidArgument(
      "Missing required fields: email, password, or org_id."
    );
  }
};

// Login API endpoint
export const login = api(
  {
    method: "POST",
    path: "/api/login",
    expose: true,
  },
  async (request: { body: LoginRequest }): Promise<LoginResponse> => {
    try {
      // Validate request
      validateLoginRequest(request);

      const { email, password, org_id } = request.body;

      // Fetch user from the database
      const user = await prismaClient.user.findFirst({
        where: {
          name: email,
          org_id: parseInt(org_id),
        },
      });

      if (!user) {
        throw APIError.notFound(
          "User not found with the given email and organization ID."
        );
      }

      // Validate the password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw APIError.unauthenticated("Invalid email or password.");
      }

      // Generate tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      return {
        success: true,
        token: accessToken,
        refreshToken: refreshToken,
        message: "Login successful.",
      };
    } catch (error: unknown) {
      if (error instanceof APIError) {
        console.error("API error during login:", error.message);
        return { success: false, message: error.message };
      } else if (error instanceof Error) {
        console.error("Error during login:", error.message);
        return { success: false, message: "An error occurred during login." };
      } else {
        console.error("Unknown error:", error);
        return {
          success: false,
          message: "An unknown error occurred during login.",
        };
      }
    }
  }
);
