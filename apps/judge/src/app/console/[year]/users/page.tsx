// admin only
// manage users
// add users to teams

import GlobalUsersPage from "./GlobalUsersPage";
import HackathonUsersPage from "./HackathonUsersPage";

export default async function Page({
	params,
}: {
	params: Promise<{ year: string;}>;
}) {
	const { year } = await params;
	if (year === "~") {
		return <GlobalUsersPage />
	}
	else {
		return <HackathonUsersPage hackathonId={year} />
	}
}