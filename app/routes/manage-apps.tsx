import { ActionFunction, LoaderFunction, json, redirect } from '@remix-run/node';
import { useLoaderData, Form, Link, useActionData, useSubmit, Outlet } from '@remix-run/react';
import { prisma } from '../utils/prisma.server';
import { useRef } from 'react';

export const loader: LoaderFunction = async ({ params }) => {

  const isEdit = params.appId || null
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
    }
    case 'update': {
      await prisma.application.update({
        where: { id: appId },
        data: { name, description, url },
      });
    }

    case 'create': {
      await prisma.application.create({
        data: { name, description, url, orgId: 'clzmdxj3e000012ebfjzj3sol' },
      });
    }
    case 'redirect-to-edit': {
      return redirect(`/manage-apps/${appId}`)
    }

  }



  return redirect('/manage-apps');
};

const ManageApps = () => {
  const { applications, isEdit } = useLoaderData();
  const addFormRef = useRef(null)
  const actionData = useActionData()
  const submit = useSubmit()

  const handleSubmit = (e) => {
    e.preventDefault()
    let formData = new FormData(e.currentTarget);

    let data = Object.fromEntries(formData);
    console.log(data)
    e.currentTarget.reset();
    submit({ ...data }, { method: "POST", navigate: false })


  }

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

            </Form>

            <Form method="post">
              <input type="hidden" name="appId" value={app.id} />
              <button type="submit" name="_action" value="redirect-to-edit">Edit</button>
             

            </Form>


          </div>
        ))}
      </div>

      {/* Add New Application Form */}

      {!isEdit && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Add New Application</h2>
          <Form method="post" onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Application Name" required />
            <input type="text" name="description" placeholder="Description" />
            <input type="text" name="url" placeholder="URL" required />
            <input type="hidden" name="_action" value="create" />
            <button type="submit">Add Application</button>
          </Form>
        </div>)}

      <Outlet />
    </div>
  );
};

export default ManageApps;
