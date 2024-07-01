import { API_URL } from "@/constants";

interface VerifyTokenResponse {
    valid: boolean;
    user: string;
}

export async function verifyToken(token: string): Promise<VerifyTokenResponse> {
    const response = await fetch(API_URL + '/v2/tests/auth', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        return response.json();

    } else {
        throw new Error('Token verification failed');
    }
}