import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "../../../../lib/prisma";

const ITEMS_PER_PAGE = 10;

export async function GET(req) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized user id not found" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";

  try {
    const todos = await prisma.Todo.findMany({
      where: {
        userId: userId,
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      orderBy: { createdAt: "desc" },
      //*Pagination how many items to take and skip
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
    });

    const totalCount = await prisma.Todo.count({
      where: {
        userId: userId,
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
    });

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return NextResponse.json(
      {
        message: "Fetched todos successfully",
        todos,
        totalCount,
        totalPages,
        currentPage: page,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error fetching todos", error);
    return NextResponse.json(
      {
        error: "Unable to fetch todos",
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized user id not found" },
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        todos: true,
      },
    });

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized usernot found" },
        { status: 404 }
      );
    }

    if (!user.isSubscribed && user.todos.length >= 10) {
      return NextResponse.json(
        { error: "You are not subscribed" },
        { status: 403 }
      );
    }

    const { title } = await req.json();
    const createdTodo = await prisma.Todo.create({
      data: {
        title,userId
      }
    })
    return NextResponse.json({
      message: "Todo created successfully",
      createdTodo
    },{status:200});  
  } catch (error) {
    console.log("Error creating todo", error);
    return NextResponse.json(
      {
        error: "Something went wrong while creating todo",
      },
      { status: 500 }
    ); 
  }
}
