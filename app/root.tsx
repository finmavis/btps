import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from 'react-router';

import { isDev } from '~/config/env';
import { AccountProvider } from '~/state/account-context';

import type { Route } from './+types/root';
import { AppTopBar } from './components/layout/app-top-bar';
import './app.css';

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
];

export async function loader() {
  const { getActiveUserId, getUsers } =
    await import('~/server/users-store.server');
  const users = getUsers();
  const activeUserId = getActiveUserId();
  return { users, activeUserId };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  const { users, activeUserId } = useLoaderData<typeof loader>();

  return (
    <AccountProvider users={users} activeUserId={activeUserId ?? undefined}>
      <AppTopBar />
      <Outlet />
    </AccountProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <ErrorBoundaryInner error={error} />;
}

function ErrorBoundaryInner({ error }: { error: unknown }) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details;
  } else if (isDev && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className='error-boundary'>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
