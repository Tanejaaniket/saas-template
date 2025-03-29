import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "../../../../lib/prisma";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized user id not found" },
      { status: 401 }
    );
  }

  //capture payment

  //add subscription
  try {
    const user = await prisma.User.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const subscriptionEnds = Date.now() + 30 * 24 * 60 * 60 * 1000;

    const updatedUser = await prisma.User.update({
      where: { id: userId },
      data: {
        isSubscribed: true,
        subscriptionEnds: subscriptionEnds,
      },
    });

    return NextResponse.json(
      {
        message: "Success",
        subscriptionEnds: updatedUser.subscriptionEnds,
        isSubscribed: updatedUser.isSubscribed,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error updating subscription", error);
    return NextResponse.json(
      {
        error: "Error updating subscription",
      },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized user id not found" },
      { status: 401 }
    );
  }

  //capture payment

  //add subscription
  try {
    const user = await prisma.User.findUnique({
      where: { id: userId },
      select: {
        //*True means we need these fields
        isSubscribed: true,
        subscriptionEnds: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();
    if (user.subscriptionEnds && user.subscriptionEnds < now) {
      await prisma.User.update({
        where: { id: userId },
        data: {
          isSubscribed: false,
          subscriptionEnds: null,
        },
      });
      return NextResponse.json(
        {
          message: "Fetched subscription",
          isSubscribed: false,
          subscriptionEnds: null,
        },
        {
          status: 200,
        }
      );
    }
    return NextResponse.json(
      {
        message: "Fetched subscription",
        isSubscribed: user.isSubscribed,
        subscriptionEnds: user.subscriptionEnds,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("Error fetching subscription", error);
    return NextResponse.json(
      {
        error: "Unable to fetch subscription",
      },
      {
        status: 200,
      }
    );
  }
}
