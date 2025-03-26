"use client";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

function SignInPage() {
  const { signIn, isLoading, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  async function submit(e) {
    e.preventDefault();
    if (!isLoaded) return;
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.push("/dashboard")
      }
    } catch (error) {
      toast.error(
        error?.errors[0].message || "Something went wrong while signing in"
      );
      console.log(error);
    }
  }

  return <></>;
}

export default SignInPage;
