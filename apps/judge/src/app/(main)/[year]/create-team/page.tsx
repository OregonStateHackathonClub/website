"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
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
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createTeam } from "@/app/actions";

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
      // leader: { connect: { userId: session?.user.id } },
    };
    const teamId = await createTeam(teamData, true);

    if (!teamId) {
      toast.error("Failed to create team");
      return false;
    }

    router.push(`/${hackathonId}/team/${teamId}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">
            Create a Team
          </CardTitle>
          <CardDescription className="text-center !mt-4">
            Set up your team and start collaborating with others.
          </CardDescription>
        </CardHeader>
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
                      <Input placeholder="Amazing Team Name" {...field} />
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
                  <FormItem className="flex items-center justify-between">
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
                        className="hover:cursor-pointer"
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
                className="w-full bg-orange-500 hover:bg-orange-300 hover:cursor-pointer text-white hover:text-black"
              >
                {loading ? (
                  <Loader2 size={20} className="mx-auto animate-spin" />
                ) : (
                  "Create Team"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
