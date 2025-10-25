"use client";

import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";
import { Textarea } from "@repo/ui/components/textarea";
import { Switch } from "@repo/ui/components/switch";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { useForm } from "react-hook-form";

import { createTeam } from "@/app/actions";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { authClient } from "@repo/auth/client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  name: z
    .string()
    .min(4, { message: "Team name must be at least 4 characters." }),
  lft: z.boolean().optional(),
  contact: z.string().optional(),
  description: z.string().optional(),
});

export default function Home({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const [loading, setLoading] = useState(false);

  const hackathonId = React.use(params).year;
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      lft: false,
    },
  });

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/log-in");
    }
  }, [isPending, session, router]);

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center text-lg">
        Loading...
      </div>
    );
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const teamData = {
      name: values.name,
      lookingForTeammates: values.lft,
      description: values.description,
      contact: values.contact,
      hackathon: { connect: { id: hackathonId } },
    };
    const teamId = await createTeam(teamData, true);

    if (!teamId) {
      toast.error("Failed to create team");
      return false;
    }

    router.push(`/${hackathonId}/team/${teamId}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-slate-800">
          Create a Team
        </h1>
        <p className="mb-8 text-center text-slate-500">
          Set up your team and start collaborating with others.
        </p>

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
            className="space-y-8"
          >
            {/* Team Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Amazing Team Name"
                      {...field}
                      className="rounded-xl"
                    />
                  </FormControl>
                  <FormDescription>
                    This will be displayed publicly on your team page.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Looking for teammates toggle */}
            <FormField
              control={form.control}
              name="lft"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl border p-4">
                  <div>
                    <FormLabel>Looking for teammates?</FormLabel>
                    <FormDescription>
                      Show others that you’re open to new members.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Conditional extra fields */}
            <AnimatePresence>
              {form.watch("lft") && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 pl-2"
                >
                  {/* Contact */}
                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Info</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Email: benny@beaverhacks.com"
                            {...field}
                            value={field.value || ""}
                            className="rounded-xl"
                          />
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
                        <FormLabel>Brief Project Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Prospective teammates should know..."
                            {...field}
                            value={field.value || ""}
                            className="rounded-xl"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green-500 py-6 text-lg font-semibold text-white shadow-md hover:bg-green-600 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin mx-auto" />
              ) : (
                "Create Team"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
