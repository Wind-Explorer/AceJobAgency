import { Input, Checkbox, Button, Link } from "@heroui/react";
import { IconMail, IconLock } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "react-toastify";
import http, { login } from "../http";

export default function LoginView({ onSignup }: { onSignup: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const validateFields = () => {
    if (!email || !password) {
      toast.error("Both email and password are required.");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateFields()) return;

    const loginRequest = {
      email,
      password,
    };

    try {
      const response = await http.post("/User/login", loginRequest);

      if (response.status === 401) {
        throw new Error("Invalid email or password.");
      }

      const { token } = response.data;
      login(token);
    } catch (error) {
      toast.error(
        (error as any).response?.data ||
          "Something went wrong! Please try again."
      );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col">
        <p className="text-3xl">Welcome back!</p>
        <p className="text-md opacity-50">
          Let us know who you are, and we will let you in.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Input
          endContent={<IconMail />}
          label="Email"
          type="email"
          value={email}
          onValueChange={setEmail}
        />
        <Input
          endContent={<IconLock />}
          label="Password"
          type="password"
          value={password}
          onValueChange={setPassword}
        />
      </div>
      <div className="flex py-2 px-1 justify-between">
        <Checkbox
          isDisabled
          classNames={{
            label: "text-small",
          }}
        >
          Remember me
        </Checkbox>
        <Link color="primary" href="#" size="sm">
          Forgot password?
        </Link>
      </div>
      <div className="flex flex-col gap-4 w-full">
        <Button color="primary" className="w-full" onPress={handleLogin}>
          Login
        </Button>
        <div className="flex flex-row gap-2 w-full justify-center *:my-auto">
          <p className="text-sm">Don't have an account?</p>
          <Link color="primary" onPress={onSignup} className="text-sm">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
