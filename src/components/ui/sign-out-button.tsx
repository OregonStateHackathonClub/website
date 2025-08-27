"use client"

import { signOut } from "@/lib/auth-client"
import { Button } from "./button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export const SignOutButton = () => {

    const router = useRouter();

    async function handleClick() {
        await signOut({
            fetchOptions: {
                onError: (ctx) => {
                    toast.error(ctx.error.message)
                },
                onSuccess: () => {
                    router.push("/login")
                }
            }
        })
    }

    return (
        <Button variant="outline" type="submit" onClick={handleClick}>Sign Out</Button>
    )
}