import { ActionFunction } from '@remix-run/node';
import { prisma } from '~/utils/prisma.server';
import React from 'react';
import { Link, useNavigate } from '@remix-run/react';

export const action: ActionFunction = async ({ request }) => {
  const formData = new URLSearchParams(await request.text());
  const name = formData.get('name');
  const description = formData.get('description');
  const url = formData.get('url');
  const orgId = formData.get('orgId'); 

  await prisma.application.create({
    data: {
      name: name as string,
      description: description as string,
      url: url as string,
      orgId: orgId as string,
    },
  });

  return { success: true };
};

const AddApp = () => {
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    await fetch(form.action, {
      method: 'POST',
      body: new URLSearchParams(formData as any),
    });

    navigate('/manage-apps');
  };

  return (
    <div>
      <h1>Add New App</h1>
      <form method="post" onSubmit={handleSubmit}>
        <div>
          <label>
            App Name:
            <input type="text" name="name" required />
          </label>
        </div>
        <div>
          <label>
            Description:
            <input type="text" name="description" />
          </label>
        </div>
        <div>
          <label>
            URL:
            <input type="text" name="url" />
          </label>
        </div>
        <div>
          <label>
            Organization ID:
            <input type="text" name="orgId" required />
          </label>
        </div>
        <button type="submit">Add App</button>
      </form>
      <Link to="/manage-apps">Back to Manage Apps</Link>
    </div>
  );
};

export default AddApp;
