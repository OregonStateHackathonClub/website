// admin only
// see the tracks, create new tracks, add rubrics to tracks (each track can have one rubric)

type Categories = {
	id: string;
	name: string;
	description: string;
	score: number;
}
type Rubric = {
	id: string;
	name: string;
	description: string;
	categories: Categories[];
}

export default function Page() {
	return "";
}
