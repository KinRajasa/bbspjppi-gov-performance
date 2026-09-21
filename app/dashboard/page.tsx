import { redirect } from 'next/navigation';

/** Stable alias requested by the RBAC map; the existing dashboard lives at `/`. */
export default function DashboardAliasPage() {
  redirect('/');
}
