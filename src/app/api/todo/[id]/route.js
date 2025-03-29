import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "../../../../lib/prisma";

export async function DELETE(req, { params }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized user id not found" },
      { status: 401 }
    );
  }

  //* Fetching our required param (id in this case)
  if (!params.id) {
    return NextResponse.json({ error: "Missing todo id" }, { status: 400 });
  }

  try {
    const todo = await prisma.Todo.findUnque({
      where: {id: params.id}
    })

    if(!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    if(todo.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deletedTodo = await prisma.Todo.delete({
      where: {id: params.id}
    })

    return NextResponse.json({
      message: "Todo deleted successfully",
      todo: deletedTodo
    }, {
      status: 200
    });

  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to delete todo",
      },
      {
        status: 200,
      }
    );

  }
}