import { getUsers } from "@/app/actions/users";
import { UsersTable } from "./components/table";

export default async function UsersPage() {
  const { users, total } = await getUsers({ limit: 50 });

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">Users</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage users and admin access. {total} total users.
        </p>
      </div>

      <UsersTable initialUsers={users} />
    </div>
  );
}
