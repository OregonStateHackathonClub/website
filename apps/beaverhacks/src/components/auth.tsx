"use client";

import { authClient } from "@repo/auth/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

export const AuthPage = () => {
  const handleGitHubSignIn = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/",
    });
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to BeaverHacks</CardTitle>
          <CardDescription>Please sign in to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGitHubSignIn} variant="outline" className="w-full">
            <FaGithub className="mr-2" />
            Sign in with GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};