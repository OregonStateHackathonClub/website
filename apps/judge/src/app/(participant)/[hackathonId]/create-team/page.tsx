"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { authClient, redirectToLogin } from "@repo/auth/client";
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
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
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

export default function Home({
  params,
}: {
  params: Promise<{ hackathonId: string }>;
}) {
  const [loading, setLoading] = useState(false);

  const hackathonId = React.use(params).hackathonId;
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
      redirectToLogin();
    }
  }, [isPending, session]);

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center text-lg text-neutral-500">
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
    const result = await createTeam(teamData, true);

    if (!result.success) {
      toast.error(result.error || "Failed to create team");
      return false;
    }

    router.push(`/${hackathonId}/team/${result.teamId}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-2xl rounded-none border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold text-white">
            Create a Team
          </CardTitle>
          <CardDescription className="text-center mt-1 text-neutral-500">
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

              {/* Looking for teammates toggle */}
              <FormField
                control={form.control}
                name="lft"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel className="text-neutral-400">Looking for teammates?</FormLabel>
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

              {/* Conditional extra fields */}
              {form.watch("lft") && (
                <div className="space-y-6 pl-2">
                  {/* Contact */}
                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-neutral-400">Contact Info</FormLabel>
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

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-neutral-400">Brief Project Description</FormLabel>
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

              {/* Submit button */}
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
        </CardContent>
      </Card>
    </div>
  );
}
