import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { API_URL } from "@/constants";
import { setJwtCookie } from "@/lib/cookie";

export default function LoginForm() {
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleLogin = (event: React.FormEvent<HTMLFormElement>): void => {
    // Prevent page reload
    event.preventDefault();
    const { username, password } = document.forms[0];
    const queryParameters = new URLSearchParams(window.location.search);
    const redirect = queryParameters.get("redirect");

    axios
      .post(
        API_URL + "/v2/auth/login",
        {
          username: username.value,
          password: password.value,
        },
        {
          timeout: 15000, // 15 seconds timeout
          headers: { "Cache-Control": "no-cache" },
        }
      )
      .then(function (response) {
        setErrorMessage("");
        setJwtCookie(response.data.TOKEN);
        window.location.href = redirect || "/";
      })
      .catch(function (error) {
        console.log(error);
        if (error.code === "ECONNABORTED") {
          setErrorMessage(
            "The request took too long - please try again later."
          );
        } else {
          setErrorMessage(
            error.response?.data?.message || "An unknown error occurred"
          );
        }
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
        <div className="flex w-full flex-col">
          <Button type="submit" variant={"primaryOutline"}>
            Login
          </Button>
        </div>
      </form>
      <p className="text-salmon pt-5 text-center">{errorMessage}</p>
    </div>
  );
}
