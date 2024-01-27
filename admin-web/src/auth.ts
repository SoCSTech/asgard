interface AuthProvider {
  isAuthenticated: boolean;
  username: null | string;
  password: null | string;
  shortName: null | string;
  fullName: null | string;
  initials: null | string;
  role: null | string;
  email: null | string;
  creationDate: null | string;
  profilePictureURL: null | string;
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
  shortName: null,
  fullName: null,
  initials: null,
  role: null,
  email: null,
  creationDate: null,
  profilePictureURL: null,

  async signin(username: string) {

    console.log(import.meta.env.VITE_API_BASEURL)
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