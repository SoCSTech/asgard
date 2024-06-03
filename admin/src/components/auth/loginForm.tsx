import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export default function LoginForm() {
  return (
    <div>
      <Input type="text" placeholder="Username" />
      <Input type="password" placeholder="Password" />
      <Button>Login</Button>
    </div>
  );
}
