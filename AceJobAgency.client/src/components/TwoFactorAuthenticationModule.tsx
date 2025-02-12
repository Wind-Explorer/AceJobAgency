import { useEffect, useState } from "react";
import http from "../http";
import { toast } from "react-toastify";
import { InputOtp } from "@heroui/react";

export default function TwoFactorsAuthenticationModule({
  email,
  onTwoFactorSuccess,
}: {
  email: string;
  onTwoFactorSuccess: () => void;
}) {
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [twoFactorVerifying, setTwoFactorVerifying] = useState(false);
  useEffect(() => {
    if (!(twoFactorToken.length == 6 && !twoFactorVerifying)) {
      return;
    }

    setTwoFactorVerifying(true);
    http
      .post("/User/verify-2fa", {
        email: email,
        token: twoFactorToken,
      })
      .then(() => {
        onTwoFactorSuccess();
      })
      .catch((error) => {
        toast.error(error);
      })
      .finally(() => {
        setTwoFactorToken("");
        setTwoFactorVerifying(false);
      });
  }, [twoFactorToken]);
  return (
    <div className="text-center flex flex-col gap-4 w-full *:mx-auto">
      <InputOtp
        length={6}
        value={twoFactorToken}
        onValueChange={setTwoFactorToken}
        size="lg"
        isDisabled={twoFactorVerifying}
      />
      <p className="text-sm opacity-50">
        Please enter the 6 digits passcode from your authenticator app.
      </p>
    </div>
  );
}
