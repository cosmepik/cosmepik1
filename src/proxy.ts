import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isInfluencerRoute = createRouteMatcher(["/influencer(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isInfluencerRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
