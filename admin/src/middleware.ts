import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import axios from 'axios';

// Public routes are ones that do not require authentication
// This is the list for the base url i.e. 
// http://localhost/images/bg123.wepb would match as 'images' in the list
const publicRoutes = ['/login', '/change-password', '/forgot-password']

interface VerifyTokenResponse {
    valid: boolean;
    user: string;
}

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname
    const isPublicRoute = publicRoutes.some(route => path.startsWith(route));
    
    console.log(path, isPublicRoute)

    if (isPublicRoute) {
        return NextResponse.next()
    }

    const jwt = (await cookies()).get('admin_token')?.value

    // If there isnt a JWT in the cookies, they are not authenticated
    if (!jwt)
        return NextResponse.redirect(new URL('/login', req.nextUrl))

    // If they have a token, it probably fine... we should fix this later
    return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
    matcher: ['/((?!v2|api|images|auth|_next/static|_next/image|favicon.ico).*)'],
}