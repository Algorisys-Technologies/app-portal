import { ActionFunction, LoaderFunction, json, redirect } from '@remix-run/node';
import { useLoaderData, Form, Link } from '@remix-run/react';
import { prisma } from '../utils/prisma.server';

export const loader: LoaderFunction = async ({ params }) => {
  const appId = params.appId as string;
  const application = await prisma.application.findUnique({ where: { id: appId } });

  if (!application) {
    throw new Response('Application not found', { status: 404 });
  }

  return json(application);
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const url = formData.get('url') as string;
  const appId = params.appId as string;

  await prisma.application.update({
    where: { id: appId },
    data: { name, description, url },
  });

  return redirect('/manage-apps');
};

const EditApp = () => {
  const application = useLoaderData();

  return (
    <div>
      <h1>Edit Application</h1>
      <Form method="post">
        <input type="hidden" name="appId" value={application.id} />
        <input type="text" name="name" defaultValue={application.name} placeholder="Application Name" required />
        <input type="text" name="description" defaultValue={application.description} placeholder="Description" />
        <input type="text" name="url" defaultValue={application.url} placeholder="URL" required />
        <button type="submit">Save Changes</button>
        <Link to="/manage-apps">
          <button type="button">Cancel</button>
        </Link>
      </Form>
    </div>
  );
};

export default EditApp;
