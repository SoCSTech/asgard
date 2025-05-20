"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const REGEXP_ASGARD_SECURE_CODE = "^[a-fA-F0-9]+$";

export default function ChangePasswordForm() {
  const [errorMessage, setErrorMessage] = React.useState("");
  const [code, setCode] = React.useState({ provided: false, value: "" });

  let queryParameters: URLSearchParams;
  React.useEffect(() => {
    queryParameters = new URLSearchParams(window.location.search);
    const _code = queryParameters.get("code");
    if (_code) {
      setCode({ provided: true, value: _code });
    }
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    // Prevent page reload
    event.preventDefault();
    setErrorMessage("");

    const { password, confirmPassword } = document.forms[0];

    if (password.value !== confirmPassword.value) {
      setErrorMessage("The passwords you have entered do not match.");
      throw new Error("PASSWORD_MISMATCH");
      return;
    }

    axios
      .post("/v2/auth/change-password", {
        resetToken: code.value,
        password: password.value,
      })
      .then(function (response) {
        console.log(response);
        setErrorMessage("");
        window.location.href = "/login";
      })
      .catch(function (error) {
        console.log(error);
        setErrorMessage(error.response.data.message);
      });
  };

  return (
    <div>
      <div className="my-5 text-center text-white">
        <h1 className="text-2xl">Change your Password</h1>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-between text-center align-middle"
      >
        <div className="flex justify-center w-full">
          <InputOTP
            maxLength={8}
            pattern={REGEXP_ASGARD_SECURE_CODE}
            disabled={code.provided}
            value={code.value}
            onChange={(x) => setCode({ provided: false, value: x })}
            className=""
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
              <InputOTPSlot index={6} />
              <InputOTPSlot index={7} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Input
          type="password"
          placeholder="New password"
          autoComplete="new-password"
          name="password"
          id="password"
          className="mt-5"
        />
        <Input
          type="password"
          placeholder="Confirm new password"
          autoComplete="new-password"
          name="confirmPassword"
          id="confirmPassword"
        />

        <div className="mt flex w-full flex-col">
          <div className="mt-5 flex w-full flex-col">
            <Button type="submit">Update Password</Button>
          </div>
        </div>
      </form>
      <p className="pt-5 text-center text-salmon">{errorMessage}</p>
    </div>
  );
}
