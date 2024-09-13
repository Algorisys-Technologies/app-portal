import { api, Header } from "encore.dev/api";
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
const validateLoginRequest = (request: LoginRequest) => {
  const { email, password, org_id } = request;

  if (!email || !password || !org_id) {
    throw new Error("Missing required fields: email, password, or org_id.");
  }
};

// Login API endpoint
export const login = api<LoginRequest, LoginResponse>(
  {
    method: "POST",
    path: "/api/login",
    expose: true,
  },
  async (request): Promise<LoginResponse> => {
    try {
      // Validate request
      validateLoginRequest(request);

      const { email, password, org_id } = request;

      // Fetch user from the database
      const user = await prismaClient.user.findFirst({
        where: {
          name: email,
          org_id: parseInt(org_id),
        },
      });

      if (!user) {
        throw new Error("User not found with the given email and organization ID.");
      }

      // Validate the password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new Error("Invalid email or password.");
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
    } catch (error) {
      console.error("Login error:", error.message);
      return {
        success: false,
        message: error.message || "An unknown error occurred during login.",
      };
    }
  }
);
