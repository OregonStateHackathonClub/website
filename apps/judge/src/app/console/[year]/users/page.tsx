// admin only
// manage users
// add users to teams
import UsersPage from "./components/UsersPage";

export default async function Page({
	params,
}: {
	params: Promise<{ year: string;}>;
}) {
	const { year } = await params;

	return <UsersPage hackathonId={year == "~" ? "" : year} />
}
