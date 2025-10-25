"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@repo/ui/components/popover";
import {
  getInviteCode,
  getTeamInfo,
  resetInviteCode,
  removeUserToTeams,
  updateTeam,
} from "@/app/actions";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Prisma } from "@repo/database";

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
    members: {
      select: {
        id: true;
        participant: {
          select: {
            user: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export default function TeamPageClient({
  teamId,
  year,
  isTeamMember,
}: {
  teamId: string;
  year: string;
  isTeamMember: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [team, setTeam] = useState<TeamInfo | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    const fetchTeam = async () => {
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
    };
    const fetchInvite = async () => {
      const code = await getInviteCode(teamId);
      if (code) setInviteCode(code);
    };
    fetchTeam();
    fetchInvite();
  }, [teamId, form]);

  const getLink = useCallback(
    () =>
      inviteCode == ""
        ? "Generating..."
        : `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/${year}/invite/${inviteCode}`,
    [year, inviteCode],
  );

  const copyLink = async () => {
    await navigator.clipboard.writeText(getLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const res = await updateTeam(teamId, values);
    if (res) {
      const updatedTeam = await getTeamInfo(teamId);
      setTeam(updatedTeam);
      setEditing(false);
    }
  };

  const removeUser = async (userId: string) => {
    await removeUserToTeams(userId, teamId);
    setTeam((prevTeam) => {
      if (!prevTeam) return prevTeam;
      return {
        ...prevTeam,
        members: prevTeam.members.filter(
          (m) => m.participant.user.id !== userId,
        ),
      };
    });
  };

  if (!team) return <div className="text-center py-10">Loading Team...</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      {/* Team Header */}
      <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{team.name}</h1>
          {team.lookingForTeammates && (
            <span className="text-green-600 font-medium mt-1 inline-block">
              Looking for teammates ✔
            </span>
          )}
        </div>
        {isTeamMember && !editing && (
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => setEditing(true)}
          >
            Edit
          </Button>
        )}
      </div>

      {/* --- View Mode --- */}
      {!editing && (
        <>
          {/* Team Description */}
          {team.description && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{team.description}</p>
            </div>
          )}

          {/* Members */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">Members</h2>
            <ul className="space-y-2">
              {team.members.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between"
                >
                  <span>{member.participant.user.name}</span>
                  {isTeamMember && (
                    <Image
                      src="/trashcan-red.png"
                      alt="Remove user"
                      width={20}
                      height={20}
                      className="cursor-pointer"
                      onClick={() => removeUser(member.participant.user.id)}
                    />
                  )}
                </li>
              ))}
            </ul>

            {/* Invite Link */}
            {team.members.length < 4 && isTeamMember && (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="mt-4 rounded-xl w-full">
                    + Add Teammates
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 relative">
                  <button
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded"
                    onClick={async () => {
                      if (inviteCode == "") return;

                      setInviteCode("");
                      const success = await resetInviteCode(inviteCode);
                      if (success) {
                        const code = await getInviteCode(teamId);
                        if (code) setInviteCode(code);
                      } else {
                        toast.error("Failed to remove invite.");
                      }
                    }}
                  >
                    <span className="text-2xl">&#10227;</span>
                  </button>

                  <p className="text-sm mb-2">
                    Send this invite link to friends:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={getLink()}
                      readOnly
                      className="flex-1 px-2 py-1 border rounded"
                    />
                    <Button size="sm" onClick={copyLink}>
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Contact Info */}
          {team.contact && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-2">Contact</h2>
              <p>{team.contact}</p>
            </div>
          )}
        </>
      )}

      {/* --- Edit Mode --- */}
      {editing && (
        <div className="bg-white rounded-xl shadow-md p-6">
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
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Team Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Looking for teammates */}
              <FormField
                control={form.control}
                name="lookingForTeammates"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <FormLabel>Looking for teammates</FormLabel>
                  </FormItem>
                )}
              />

              {/* Contact */}
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Email" />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Brief description..." />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 rounded-xl"
                  disabled={loading}
                >
                  <span className="inline-flex items-center justify-center min-w-[90px]">
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Update Team"
                    )}
                  </span>
                </Button>
                <Button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-300 rounded-xl"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
