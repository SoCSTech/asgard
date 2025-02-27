"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  getCookie,
  getCookies,
  setCookie,
  deleteCookie,
  hasCookie,
  useGetCookies,
  useSetCookie,
  useHasCookie,
  useDeleteCookie,
  useGetCookie,
} from "cookies-next/client";

export default function LoginForm() {
  const [errorMessage, setErrorMessage] = React.useState("");

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
        setCookie("admin_token", response.data.TOKEN); ///!!!!! SETUP SECURE COOKIE STUFF HERE !!!!!!!!!!!!!!
        window.location.href = redirect || "/";
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
      <div className="my-5 text-center text-white">
        <h1 className="text-2xl">Login to Asgard</h1>
      </div>
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
          // className="hidden"
          name="totp"
        />
        <div className="mt-5 flex w-full flex-col">
          <Button type="submit">Login</Button>
        </div>
      </form>
      <p className="my-5 text-center text-gray-200 hover:text-white">
        <a href="/forgot-password">Forgot password?</a>
      </p>
      {errorMessage && (
        <p className="mt-5 rounded-lg bg-salmon p-2 text-center">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
