import { Button, Card } from "@heroui/react";
import { Editor } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import http, { getAccessToken } from "../http";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "../models/user-profile";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "react-toastify";

export default function EditProfilePage() {
  const [code, setCode] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      navigate(-1);
    }
    http.get("/User/profile").then((response) => {
      if (response.status !== 200) {
        navigate("/error");
      }
      setCode((response.data as UserProfile).whoAmI);
      setUserProfile(response.data);
    });
  }, []);

  const handleSaveChanges = () => {
    var user = userProfile;
    if (!user) {
      return;
    }
    user.whoAmI = code;
    user.password = "0000000000000000";
    http
      .put("/User/profile", user)
      .then((response) => {
        if (response.status === 200) {
          navigate(-1);
        }
      })
      .catch((error) => {
        toast.error("Failed to save changes: " + error.message);
      });
  };

  return (
    <div className="absolute w-full flex flex-col">
      <div className="w-full h-[80vh] flex flex-row justify-evenly gap-2 p-2">
        <Card className="h-full w-1/2">
          <Editor
            className="h-full"
            defaultLanguage="markdown"
            theme="vs-dark"
            value={code}
            onChange={(value) => {
              if (!value) {
                return;
              }
              setCode(value);
            }}
          />
        </Card>
        <Card className="h-full w-1/2 p-4">
          <Markdown
            className="prose dark:prose-invert prose-neutral overflow-auto w-full h-full"
            remarkPlugins={[remarkGfm]}
          >
            {code}
          </Markdown>
        </Card>
      </div>
      <div className="flex flex-row w-full justify-end">
        <Button color="primary" onPress={handleSaveChanges}>
          Save changes
        </Button>
      </div>
    </div>
  );
}
