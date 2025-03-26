"use client";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

function SignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  if (!isLoaded) {
    return <div />;
  }

  async function submit(e) {
    e.preventDefault();
    if (!isLoaded) return;
    try {
      await signUp.create({
        emailAddress: email,
        password: password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
    } catch (error) {
      toast.error(
        error?.errors[0].message || "Something went wrong while signing up"
      );
      console.log(error);
    }
  }
  async function onPressVerify(e) {
    e.preventDefault();
    if (!isLoaded) return;
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({code});

      if (completeSignUp.status !== "complete") { 
        console.log(completeSignUp);
        toast.error(completeSignUp)
      }

      if (completeSignUp.status === "complete") { 
        await setActive({ session: completeSignUp.createdSessionId })
        router.push("/dashboard")
      }

      setPendingVerification(true);
    } catch (error) {
      toast.error(
        error?.errors[0].message || "Something went wrong while verification"
      );
      console.log(error);
    }
  }

  return <>SignUp</>;
}

export default SignUp;
