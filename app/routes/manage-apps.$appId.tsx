import { ActionFunction, LoaderFunction, json, redirect } from '@remix-run/node';
import { Form, useLoaderData, useSubmit } from '@remix-run/react';
import React from 'react';
import { prisma } from '~/utils/prisma.server';

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
  const actionType = formData.get('_action');
  const appId = params.appId;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const url = formData.get('url') as string;

  if (actionType === 'update' && appId) {
    await prisma.application.update({
      where: { id: appId },
      data: { name, description, url },
    });
  }

  return redirect('/manage-apps');
};

const EditApp = () => {
  const { application } = useLoaderData();
  const submit = useSubmit();

  const handleSubmit = (e) => {
    e.preventDefault();
    let formData = new FormData(e.currentTarget);
    submit({ ...Object.fromEntries(formData) }, { method: 'POST', navigate: false });
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Edit Application</h2>
      <Form method="post" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Application Name"
          required
          defaultValue={application?.name || ''}
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          defaultValue={application?.description || ''}
        />
        <input
          type="text"
          name="url"
          placeholder="URL"
          required
          defaultValue={application?.url || ''}
        />
        <input type="hidden" name="_action" value="update" />
        <button type="submit">Edit Application</button>
      </Form>
    </div>
  );
};

export default EditApp;
