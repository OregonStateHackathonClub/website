"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@repo/auth/client";
import type { Prisma } from "@repo/database";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Textarea } from "@repo/ui/components/textarea";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  getInviteCode,
  getTeamInfo,
  isTeamMember,
  removeUserFromTeam,
  resetInviteCode,
  updateTeam,
} from "@/app/actions/participant";

const formSchema = z.object({
  name: z.string().min(4),
  lookingForTeammates: z.boolean().optional(),
  contact: z.string().optional(),
  description: z.string().optional(),
});

type TeamInfo = Prisma.TeamGetPayload<{
  select: {
    id: true;
    name: true;
    description: true;
    contact: true;
    lookingForTeammates: true;
    creatorId: true;
    members: {
      select: {
        id: true;
        participant: {
          select: {
            user: {
              select: {
                id: true;
                name: true;
                image: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export function TeamDetails({
  teamId,
  hackathonId,
  teamMember,
}: {
  teamId: string;
  hackathonId: string;
  teamMember: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [team, setTeam] = useState<TeamInfo | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { data: session } = authClient.useSession();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const updatedTeam = await getTeamInfo(teamId);
        if (!updatedTeam) {
          toast.error("Failed to find team");
          return false;
        }
        setTeam(updatedTeam);
        form.reset({
          name: updatedTeam.name,
          contact: updatedTeam.contact ?? "",
          description: updatedTeam.description ?? "",
          lookingForTeammates: updatedTeam.lookingForTeammates,
        });
      } catch (error) {
        console.log(`Error fetching team: ${error}`);
      } finally {
        setLoading(false);
      }
    };
    const fetchInvite = async () => {
      const result = await getInviteCode(teamId);
      if (result.success) setInviteCode(result.code);
    };
    fetchTeam();
    fetchInvite();
  }, [teamId, form]);

  const getLink = useCallback(
    () =>
      inviteCode === ""
        ? "Generating..."
        : `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/${hackathonId}/invite/${inviteCode}`,
    [hackathonId, inviteCode],
  );

  const copyLink = async () => {
    await navigator.clipboard.writeText(getLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const res = await updateTeam(teamId, values);
    if (res.success) {
      const updatedTeam = await getTeamInfo(teamId);
      setTeam(updatedTeam);
      setEditing(false);
    }
  };

  const removeUser = async (teamMemberId: string) => {
    const result = await removeUserFromTeam(teamMemberId, teamId);
    if (result.success) {
      setTeam((prevTeam) => {
        if (!prevTeam) return prevTeam;
        return {
          ...prevTeam,
          members: prevTeam.members.filter((u) => u.id !== teamMemberId),
        };
      });

      if (!(await getTeamInfo(teamId))) {
        router.push("/");
      }

      if (!(await isTeamMember(teamId))) {
        window.location.reload();
      }
    }
  };

  if (!team) {
    if (loading) {
      return (
        <Card className="rounded-none border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
          <CardHeader>
            <Skeleton className="h-7 w-48 rounded-none bg-neutral-800" />
            <Skeleton className="mt-2 h-4 w-32 rounded-none bg-neutral-800" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full rounded-none bg-neutral-800" />
            <Skeleton className="h-4 w-2/3 rounded-none bg-neutral-800" />
            <div className="space-y-3 pt-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 border border-neutral-800 bg-neutral-900 px-3 py-2"
                >
                  <Skeleton className="h-10 w-10 rounded-none bg-neutral-800" />
                  <Skeleton className="h-4 w-24 rounded-none bg-neutral-800" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }
    return (
      <div className="py-10 text-center text-neutral-500">Team Not Found.</div>
    );
  }

  if (editing) {
    return (
      <Card className="rounded-none border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values) => {
                setLoading(true);
                try {
                  await onSubmit(values);
                } finally {
                  setLoading(false);
                }
              })}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-400">
                      Team Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Team Name"
                        className="rounded-none border-neutral-800 bg-transparent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lookingForTeammates"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <FormLabel className="text-neutral-400">
                      Looking for teammates
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-400">Contact</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Email"
                        className="rounded-none border-neutral-800 bg-transparent"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-400">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Brief description..."
                        className="rounded-none border-neutral-800 bg-transparent"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="bg-white text-black hover:bg-neutral-200 rounded-none"
                  disabled={loading}
                >
                  <span className="inline-flex min-w-[90px] items-center justify-center">
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Update Team"
                    )}
                  </span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(false)}
                  className="rounded-none border-neutral-800 hover:bg-neutral-900"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-none border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl text-white">{team.name}</CardTitle>
            {team.lookingForTeammates && (
              <p className="mt-1 text-sm text-neutral-400">
                Looking for teammates
              </p>
            )}
          </div>
          {teamMember && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
              className="hover:cursor-pointer rounded-none border-neutral-800 hover:bg-neutral-900 text-xs"
            >
              Edit
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Description */}
        {team.description && (
          <div>
            <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
              Description
            </h3>
            <p className="text-sm text-neutral-300">{team.description}</p>
          </div>
        )}

        {/* Contact */}
        {team.contact && (
          <div>
            <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
              Contact
            </h3>
            <p className="text-sm text-neutral-300">{team.contact}</p>
          </div>
        )}

        {/* Members */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-neutral-500">
            Members ({team.members.length}/4)
          </h3>
          <ul className="space-y-3">
            {team.members.map((u) => (
              <li
                key={u.id}
                className="flex items-center gap-3 border border-neutral-800 bg-neutral-900 px-3 py-2"
              >
                <Image
                  src={u.participant?.user.image || "/beaverhacks_white.png"}
                  alt={u.participant?.user.name || "Team member"}
                  width={40}
                  height={40}
                  className="h-10 w-10 object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm text-white">
                    {u.participant?.user.name || "Unknown"}
                  </p>
                </div>
                {u.id === team.creatorId && (
                  <Image
                    src="/crown.png"
                    alt="Team leader"
                    width={20}
                    height={20}
                  />
                )}
                {session?.user.id === u.participant?.user.id &&
                  u.id !== team.creatorId && (
                    <button
                      type="button"
                      onClick={() => removeUser(u.id)}
                      className="text-neutral-500 hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                {session?.user.id === team.creatorId &&
                  session?.user.id !== u.participant?.user.id && (
                    <button
                      type="button"
                      onClick={() => removeUser(u.id)}
                      className="text-neutral-500 hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
              </li>
            ))}
          </ul>
        </div>

        {/* Invite Link */}
        {team.members.length < 4 && teamMember && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full hover:cursor-pointer rounded-none border-neutral-800 hover:bg-neutral-900"
              >
                + Add Teammates
              </Button>
            </PopoverTrigger>
            <PopoverContent className="relative w-80 rounded-none border-neutral-800 bg-neutral-950">
              <button
                type="button"
                className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center hover:bg-neutral-800"
                onClick={async () => {
                  if (inviteCode === "") return;

                  setInviteCode("");
                  const resetResult = await resetInviteCode(inviteCode);
                  if (resetResult.success) {
                    const result = await getInviteCode(teamId);
                    if (result.success) setInviteCode(result.code);
                  } else {
                    toast.error("Failed to remove invite.");
                  }
                }}
              >
                <span className="text-2xl">&#10227;</span>
              </button>

              <p className="mb-2 text-sm text-neutral-400">
                Send this invite link to friends:
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={getLink()}
                  readOnly
                  className="flex-1 rounded-none border-neutral-800 bg-transparent"
                />
                <Button
                  size="sm"
                  onClick={copyLink}
                  className="rounded-none bg-white text-black hover:bg-neutral-200"
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </CardContent>
    </Card>
  );
}
