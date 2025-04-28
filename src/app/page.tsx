import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the admin page
  redirect('/admin');
}
