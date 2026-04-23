import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Skip static files, images, and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|logos|onboarding|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
