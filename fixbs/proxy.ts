import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|webmanifest|ttf|woff2?|png|jpg|jpeg|gif|svg|svgz|ico|icns|cur|gz|tgz|bz2|tbz2|xz|zst|zip|7z|rar|bz2|iso|dmg|tar|lz|lzma|tlz|apk|exe|deb|rpm|pdf|doc|docx|xls|xlsx|ppt|pptx)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
