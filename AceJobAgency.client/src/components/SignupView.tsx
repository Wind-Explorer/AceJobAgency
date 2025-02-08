import { Input, Button, Link, Select, SelectItem } from "@heroui/react";
import { IconMail, IconLock } from "@tabler/icons-react";
import { useState } from "react";
import http from "../http";
import { useNavigate } from "react-router-dom";

export default function SignupView({
  onLogin,
  email = "",
}: {
  onLogin: () => void;
  email: string;
}) {
  const [emailValue, setEmailValue] = useState(email);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nric, setNric] = useState("");
  const [gender, setGender] = useState("0");
  const dateOfBirthInput = document.getElementById("dateOfBirthInput");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async () => {
    const user = {
      id: "",
      firstName,
      lastName,
      gender: Number(gender),
      nationalRegistrationIdentityCardNumber: nric,
      email: emailValue,
      password,
      dateOfBirth: new Date((dateOfBirthInput as any).value),
      resumeName: "",
      whoAmI: "",
    };

    try {
      const response = await http.post("/User/register", user);

      if (response.status != 200) {
        throw new Error("Failed to sign up");
      }

      // Handle successful signup (e.g., show a message, redirect, etc.)
      console.log("User signed up successfully");
    } catch (error) {
      console.error("Error during signup:", error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col">
        <p className="text-3xl">Welcome!</p>
        <p className="text-md opacity-50">Become a membership today!</p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <Input
            label="First name"
            value={firstName}
            onValueChange={setFirstName}
          />
          <Input
            label="Last name"
            value={lastName}
            onValueChange={setLastName}
          />
        </div>
        <Input
          endContent={<IconMail />}
          label="Email"
          type="email"
          value={emailValue}
          onValueChange={setEmailValue}
        />
        <Input label="NRIC" value={nric} onValueChange={setNric} />
        <div className="flex flex-row gap-2">
          <Select
            label="Gender"
            selectedKeys={[gender]}
            onChange={(e) => {
              setGender(e.target.value);
            }}
          >
            <SelectItem key={"0"}>Male</SelectItem>
            <SelectItem key={"1"}>Female</SelectItem>
          </Select>
          <input
            type="date"
            className="rounded-xl px-4 transition-colors dark:bg-neutral-800 dark:hover:bg-neutral-700"
            id="dateOfBirthInput"
          />
        </div>
        <Input
          endContent={<IconLock />}
          label="Password"
          type="password"
          value={password}
          onValueChange={setPassword}
        />
        <Input
          endContent={<IconLock />}
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onValueChange={setConfirmPassword}
        />
      </div>
      <div className="flex flex-col gap-4 w-full">
        <Button color="primary" className="w-full" onPress={handleSubmit}>
          Sign up
        </Button>
        <div className="flex flex-row gap-2 w-full justify-center *:my-auto">
          <p className="text-sm">Already have an account?</p>
          <Link color="primary" onPress={onLogin} className="text-sm">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
