import { ActionFunction, LoaderFunction, json, redirect } from '@remix-run/node';
import { useLoaderData, Form, Link, useActionData, useSubmit, Outlet } from '@remix-run/react';
import { prisma } from '../utils/prisma.server';
import { useRef } from 'react';

export const loader: LoaderFunction = async ({ params }) => {
  const isEdit = params.appId || null;
  const applications = await prisma.application.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return json({ applications, isEdit });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get('_action');
  const appId = formData.get('appId') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const url = formData.get('url') as string;

  switch (actionType) {
    case 'delete': {
      await prisma.application.delete({ where: { id: appId } });
      break;
    }
    case 'update': {
      await prisma.application.update({
        where: { id: appId },
        data: { name, description, url },
      });
      break;
    }
    case 'create': {
      await prisma.application.create({
        data: { name, description, url, orgId: 'clzmdxj3e000012ebfjzj3sol' },
      });
      break;
    }
    case 'redirect-to-edit': {
      return redirect(`/manage-apps/${appId}`);
    }
  }

  return redirect('/manage-apps');
};

const ManageApps = () => {
  const { applications, isEdit } = useLoaderData();
  const addFormRef = useRef(null);
  const actionData = useActionData();
  const submit = useSubmit();

  const handleSubmit = (e) => {
    e.preventDefault();
    let formData = new FormData(e.currentTarget);
    let data = Object.fromEntries(formData);
    console.log(data);
    e.currentTarget.reset();
    submit({ ...data }, { method: 'POST', navigate: false });
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Manage Applications</h1>

      {/* Application Cards */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {applications.map((app: any) => (
          <div key={app.id} className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <h2 className="text-xl font-semibold mb-2">{app.name}</h2>
            <p className="text-gray-600 mb-2">{app.description}</p>
            <p className="text-blue-500 truncate">{app.url}</p>
            <div className="mt-4 flex space-x-2">
              <Form method="post">
                <input type="hidden" name="appId" value={app.id} />
                <button type="submit" name="_action" value="delete" className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600">
                  Delete
                </button>
              </Form>

              <Form method="post">
                <input type="hidden" name="appId" value={app.id} />
                <button type="submit" name="_action" value="redirect-to-edit" className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600">
                  Edit
                </button>
              </Form>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Application Form */}
      {!isEdit && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Add New Application</h2>
          <Form method="post" onSubmit={handleSubmit} className="space-y-4">
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
