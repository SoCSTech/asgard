interface AuthProvider {
  isAuthenticated: boolean;
  username: null | string;
  password: null | string;
  signin(username: string): Promise<void>;
  signout(): Promise<void>;
}

/**
 * This represents some generic auth provider API, like Firebase.
 */
export const AuthProvider: AuthProvider = {
  isAuthenticated: false,
  username: null,
  password: null,

  async signin(username: string) {
    await new Promise((r) => setTimeout(r, 500)); // fake delay
    AuthProvider.username = username;
    AuthProvider.isAuthenticated = true;
  },
  async signout() {
    await new Promise((r) => setTimeout(r, 500)); // fake delay
    AuthProvider.isAuthenticated = false;
    AuthProvider.username = "";
    AuthProvider.password = "";
  },
};