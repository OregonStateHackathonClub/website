"use client";

import { signIn, signUp } from "@repo/auth/client";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";

export const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGitHubSignIn = async () => {
    await signIn.social({
      provider: "github",
      callbackURL: "/apply",
    });
  };

  const handleEmailSignIn = async () => {
    await signIn.email(
      { email, password },
      {
        onRequest: () => setLoading(true),
        onResponse: () => setLoading(false),
        onSuccess: () => router.push("/apply"),
      },
    );
  };

  const handleSignUp = async () => {
    await signUp.email({
      email,
      password,
      name: `${firstName} ${lastName}`,
      callbackURL: "/apply",
      fetchOptions: {
        onRequest: () => setLoading(true),
        onResponse: () => setLoading(false),
        onSuccess: () => router.push("/apply"),
        onError: (ctx) => console.error(ctx.error.message),
      },
    });
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <Card className="max-w-md w-full mx-4">
        <CardHeader>
          <CardTitle>
            {isSignUp ? "Create Account" : "Welcome to BeaverHacks"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Enter your information to create an account"
              : "Please sign in to continue"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSignUp && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First name</Label>
                <Input
                  id="first-name"
                  placeholder="Benny"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input
                  id="last-name"
                  placeholder="Beaver"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="benny@oregonstate.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {isSignUp && (
            <div className="grid gap-2">
              <Label htmlFor="password-confirm">Confirm Password</Label>
              <Input
                id="password-confirm"
                type="password"
                placeholder="Confirm Password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
              />
            </div>
          )}

          <Button
            onClick={isSignUp ? handleSignUp : handleEmailSignIn}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isSignUp ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            onClick={handleGitHubSignIn}
            variant="outline"
            className="w-full"
          >
            <FaGithub className="mr-2" />
            Sign in with GitHub
          </Button>

          <div className="text-center text-sm">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <Button
                  variant="link"
                  className="p-0"
                  onClick={() => setIsSignUp(false)}
                >
                  Sign in
                </Button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <Button
                  variant="link"
                  className="p-0"
                  onClick={() => setIsSignUp(true)}
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
