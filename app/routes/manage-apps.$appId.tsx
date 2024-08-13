import {
  ActionFunction,
  LoaderFunction,
  json,
  redirect,
} from "@remix-run/node";
import { Form, Navigate, useActionData, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import React, { useEffect, useState } from "react";
import { prisma } from "~/utils/prisma.server";

// Loader function to fetch application data by ID
export const loader: LoaderFunction = async ({ params }) => {
  const { appId } = params;

  if (!appId) {
    return json({ application: null });
  }

  const application = await prisma.application.findUnique({
    where: { id: appId },
  });

  return json({ application });
};

// Action function to handle POST requests for updating the application
export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const actionType = formData.get("_action");
  const appId = params.appId;

  if (!appId) {
    throw new Error("App ID is required");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const url = formData.get("url") as string;
  let imageUrl = formData.get("imageUrl") as string;

  // Handle the image URL update in the database if it's provided
  if (actionType === "update") {
    const updatedData = { name, description, url };
    if (imageUrl) {
      updatedData["imageUrl"] = imageUrl;
    }
    await prisma.application.update({
      where: { id: appId },
      data: updatedData,
    });
  }

  return { id: appId };
};

const EditApp = () => {
  const [image, setImage] = useState<File | null>(null);
  const actionData = useActionData();
  const { application } = useLoaderData();
  const submit = useSubmit();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (image) {
      formData.append("imageUrl", image.name);
    }
    submit(formData, { method: "POST" });
  };

  useEffect(() => {
    if (actionData?.id && image) {
      const formData = new FormData();
      formData.append("file", image);
      submit(formData, {
        method: "POST",
        encType: "multipart/form-data",
        action: `/uploadfile?appId=${actionData.id}`,
      });
    }
  }, [actionData]);

  return (
    <div className="mt-8 max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Edit Application</h2>
      <Form method="post" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Application Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Application Name"
            required
            defaultValue={application?.name || ""}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <input
            type="text"
            name="description"
            id="description"
            placeholder="Description"
            defaultValue={application?.description || ""}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="url"
            className="block text-sm font-medium text-gray-700"
          >
            URL
          </label>
          <input
            type="text"
            name="url"
            id="url"
            placeholder="URL"
            required
            defaultValue={application?.url || ""}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
        />
        <input type="hidden" name="_action" value="update" />
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Edit Application
        </button>
      </Form>
    </div>
  );
};

export default EditApp;

