import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('api/set-active-user', 'routes/api.set-active-user.tsx'),
  route('api/batch-transfer', 'routes/api.batch-transfer.tsx'),
  route('api/approve-batch', 'routes/api.approve-batch.tsx'),
  route('api/reject-batch', 'routes/api.reject-batch.tsx'),
] satisfies RouteConfig;
