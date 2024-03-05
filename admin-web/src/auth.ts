interface AuthProvider {
  isAuthenticated: boolean;
  token: string | null;
  username: string | null;
  signin(username: string, password: string): Promise<void>;
  signout(): Promise<void>;
  init(): void;
}

export const AuthProvider: AuthProvider = {
  isAuthenticated: false,
  token: null,
  username: null,

  init() {
    // Retrieve the token from cookies on application startup
    const cookies = document.cookie.split(';').map(cookie => cookie.trim().split('='));
    const tokenCookie = cookies.find(cookie => cookie[0] === 'token');
    if (tokenCookie) {
      this.token = tokenCookie[1];
      this.isAuthenticated = true;
    }
  },

  async signin(username: string, password: string) {
    try {
      const response = await fetch(import.meta.env.VITE_API_BASE_URL + "/v2/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid login attempt");
      }

      const cookieExpiry: Date = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const data = await response.json();
      const token = data.TOKEN;

      // Save the token as a cookie
      document.cookie = `token=${token}; path=/; expires=${cookieExpiry}; HttpOnly;`;

      // Set token in the AuthProvider
      this.token = token;
      this.username = username;
      this.isAuthenticated = true;
    } catch (error) {
      throw new Error("Invalid login attempt");
    }
  },

  async signout() {
    // Clear token and user information
    this.token = null;
    this.username = null;
    this.isAuthenticated = false;

    // Remove the token cookie by setting its expiration time to the past
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; HttpOnly;';
  },
};

// Initialize AuthProvider on application startup
AuthProvider.init();
