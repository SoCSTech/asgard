import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { API_URL } from "@/constants";
import { setJwtCookie } from "@/lib/cookie";

export default function LoginForm() {
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");

  const handleForm = (
    event: React.FormEvent<HTMLFormElement>
  ): void => {
    // Prevent page reload
    event.preventDefault();
    const { username, password } = document.forms[0];
    const queryParameters = new URLSearchParams(window.location.search);
    const redirect = queryParameters.get("redirect");

    axios
      .post(API_URL + "/v2/auth/forgot-password", {
        username: username.value,
      })
      .then(function (response) {
        setErrorMessage("");
        setSuccessMessage(response.data.message);
      })
      .catch(function (error) {
        console.log(error);
        setErrorMessage(error.response.data.message);
        setSuccessMessage("");
      });
  };

  return (
    <div>
      <form onSubmit={handleForm}>
        <Input
          type="text"
          placeholder="Username"
          autoComplete="username"
          name="username"
        />
        <Button type="submit" variant={"secondary"}>
          Send recovery email
        </Button>
      </form>
      <p className="text-salmon pt-5 text-center">{errorMessage}</p>
      <p className="text-white pt-5 text-center">{successMessage}</p>
    </div>
  );
}
