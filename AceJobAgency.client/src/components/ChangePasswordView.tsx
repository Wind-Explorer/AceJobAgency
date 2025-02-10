import { useState } from "react";
import { Button, Divider, Input } from "@heroui/react";
import { toast } from "react-toastify";
import http from "../http";
import { validatePassword } from "./SignupView";

export default function ChangePasswordView({
  onClose,
}: {
  onClose: () => void;
}) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast.error("New password and confirm new password do not match.");
      return;
    }

    if (!validatePassword(newPassword)) {
      toast.error(
        "Password must be at least 12 characters long and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    const changePasswordRequest = {
      currentPassword: oldPassword,
      newPassword: newPassword,
    };

    try {
      const response = await http.put(
        "/User/change-password",
        changePasswordRequest
      );
      toast.success(response.data);
      onClose();
    } catch (error) {
      toast.error(
        (error as any).response?.data ||
          "Something went wrong! Please try again."
      );
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <p className="text-xl">Change password</p>
      <Divider />
      <div className="flex flex-col gap-2">
        <Input
          label="Old password"
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <div className="w-full h-4"></div>
        <Input
          label="New password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          label="Confirm new password"
          type="password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
        />
      </div>
      <Button onClick={handleChangePassword}>Save</Button>
    </div>
  );
}
