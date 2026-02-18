"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Switch } from "@repo/ui/components/switch";
import { Textarea } from "@repo/ui/components/textarea";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createTeam } from "@/app/actions/participant";

const formSchema = z.object({
  name: z
    .string()
    .min(4, { message: "Team name must be at least 4 characters." }),
  lft: z.boolean().optional(),
  contact: z.string().optional(),
  description: z.string().optional(),
});

interface CreateTeamModalProps {
  hackathonId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTeamModal({
  hackathonId,
  open,
  onOpenChange,
}: CreateTeamModalProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      lft: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const teamData = {
        name: values.name,
        lookingForTeammates: values.lft,
        description: values.description,
        contact: values.contact,
        hackathon: { connect: { id: hackathonId } },
      };
      const result = await createTeam(teamData, true);

      if (!result.success) {
        toast.error(result.error || "Failed to create team");
        return;
      }

      onOpenChange(false);
      router.push(`/${hackathonId}/team/${result.teamId}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none border-neutral-800 bg-neutral-950 [&>button]:text-neutral-500 [&>button]:hover:text-white [&>button]:rounded-none">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white">
            Create a Team
          </DialogTitle>
          <DialogDescription className="text-neutral-500">
            Set up your team and start collaborating with others.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-400">Team Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Amazing Team Name"
                      {...field}
                      className="rounded-none border-neutral-800 bg-transparent"
                    />
                  </FormControl>
                  <FormDescription className="text-neutral-600">
                    This will be displayed publicly on your team page.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lft"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel className="text-neutral-400">
                      Looking for teammates?
                    </FormLabel>
                    <FormDescription className="text-neutral-600">
                      Show others that you&apos;re open to new members.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="hover:cursor-pointer"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("lft") && (
              <div className="space-y-4 pl-2">
                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-neutral-400">
                        Contact Info
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Email: benny@beaverhacks.com"
                          {...field}
                          value={field.value || ""}
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
                        Brief Project Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Prospective teammates should know..."
                          {...field}
                          value={field.value || ""}
                          className="rounded-none border-neutral-800 bg-transparent"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black hover:bg-neutral-200 rounded-none"
            >
              {loading ? (
                <Loader2 size={20} className="mx-auto animate-spin" />
              ) : (
                "Create Team"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
