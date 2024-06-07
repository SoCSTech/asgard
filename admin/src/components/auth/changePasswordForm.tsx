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

  const handleLogin = (event: React.FormEvent<HTMLFormElement>): void => {
    // Prevent page reload
    event.preventDefault();
    const { username, password } = document.forms[0];
    const redirect = queryParameters.get("redirect");

    axios
      .post(API_URL + "/v2/auth/login", {
        username: username.value,
        password: password.value,
      })
      .then(function (response) {
        console.log(response);
        setErrorMessage("");
        setJwtCookie(response.data.TOKEN);
        window.location.href = redirect || "/";
      })
      .catch(function (error) {
        console.log(error);
        setErrorMessage(error.response.data.message);
      });
  };

  return (
    <div className="flex text-center align-middle justify-center">
      <form onSubmit={handleLogin}>
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
          name="new-password"
          id="new-password"
          className="mt-5"
        />
        <Input
          type="password"
          placeholder="Confirm new password"
          autoComplete="new-password"
          name="confirm-password"
          id="confirm-password"
        />

        <Button type="submit" variant={"secondary"} className="mt-5">
          Change password
        </Button>
      </form>

      <p className="text-salmon pt-5 text-center">{errorMessage}</p>
    </div>
  );
}
