import {
  auth,
  clerkMiddleware,
  createRouteMatcher,
  clerkClient,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/","/sign-in", "/sign-up","/api/webhook/register"]);

export default clerkMiddleware(async (req) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
    if (userId) {
      const user = await clerkClient.users.getUser(userId);
      if (!user) {
        return NextResponse.redirect(new URL("/sign-in", req.url));
      }
      const role = user.publicMetadata.role;

      //* User is an admin
      if (role === "admin" && req.nextUrl.pathname === "/dashboard") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }

      //* User is not an admin
      if (role !== "admin" && req.nextUrl.pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      //* User is logged in and trying to acess public routes
      if (isPublicRoute(req) && userId) {
        return NextResponse.redirect(
          new URL(role === "admin" ? "/admin/dashboard" : "/dashboard", req.url)
        );
      }
    }
  } catch (error) {
    console.log(error);
    return NextResponse.redirect(new URL("/error", req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
