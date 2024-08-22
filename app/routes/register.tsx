// app/routes/register.tsx

import { json, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const orgName = formData.get("org_name");
  const firstName = formData.get("first_name");
  const lastName = formData.get("last_name");
  const email = formData.get("email");
  const password = formData.get("password");
  const orgSize = formData.get("org_size");
  const usage = formData.get("usage");

  if (
    typeof orgName !== "string" ||
    typeof firstName !== "string" ||
    typeof lastName !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof orgSize !== "string" ||
    typeof usage !== "string"
  ) {
    return json({ message: "Invalid input." }, { status: 400 });
  }

  try {
    const response = await fetch("http://localhost:9123/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        org_name: orgName,
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        org_size: parseInt(orgSize),
        usage,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return json({ message: errorData.error }, { status: response.status });
    }

    return redirect("/login");
  } catch (error) {
    console.error("Registration error:", error);
    return json(
      { message: "Registration failed. Please try again later." },
      { status: 500 }
    );
  }
};

export default function Register() {
  const actionData = useActionData();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold text-center">Register</h1>
        {actionData?.message && (
          <p className="text-red-500 text-center">{actionData.message}</p>
        )}
        <form method="post" className="space-y-4">
          <input
            type="text"
            name="org_name"
            placeholder="Organization Name"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
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
            type="number"
            name="org_size"
            placeholder="Organization Size"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="text"
            name="usage"
            placeholder="Usage"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-indigo-500 rounded hover:bg-indigo-600"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
