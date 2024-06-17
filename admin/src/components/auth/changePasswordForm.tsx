import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { API_URL } from "@/constants";
import { setJwtCookie } from "@/lib/cookie";

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
    // const redirect = queryParameters.get("redirect") || "";

    const { password, confirmPassword } = document.forms[0];
    console.log("hi")
    console.log(password.value)
    console.log(confirmPassword.value);

    if (password.value.length > 13) {
      setErrorMessage("The passwords you have entered is too short.");
      return;
    }

    if (password.value !== confirmPassword.value) {
      setErrorMessage("The passwords you have entered do not match.");
      return;
    }
  
    axios
      .post(API_URL + "/v2/auth/change-password", {
        resetToken: code.value,
        password: password.value
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
    <>
      <div className="flex text-center align-middle justify-center">
        <form onSubmit={handleSubmit}>
          <InputOTP
            maxLength={8}
            pattern={REGEXP_ASGARD_SECURE_CODE}
            disabled={code.provided}
            value={code.value}
            onChange={(x) => setCode({ provided: false, value: x })}
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

          <div className="flex w-full flex-col mt">
        <Button type="submit" variant={"primaryOutline"}>
            Change password
          </Button>
          </div>
        </form>
      </div>
      <p className="text-salmon pt-5 text-center">{errorMessage}</p>
    </>
  );
}
