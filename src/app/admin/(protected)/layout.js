import { requireAuth } from '@/lib/auth';
import { AdminShell } from '@/components/admin/admin-shell';

export const dynamic = 'force-dynamic';

export default async function ProtectedAdminLayout({ children }) {
  // Middleware already guards these routes; this is defence in depth.
  const session = await requireAuth();
  return <AdminShell session={session}>{children}</AdminShell>;
}
