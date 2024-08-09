import { ActionFunction, LoaderFunction, json, redirect } from '@remix-run/node';
import { useLoaderData, Form, Link } from '@remix-run/react';
import { prisma } from '../utils/prisma.server';

export const loader: LoaderFunction = async () => {
  const applications = await prisma.application.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return json({ applications });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get('_action');
  const appId = formData.get('appId') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const url = formData.get('url') as string;

  if (actionType === 'delete') {
    await prisma.application.delete({ where: { id: appId } });
  } else if (actionType === 'update') {
    await prisma.application.update({
      where: { id: appId },
      data: { name, description, url },
    });
  } else if (actionType === 'create') {
    await prisma.application.create({
      data: { name, description, url, orgId: 'clzmdxj3e000012ebfjzj3sol' },
    });
  }

  return redirect('/manage-apps');
};

const ManageApps = () => {
  const { applications } = useLoaderData();

  return (
    <div>
      <h1>Manage Applications</h1>

      {/* Application Cards */}
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {applications.map((app: any) => (
          <div key={app.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
            <h2>{app.name}</h2>
            <p>{app.description}</p>
            <p>{app.url}</p>
            <Form method="post">
              <input type="hidden" name="appId" value={app.id} />
              <button type="submit" name="_action" value="delete">Delete</button>
              <Link to={`/edit-app/${app.id}`}>
                <button type="button">Edit</button>
              </Link>
            </Form>
          </div>
        ))}
      </div>

      {/* Add New Application Form */}
      <div style={{ marginTop: '2rem' }}>
        <h2>Add New Application</h2>
        <Form method="post">
          <input type="text" name="name" placeholder="Application Name" required />
          <input type="text" name="description" placeholder="Description" />
          <input type="text" name="url" placeholder="URL" required />
          <button type="submit" name="_action" value="create">Add Application</button>
        </Form>
      </div>
    </div>
  );
};

export default ManageApps;
