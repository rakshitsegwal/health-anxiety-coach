import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase auth session on every request and guards /dashboard.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Gate the authed area on EVERY request. The (app) layout alone is NOT enough:
  // Next.js doesn't re-run a layout on soft client navigations within its segment,
  // so a refund that lands mid-session wouldn't revoke access until a hard reload.
  // Middleware runs on every request (incl. the RSC fetch for soft navs), so this
  // is the cache- and navigation-proof gate.
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    // Paid-access check, RLS-enforced → only this user's own orders are visible.
    // A refunded order is status='refunded' and won't match, so a refunded user is
    // revoked here, immediately, on the next request.
    const { data: paidOrder } = await supabase
      .from("orders")
      .select("id")
      .eq("status", "paid")
      .limit(1)
      .maybeSingle();
    if (!paidOrder) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("revoked", "1");
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)",
  ],
};
