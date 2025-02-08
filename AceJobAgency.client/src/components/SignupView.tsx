import {
  Input,
  Button,
  Link,
  Select,
  SelectItem,
  DatePicker,
} from "@heroui/react";
import { IconMail, IconLock } from "@tabler/icons-react";
import { useState } from "react";

export default function SignupView({
  onLogin,
  email = "",
}: {
  onLogin: () => void;
  email: string;
}) {
  const [emailValue, setEmailValue] = useState(email);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col">
        <p className="text-3xl">Welcome!</p>
        <p className="text-md opacity-50">Become a membership today!</p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <Input label="First name" />
          <Input label="Last name" />
        </div>
        <Input
          endContent={<IconMail />}
          label="Email"
          type="email"
          value={emailValue}
          onValueChange={setEmailValue}
        />
        <Input label="NRIC" />
        <div className="flex flex-row gap-2">
          <Select label="Gender">
            <SelectItem>Male</SelectItem>
            <SelectItem>Female</SelectItem>
          </Select>
          <DatePicker label="Date of birth" />
        </div>
        <Input endContent={<IconLock />} label="Password" type="password" />
        <Input
          endContent={<IconLock />}
          label="Confirm password"
          type="password"
        />
      </div>
      <div className="flex flex-col gap-4 w-full">
        <Button color="primary" className="w-full">
          Sign up
        </Button>
        <div className="flex flex-row gap-2 w-full justify-center *:my-auto">
          <p className="text-sm">Already have an account?</p>
          <Link
            color="primary"
            onPress={() => {
              onLogin();
            }}
            className="text-sm"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
