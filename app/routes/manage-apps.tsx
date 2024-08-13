import {
  ActionFunction,
  LoaderFunction,
  json,
  redirect,
  unstable_parseMultipartFormData,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
} from "@remix-run/node";
import {
  useLoaderData,
  Form,
  Link,
  useActionData,
  useSubmit,
  Outlet,
} from "@remix-run/react";
import { prisma } from "../utils/prisma.server";
import { useEffect, useRef, useState } from "react";
import path from "path";
import fs from "fs";

const getImageUploadPath = (appId: string) =>
  path.join(process.cwd(), "public", "uploads", appId);

export const loader: LoaderFunction = async ({ params }) => {
  const isEdit = params.appId || null;
  const applications = await prisma.application.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return json({ applications, isEdit });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get("_action") as string;
  const appId = formData.get("appId") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const url = formData.get("url") as string;
  let imageUrl = formData.get("imageUrl") as string;

  try {
    if (actionType === "create" || actionType === "update") {
      if (actionType === "create") {
        const app = await prisma.application.create({
          data: {
            name,
            description,
            url,
            orgId: "clzqlqf640000ur8hwnjcixn5",
            imageUrl,
          },
        });
        return { id: app.id, added: true };
      } else if (actionType === "update") {
        await prisma.application.update({
          where: { id: appId },
          data: { name, description, url, imageUrl },
        });
        return { id: appId, updated: true };
      }
    } else if (actionType === "delete") {
      await prisma.application.delete({ where: { id: appId } });

      // Delete the image from the file system
      const uploadPath = getImageUploadPath(appId);
      if (fs.existsSync(uploadPath)) {
        const files = fs.readdirSync(uploadPath);
        files.forEach((file) => {
          fs.unlinkSync(path.join(uploadPath, file));
        });
        fs.rmdirSync(uploadPath);
      }
    } else if (actionType === "redirect-to-edit") {
      return redirect(`/manage-apps/${appId}`);
    }

    return redirect("/manage-apps");
  } catch (error) {
    console.error("Error in action function:", error);
    return json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
};

const ManageApps = () => {
  const [image, setImage] = useState(null);
  const { applications, isEdit } = useLoaderData();
  const addFormRef = useRef(null);
  const actionData = useActionData();
  const submit = useSubmit();

  const handleImageChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    setImage(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    e.currentTarget.reset();
    formData.append("imageUrl", image ? image.name : "");
    submit(formData, { method: "POST" });
  };

  useEffect(() => {
    if (actionData?.id) {
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        submit(formData, {
          method: "POST",
          encType: "multipart/form-data",
          action: `/uploadfile?appId=${actionData.id}`,
        });
      }
    }
  }, [actionData, image, submit]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Manage Applications</h1>

      {/* Application Cards */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {applications.map((app) => {
          const imageUrl = app.imageUrl
            ? `/uploads/${app.id}/${app.imageUrl}`
            : `/default-image.jpg`;
          return (
            <div
              key={app.id}
              className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <img
                src={imageUrl}
                alt={app.name}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <h2 className="text-xl font-semibold mb-2">{app.name}</h2>
              <p className="text-gray-600 mb-2">{app.description}</p>
              <p className="text-blue-500 truncate">{app.url}</p>
              <div className="mt-4 flex space-x-2">
                <Form method="post">
                  <input type="hidden" name="appId" value={app.id} />
                  <button
                    type="submit"
                    name="_action"
                    value="delete"
                    className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                </Form>

                <Form method="post">
                  <input type="hidden" name="appId" value={app.id} />
                  <button
                    type="submit"
                    name="_action"
                    value="redirect-to-edit"
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                </Form>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Application Form */}
      {!isEdit && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Add New Application</h2>
          <Form
            method="post"
            encType="multipart/form-data"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <input
              type="text"
              name="name"
              placeholder="Application Name"
              required
              className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              name="description"
              placeholder="Description"
              className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              name="url"
              placeholder="URL"
              required
              className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
            />
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
            />
            <input type="hidden" name="_action" value="create" />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
            >
              Add Application
            </button>
          </Form>
        </div>
      )}

      <Outlet />
    </div>
  );
};

export default ManageApps;
