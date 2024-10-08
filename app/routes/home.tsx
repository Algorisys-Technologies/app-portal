// app/routes/home.tsx

import { useLoaderData, Form, Link } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { prisma } from "../utils/prisma.server";
import { getSession } from "~/utils/session.server";

export const loader = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);

  // If not logged in, redirect to login
  if (!session.has("token")) {
    return redirect("/login");
  }

  const url = new URL(request.url);
  const searchTerm = url.searchParams.get("search") || "";

  const applications = await prisma.application.findMany({
    where: {
      name: {
        contains: searchTerm,
        mode: "insensitive",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return json({ applications, searchTerm });
};

const Home = () => {
  const { applications, searchTerm } = useLoaderData();

  return (
    <div className="p-8">
      {/* Logout Button */}
      <Form action="/logout" method="post">
        <button
          type="submit"
          className="px-6 py-3 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
        >
          Logout
        </button>
      </Form>
      <h1 className="text-3xl font-bold mb-6">Applications</h1>

      {/* Search Bar */}
      <Form method="get" className="mb-6 flex items-center">
        <input
          type="text"
          name="search"
          placeholder="Search applications..."
          defaultValue={searchTerm}
          className="flex-grow p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
        >
          Search
        </button>
      </Form>

      {/* Application Cards */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {applications.map((app) => (
          <div
            key={app.id}
            className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <img
              src={
                app.imageUrl
                  ? `/uploads/${app.id}/${app.imageUrl}`
                  : "/default-image.jpg"
              }
              alt={app.name}
              className="w-full h-40 object-cover rounded-lg mb-4"
            />
            <h2 className="text-xl font-semibold mb-2">{app.name}</h2>
            <p className="text-gray-600 mb-2">{app.description}</p>
            <p className="text-blue-500 truncate">{app.url}</p>
          </div>
        ))}
      </div>

      {/* Manage Applications Button */}
      <div className="mt-8 flex justify-between">
        <Link to="/manage-apps">
          <button
            type="button"
            className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
          >
            Manage Applications
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
