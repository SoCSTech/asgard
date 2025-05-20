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

export default function ForgotPasswordForm() {
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleResetRequest = (event: React.FormEvent<HTMLFormElement>): void => {
    // Prevent page reload
    event.preventDefault();
    const { username } = document.forms[0];

    axios
      .post("/v2/auth/forgot-password", {
        username: username.value,
      })
      .then(function (response) {
        setErrorMessage("");
        setSuccessMessage(response.data.message);
        setSubmitted(true);
      })
      .catch(function (error) {
        console.log(error);
        setErrorMessage(error.response.data.message);
        setSuccessMessage("");
      });
  };

  return (
    <div>
      <div className="my-5 text-center text-white">
        <h1 className="text-2xl">Reset your Password</h1>
      </div>
      <form onSubmit={handleResetRequest}>
        <Input
          type="text"
          placeholder="Username"
          autoComplete="username"
          name="username"
        />
        <div className="mt-5 flex w-full flex-col">
          <Button type="submit">Send recovery email</Button>
        </div>
      </form>
      <p className="my-5 text-center text-gray-200 hover:text-white">
        <a href="/login">Login?</a>
      </p>
      {errorMessage && (
        <p className="mt-5 rounded-lg bg-salmon text-black p-2 text-center">
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p className="mt-5 rounded-lg bg-white text-black p-2 text-center">
          {successMessage}
        </p>
      )}
    </div>
  );
}
