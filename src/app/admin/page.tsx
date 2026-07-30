import { AdminPanel } from "./admin-panel";
import { getAdminSession } from "../actions/admin";

export default async function AdminPage() {
  const authed = await getAdminSession();

  return <AdminPanel initialAuthed={authed} />;
}
