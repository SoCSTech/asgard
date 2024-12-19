import cookie from 'cookie';

export function setJwtCookie(token: string) {
    document.cookie = cookie.serialize('token', token, {
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
        sameSite: 'strict'
    });
}

export function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()!.split(';').shift()!;
    return null;
}

export function getCurrentUserId(): string | null {
    // Get the token, split out the data and then return the id
    let token = getCookie("token")?.toString().split(".")
    if (token?.length != 3)
        return null

    return JSON.parse(atob(token[1]))?.id
}