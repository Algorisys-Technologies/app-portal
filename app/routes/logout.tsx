import { redirect } from "@remix-run/node";
import { getSession, destroySession } from "~/utils/session.server";

export const action = async ({ request }: { request: Request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const accessToken = session.get("token");

  if (!accessToken) {
    return redirect("/login");
  }

  try {
    // Send a POST request to the one-auth API to log out
    await fetch("http://localhost:9123/api/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    // Destroy the session and redirect to login
    const cookieHeader = await destroySession(request.headers.get("Cookie"));
    return redirect("/login", {
      headers: {
        "Set-Cookie": cookieHeader,
      },
    });
  } catch (error) {
    console.error("Logout error:", error);
    return redirect("/login");
  }
};
