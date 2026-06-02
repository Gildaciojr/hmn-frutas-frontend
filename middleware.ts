import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const { pathname } = request.nextUrl;

  ////////////////////////////////////////////////////////////
  // ROTAS PÚBLICAS
  ////////////////////////////////////////////////////////////

  const publicRoutes = [
    "/",
    "/login",
    "/select-mode",
  ];

  const isPublic = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  ////////////////////////////////////////////////////////////
  // PROTEGE SOMENTE ÁREAS INTERNAS
  ////////////////////////////////////////////////////////////

  if (
    !token &&
    !isPublic &&
    (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/financeiro")
    )
  ) {
    return NextResponse.redirect(
      new URL("/select-mode", request.url),
    );
  }

  ////////////////////////////////////////////////////////////
  // LOGIN ANTIGO
  ////////////////////////////////////////////////////////////

  if (token && pathname === "/login") {
    return NextResponse.redirect(
      new URL("/select-mode", request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/select-mode",
    "/dashboard/:path*",
    "/financeiro/:path*",
  ],
};