import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc";


export const AuthPage = () => {
	return (
		<div className="flex items-center justify-center w-screen h-screen">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to BeaverHacks</CardTitle>
          <CardDescription>Please sign in with Google</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/api/login">
            <Button variant="outline">
              <FcGoogle />
              Sign in with Google
            </Button>
          </Link>  
        </CardContent>
      </Card>
		</div>
	);
}