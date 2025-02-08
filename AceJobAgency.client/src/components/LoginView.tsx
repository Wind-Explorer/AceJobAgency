import { Input, Checkbox, Button, Link } from "@heroui/react";
import { IconMail, IconLock } from "@tabler/icons-react";

export default function LoginView({ onSignup }: { onSignup: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col">
        <p className="text-3xl">Welcome back!</p>
        <p className="text-md opacity-50">
          Let us know who you are, and we will let you in.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Input endContent={<IconMail />} label="Email" />
        <Input endContent={<IconLock />} label="Password" type="password" />
      </div>
      <div className="flex py-2 px-1 justify-between">
        <Checkbox
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
        <Button color="primary" className="w-full">
          Login
        </Button>
        <div className="flex flex-row gap-2 w-full justify-center *:my-auto">
          <p className="text-sm">Don't have an account?</p>
          <Link
            color="primary"
            onPress={() => {
              onSignup();
            }}
            className="text-sm"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
