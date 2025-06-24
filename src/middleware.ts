import { NextRequest, NextResponse } from 'next/server';

// This middleware protects the /control-panel route with Basic Auth.
export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/control-panel')) {
    const basicAuth = req.headers.get('authorization');
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      // The atob function is available in the Edge runtime
      const [user, pwd] = atob(authValue).split(':');

      const validUser = process.env.ADMIN_USER;
      const validPassword = process.env.ADMIN_PASSWORD;

      if (user === validUser && pwd === validPassword) {
        return NextResponse.next();
      }
    }
    // If auth is missing or incorrect, prompt for credentials
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/control-panel/:path*',
};
