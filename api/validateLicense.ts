import { api, APIError, Header } from "encore.dev/api";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prismaClient = new PrismaClient();
const JWT_SECRET = process.env.SESSION_SECRET || 'your-secret-key';

// License Validation API
export const validateLicense = api(
  {
    method: "GET",
    path: "/api/license/validate",
    expose: true,
    auth: true,  // Require authentication
  },
  async (request: { query: { app_id: string } }, context: { authorization: Header<"Authorization"> }) => {
    // Extract app_id from query parameters
    const { app_id } = request.query;

    // Ensure app_id is provided and is a valid number
    if (!app_id || isNaN(parseInt(app_id))) {
      throw APIError.invalidArgument("Invalid or missing app_id");
    }

    // Extract token from Authorization header
    const authHeader = context.authorization;
    if (!authHeader) {
      throw APIError.unauthenticated("Authorization header is missing");
    }

    // Strip the "Bearer" prefix and verify the JWT token
    const token = authHeader.replace(/^Bearer\s/, "");
    let orgId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { orgId: number };
      orgId = decoded.orgId;
    } catch (error) {
      throw APIError.unauthenticated("Invalid or expired token");
    }

    // Log the App ID and Org ID for debugging
    console.log("App ID:", app_id);
    console.log("Org ID:", orgId);

    try {
      // Query the database for a valid license
      const license = await prismaClient.license.findFirst({
        where: {
          org_id: orgId,
          app_id: parseInt(app_id),
          start_date: {
            lte: new Date(),
          },
          end_date: {
            gte: new Date(),
          },
        },
      });

      // Log the license for debugging
      console.log("License:", license);

      // If no valid license is found, return a 404 error
      if (!license) {
        return { valid: false, message: "License not found or expired" };
      }

      // Return a success response with the license data
      return { valid: true, license };
    } catch (error) {
      console.error("License validation error:", error);
      throw APIError.internal("License validation failed");
    }
  }
);
