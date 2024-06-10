import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { API_URL } from "@/constants";
import { setJwtCookie } from "@/lib/cookie";

export default function LoginForm() {
  
    React.useEffect(() => {
        setJwtCookie("");
    }, []);

  return (
    <div>
      <p className="text-white pt-5 text-center">You have now been logged out from asgard.</p>
    </div>
  );
}
