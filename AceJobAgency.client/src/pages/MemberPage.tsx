import { useEffect, useState } from "react";
import http, { getAccessToken, logout } from "../http";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "../models/user-profile";
import { Button, Card, Divider, Input } from "@heroui/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MemberPage() {
  const accessToken = getAccessToken();
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!accessToken) {
      window.location.reload();
    }
    http.get("/User/profile").then((response) => {
      if (response.status !== 200) {
        navigate("/error");
      }
      setUserProfile(response.data);
    });
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full flex flex-col justify-center items-center bg-indigo-500/10 dark:bg-indigo-500/20">
      {userProfile && (
        <Card className="w-max p-6 flex flex-col gap-4">
          <div>
            <p className="text-3xl font-bold">
              {userProfile.firstName} {userProfile.lastName}
            </p>
            <p className="opacity-70">Ace Job Agency Member (Tier 3)</p>
          </div>
          <Divider />
          <div className="flex flex-row gap-4">
            <div className="flex flex-col gap-4">
              <InfoCell label="Email" value={userProfile.email} />
              <InfoCell
                label="NRIC"
                value={userProfile.nationalRegistrationIdentityCardNumber}
              />
              <InfoCell
                label="Date of Birth"
                value={new Date(userProfile.dateOfBirth).toDateString()}
              />
              <div className="flex flex-col gap-2">
                <p>Resume</p>
                <Button
                  variant="flat"
                  isDisabled={userProfile.resumeName.length <= 0}
                >
                  Download
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p>Who am I</p>
              <Card className="p-4 bg-neutral-500/20 h-full min-w-96">
                {userProfile.whoAmI.length > 0 ? (
                  <Markdown
                    className="prose dark:prose-invert prose-neutral overflow-auto w-full h-full"
                    remarkPlugins={[remarkGfm]}
                  >
                    {userProfile.whoAmI}
                  </Markdown>
                ) : (
                  "You have not wrote anything about yourself."
                )}
              </Card>
            </div>
          </div>
          <Divider />
          <div className="flex flex-row justify-between w-full">
            <Button variant="light" color="danger" onPress={logout}>
              Log out
            </Button>
            <Button
              color="primary"
              onPress={() => {
                navigate("edit");
              }}
            >
              Edit profile
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p>{label}</p>
      <Input value={value} readOnly />
    </div>
  );
}
