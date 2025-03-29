import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "../../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add the WEBHOOK_SECRET environment variable");
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixSignature = headerPayload.get("svix-signature");
  const svixTimestamp = headerPayload.get("svix-timestamp");

  if (!svixId || !svixSignature || !svixTimestamp) {
    throw new Error("Missing svix headers");
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);
  let event;


  try {
    event = await wh.verify(body, {
      "svix-id": svixId,
      "svix-signature": svixSignature,
      "svix-timestamp": svixTimestamp,
    });
  } catch (error) {
    console.log("Error verifying webhook", error);
  }
  console.log(event);

  const { id } = event.data;
  const type = event.type;

  if (type === "user.created") {
    try {
      const { email_addresses, primary_email_address_id } = event.data;
      const primaryEmail = email_addresses.find(
        (email) => email.id === primary_email_address_id
      );

      if (!primaryEmail) {
        return NextResponse(
          {
            error: "Missing primary email address",
          },
          {
            status: 400,
          }
        );
      }

      await prisma.User.create({
        data: {
          email: primaryEmail.email_address,
          isSubscribed: false,
        },
      });

      console.log("User created");
    } catch (error) {
      console.log("Error creating user", error);
      return new NextResponse(
        { error: "Error creating user" },
        { status: 500 }
      );
    }
  }

  return new NextResponse(
    { message: "Webhook recieved sucessfully" },
    { status: 200 }
  );
}
