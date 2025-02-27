import { Input, Button, Link, Select, SelectItem } from "@heroui/react";
import { IconMail, IconLock } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "react-toastify";
import http, { login } from "../http";
import PasswordComplexityIndicator from "./PasswordComplexityIndicator";

export const validatePassword = (password: string): boolean => {
  const passwordComplexityRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d@$!%*?&\\]{12,}$/;
  return passwordComplexityRegex.test(password);
};

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
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupEnabled, setSignupEnabled] = useState(true);

  const validateFields = () => {
    if (
      !firstName ||
      !lastName ||
      !emailValue ||
      !nric ||
      !dateOfBirth ||
      !password ||
      !confirmPassword
    ) {
      toast.error("All fields are required.");
      return false;
    }
    const nricRegex = /^[A-Za-z][0-9]{7}[A-Za-z]$/;
    if (!nricRegex.test(nric)) {
      toast.error("Please enter a valid NRIC.");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }
    if (!validatePassword(password)) {
      toast.error(
        "Password must be at least 12 characters long and include uppercase, lowercase, number, and special character."
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;

    const user = {
      id: "",
      firstName,
      lastName,
      gender: Number(gender),
      nationalRegistrationIdentityCardNumber: nric.toUpperCase(),
      email: emailValue.toLowerCase(),
      password,
      dateOfBirth: new Date(dateOfBirth),
      resumeName: "",
      whoAmI: "",
    };

    try {
      const response = await http.post("/User/register", user);

      if (response.status !== 200) {
        throw new Error("Failed to sign up");
      }
      setSignupEnabled(false);
      toast.success("Welcome to Ace Job, " + firstName + "!", {
        onClose: () => {
          http
            .post("/User/login", { email: emailValue, password: password })
            .then((response) => {
              if (response.status === 200) {
                login(response.data.token);
              } else {
                toast.error("Failed to login");
              }
            });
        },
      });
    } catch (error) {
      toast.error((error as any).response?.data || "Error during signup");
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
            size="sm"
            label="First name"
            value={firstName}
            onValueChange={setFirstName}
          />
          <Input
            size="sm"
            label="Last name"
            value={lastName}
            onValueChange={setLastName}
          />
        </div>
        <Input
          size="sm"
          endContent={<IconMail />}
          label="Email"
          type="email"
          value={emailValue}
          onValueChange={setEmailValue}
        />
        <Input size="sm" label="NRIC" value={nric} onValueChange={setNric} />
        <div className="flex flex-row gap-2">
          <Select
            size="sm"
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
            className="rounded-lg px-4 transition-colors dark:bg-neutral-800 dark:hover:bg-neutral-700"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </div>
        <Input
          size="sm"
          endContent={<IconLock />}
          label="Password"
          type="password"
          value={password}
          onValueChange={setPassword}
        />
        <Input
          size="sm"
          endContent={<IconLock />}
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onValueChange={setConfirmPassword}
        />
        <PasswordComplexityIndicator password={password} />
      </div>
      <div className="flex flex-col gap-4 w-full">
        <Button
          color="primary"
          className="w-full"
          onPress={handleSubmit}
          isDisabled={!signupEnabled}
        >
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
