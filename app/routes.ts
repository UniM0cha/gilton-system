import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [index('./routes/profile.tsx'), route('worship', './routes/worship.tsx')] satisfies RouteConfig;
