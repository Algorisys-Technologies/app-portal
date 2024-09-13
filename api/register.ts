import { api, APIError } from "encore.dev/api";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient();

interface RegisterRequest {
  org_name: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  org_size: number;
  usage: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
}

// Function to validate registration request
const validateRegisterRequest = (request: RegisterRequest) => {
  const { org_name, first_name, last_name, email, password, org_size, usage } = request;

  if (!org_name || !first_name || !last_name || !email || !password || org_size === undefined || !usage) {
    throw APIError.invalidArgument("Missing required fields.");
  }

  // Additional validation can be added here (e.g., email format, password strength)
};

// Register API endpoint
export const register = api<RegisterRequest, RegisterResponse>(
  {
    method: "POST",
    path: "/api/register",
    expose: true,
  },
  async (request): Promise<RegisterResponse> => {
    try {
      // Validate request
      validateRegisterRequest(request);

      const { org_name, first_name, last_name, email, password, org_size, usage } = request;

      // Hash the password before saving it
      const hashedPassword = await bcrypt.hash(password, 10);

      // Use Prisma to insert the new user and organization record
      await prismaClient.organization.create({
        data: {
          org_name,
          first_name,
          last_name,
          email,
          admin: true,
          org_size,
          usage,
          users: {
            create: {
              name: email,
              password: hashedPassword,
              role_id: 1,
              isActive: true,
            },
          },
        },
      });

      return { success: true, message: "Registration successful!" };
    } catch (error: unknown) {
      if (error instanceof APIError) {
        console.error("API error during registration:", error.message);
        return { success: false, message: error.message };
      } else if (error instanceof Error) {
        console.error("Error during registration:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
        return { success: false, message: "An error occurred during registration." };
      } else {
        console.error("Unknown error:", error);
        return { success: false, message: "An unknown error occurred during registration." };
      }
    }
  }
);
