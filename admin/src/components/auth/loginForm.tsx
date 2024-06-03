import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export default function LoginForm() {
  return (
    <div>
      <form>
        <Input type="text" placeholder="Username" autoComplete="username" />
        <Input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
        />
        <Button type="submit" variant={"secondary"}>
          Login
        </Button>
      </form>
      <p className="text-white pt-5 text-center">
        <a href="#">Forgot password?</a>
      </p>
    </div>
  );
}
