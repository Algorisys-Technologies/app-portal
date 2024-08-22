// app/routes/login.tsx

import { json, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { createSession, getSession } from "~/utils/session.server";

export const loader = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);
  if (session.has("token")) {
    return redirect("/home");
  }
  return json({});
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const org_id = formData.get("org_id");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof org_id !== "string"
  ) {
    return json({ message: "Invalid input." }, { status: 400 });
  }

  try {
    const response = await fetch("http://localhost:9123/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, org_id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return json({ message: errorData.error }, { status: response.status });
    }

    const { accessToken } = await response.json();
    const cookieHeader = await createSession(accessToken);

    return redirect("/home", {
      headers: {
        "Set-Cookie": cookieHeader,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return json(
      { message: "Login failed. Please try again later." },
      { status: 500 }
    );
  }
};

export default function Login() {
  const actionData = useActionData();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold text-center">Admin Login</h1>
        {actionData?.message && (
          <p className="text-red-500 text-center">{actionData.message}</p>
        )}
        <form method="post" className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="text"
            name="org_id"
            placeholder="Organization ID"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-indigo-500 rounded hover:bg-indigo-600"
          >
            Login
          </button>
          <p className="text-center">
            Don't have an account?{" "}
            <a href="/register" className="text-indigo-500 hover:underline">
              Register
            </a>
          </p>
          <p className="text-center">
            {" "}
            <a href="" className="text-indigo-500 hover:underline">
              Forgot Password?
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
