// admin only
// see the tracks, create new tracks, add rubrics to tracks (each track can have one rubric)
import { Table, TableBody, TableCaption,TableCell, TableHead, TableHeader, TableRow, } from "@repo/ui/components/table"
import { Navbar } from "@/components/navbar";
import { Button } from "@repo/ui/components/button"
import { Label } from "@repo/ui/components/label"
import { Input } from "@repo/ui/components/input"

import { Dialog, 
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger, } from "@repo/ui/components/dialog";
import { prisma } from "@repo/database";

interface Track {
	id: string;
	name: string;
	description: string;
	prize: string | null;
}

export default async function Page(props: {
	params: Promise<{ year: string }>;
}) {
	const params = await props.params;
	const yearParam = params.year;

	const tracks = await prisma.track.findMany({
		where: { hackathonId: yearParam },
		select: {
			id: true,
			name: true,
			description: true,
			prize: true,
		}
	});
	return (
		<div className="flex min-h-screen w-full flex-col bg-white">
			<Navbar />
			<div className="flex-1 p-10 text-black">
				<h1 className="mb-6 text-center font-bold text-4xl text-black-900">
					Tracks
				</h1>
				<Table>
					<TableCaption>Create or view current tracks, and add rubrics to tracks.</TableCaption>
					<TableHeader>
						<TableRow>
						<TableHead className="w-[200px]">Name</TableHead>
						<TableHead>Description</TableHead>
						<TableHead className="w-[150px]">Prize</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{tracks.map((track) => (
							<TableRow key={track.id}>
								<TableCell className="font-medium">{track.name}</TableCell>
								<TableCell>{track.description}</TableCell>
								<TableCell>{track.prize || 'N/A'}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				<Dialog>
					<form>
						<DialogTrigger asChild>
						<Button variant="outline">Create a track</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Create a track</DialogTitle>
							<DialogDescription>
							Design your own track. Save when done.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4">
							<div className="grid gap-3">
							<Label htmlFor="name-1">Name</Label>
							<Input id="name-1" name="name"/>
							</div>
							<div className="grid gap-3">
							<Label htmlFor="description-1">Description</Label>
							<Input id="description-1" name="description"/>
							</div>
							<div className="grid gap-3">
							<Label htmlFor="prize-1">Prize</Label>
							<Input id="prize-1" name="prize"/>
							</div>
						</div>
						<DialogFooter>
							<DialogClose asChild>
							<Button variant="outline">Cancel</Button>
							</DialogClose>
							<Button type="submit">Save changes</Button>
						</DialogFooter>
						</DialogContent>
					</form>
					</Dialog>
			</div>
		</div>
	);
}
