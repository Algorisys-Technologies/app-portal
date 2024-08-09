import { useLoaderData, Form, Link } from '@remix-run/react';
import { json } from '@remix-run/node';
import { prisma } from '../utils/prisma.server';

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const searchTerm = url.searchParams.get('search') || '';

  const applications = await prisma.application.findMany({
    where: {
      name: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return json({ applications, searchTerm });
};

// Action function removed as CRUD operations are no longer needed

const Home = () => {
  const { applications, searchTerm } = useLoaderData();

  return (
    <div>
      <h1>Applications</h1>

      {/* Search Bar */}
      <Form method="get">
        <input
          type="text"
          name="search"
          placeholder="Search applications..."
          defaultValue={searchTerm}
        />
        <button type="submit">Search</button>
      </Form>

      {/* Application Cards */}
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {applications.map((app: any) => (
          <div key={app.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
            <h2>{app.name}</h2>
            <p>{app.description}</p>
            <p>{app.url}</p>
          </div>
        ))}
      </div>

      {/* Manage Applications Button */}
      <div style={{ marginTop: '2rem' }}>
        <Link to="/manage-apps">
          <button type="button">Manage Applications</button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
