import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { API_URL } from "@/constants";

export default function ForgotPasswordForm() {
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");

  const handleForm = (event: React.FormEvent<HTMLFormElement>): void => {
    // Prevent page reload
    event.preventDefault();
    const { username } = document.forms[0];

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
        <div className="flex w-full flex-col">
          <Button type="submit" variant={"primaryOutline"}>
            Send recovery email
          </Button>
        </div>
      </form>
      <p className="text-salmon pt-5 text-center">{errorMessage}</p>
      <p className="text-white pt-5 text-center">{successMessage}</p>
    </div>
  );
}
