import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { API_URL } from "@/constants";
import { setJwtCookie } from "@/lib/cookie";

export default function ChangePasswordForm() {
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleLogin = (event: React.FormEvent<HTMLFormElement>): void => {
    // Prevent page reload
    event.preventDefault();
    const { username, password } = document.forms[0];
    const queryParameters = new URLSearchParams(window.location.search);
    const redirect = queryParameters.get("redirect");

    axios
      .post(API_URL + "/v2/auth/login", {
        username: username.value,
        password: password.value,
      })
      .then(function (response) {
        console.log(response);
        setErrorMessage("");
        setJwtCookie(response.data.TOKEN)
        window.location.href = redirect || "/";
      })
      .catch(function (error) {
        console.log(error);
        setErrorMessage(error.response.data.message);
      });
  };

  return (
    <div>
      <form onSubmit={handleLogin}>
        <Input
          type="text"
          placeholder="Username"
          autoComplete="username"
          name="username"
        />
        <Input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          name="password"
        />
        <Button type="submit" variant={"secondary"}>
          Login
        </Button>
      </form>
      <p className="text-white pt-5 text-center">
        <a href="#">Forgot password?</a>
      </p>

      <p className="text-salmon pt-5 text-center">{errorMessage}</p>
    </div>
  );
}
