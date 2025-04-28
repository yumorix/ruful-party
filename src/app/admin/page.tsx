import { redirect } from 'next/navigation';

export default function AdminPage() {
  // Redirect to the parties page
  redirect('/admin/parties');
}
