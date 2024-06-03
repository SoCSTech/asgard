import cookie from 'cookie';

export function setJwtCookie(token: string) {
    document.cookie = cookie.serialize('token', token, {
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
        secure: true,
        sameSite: 'strict'
    });
}

export function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()!.split(';').shift()!;
    return null;
}