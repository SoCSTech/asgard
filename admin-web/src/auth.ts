interface AuthProvider {
  isAuthenticated: boolean;
  token: string | null;
  username: string | null;
  signin(username: string, password: string): Promise<void>;
  signout(): Promise<void>;
}

export const AuthProvider: AuthProvider = {
  isAuthenticated: false,
  token: null,
  username: null,

  async signin(username: string, password: string) {
    try {
      const response = await fetch("http://localhost:3000/v2/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid login attempt");
      }

      const data = await response.json();
      const token = data.TOKEN;

      // Save the token as a cookie
      document.cookie = `token=${token}; path=/`;

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
  },
};
