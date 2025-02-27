"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useCookies } from "next-client-cookies";

export default function LoginForm() {
  const [errorMessage, setErrorMessage] = React.useState("");
  const cookies = useCookies();

  const handleLogin = (event: React.FormEvent<HTMLFormElement>): void => {
    // Prevent page reload
    event.preventDefault();
    const { username, password, totp } = document.forms[0];
    const queryParameters = new URLSearchParams(window.location.search);
    const redirect = queryParameters.get("redirect");

    axios
      .post(
        "/v2/auth/login",
        {
          username: username.value,
          password: password.value,
          totp: totp.value,
        },
        {
          timeout: 15000, // 15 seconds timeout
          headers: { "Cache-Control": "no-cache" },
        },
      )
      .then(function (response) {
        setErrorMessage("");
        // setJwtCookie(response.data.TOKEN);
        // cookies.set("admin_token", response.data.TOKEN)
        // window.location.href = redirect || "/";
      })
      .catch(function (error) {
        console.log(error);
        if (error.code === "ECONNABORTED") {
          setErrorMessage(
            "The request took too long - please try again later.",
          );
        } else {
          setErrorMessage(
            error.response?.data?.message || "An unknown error occurred",
          );
        }
      });
  };

  return (
    <div>
      <h1>Change pass</h1>
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
        <Input
          type="text"
          placeholder="2FA Code"
          autoComplete="username"
          name="totp"
        />
        <div className="flex w-full flex-col mt-5">
          <Button type="submit">
            Login
          </Button>
        </div>
      </form>
      {errorMessage && <p className="bg-salmon mt-5 p-2 rounded-lg text-center">{errorMessage}</p>}
    </div>
  );
}
