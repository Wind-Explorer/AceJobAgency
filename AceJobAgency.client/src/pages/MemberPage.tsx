import { useEffect, useState } from "react";
import http, { getAccessToken, logout } from "../http";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "../models/user-profile";
import {
  Button,
  Card,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { IconDownload, IconEdit, IconUpload } from "@tabler/icons-react";
import { toast } from "react-toastify";
import ChangePasswordView from "../components/ChangePasswordView";
import Manage2FAView from "../components/Manage2FAView";

export default function MemberPage() {
  const accessToken = getAccessToken();
  const navigate = useNavigate();
  const {
    isOpen: changePasswordModalIsOpen,
    onOpen: changePasswordModalOnOpen,
    onOpenChange: changePasswordModalOnOpenChange,
  } = useDisclosure();

  const {
    isOpen: twoFactorAuthModalIsOpen,
    onOpen: twoFactorAuthModalOnOpen,
    onOpenChange: twoFactorAuthModalOnOpenChange,
  } = useDisclosure();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const getProfile = () => {
    http.get("/User/profile").then((response) => {
      if (response.status !== 200) {
        navigate("/error");
      }
      setUserProfile(response.data);
    });
  };

  useEffect(() => {
    if (!accessToken) {
      window.location.reload();
    }
    getProfile();
  }, []);

  const handleUploadResume = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf,.doc,.docx";
    fileInput.onchange = async () => {
      const file = fileInput.files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await http.post("/User/upload-resume", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (response.status === 200) {
            getProfile();
          } else {
            toast.error("Upload failed: " + response);
          }
        } catch (error) {
          toast.error("Error uploading file: " + error);
        }
      }
    };
    fileInput.click();
  };

  const handleDownloadResume = async () => {
    try {
      const response = await http.get("/User/resume", {
        responseType: "blob", // Ensure response is treated as a file
      });

      if (response.status === 200) {
        if (!userProfile) return;
        let fileName = userProfile.resumeName;

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error("Failed to download resume", response);
      }
    } catch (error) {
      console.error("Error downloading resume", error);
    }
  };

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
                <div className="w-full flex flex-col gap-2">
                  <Input
                    value={userProfile.resumeName}
                    readOnly
                    className="w-full"
                    placeholder="No resume uploaded"
                  />
                  <div className="w-72 flex flex-row gap-2 *:w-full">
                    <Button
                      startContent={<IconUpload size={18} />}
                      onPress={handleUploadResume}
                      variant="flat"
                    >
                      Upload
                    </Button>
                    <Button
                      variant="flat"
                      isDisabled={userProfile.resumeName.length <= 0}
                      startContent={<IconDownload size={18} />}
                      onPress={handleDownloadResume}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-row justify-between *:my-auto">
                <p>Who am I</p>
                <Button
                  variant="flat"
                  size="sm"
                  className="text-md"
                  startContent={<IconEdit size={18} />}
                  onPress={() => {
                    navigate("edit");
                  }}
                >
                  Edit bio
                </Button>
              </div>
              <Card className="bg-white dark:bg-black h-full max-h-[352px] min-w-96">
                {userProfile.whoAmI.length > 0 ? (
                  <Markdown
                    className="prose dark:prose-invert prose-neutral overflow-auto w-full h-full p-6"
                    remarkPlugins={[remarkGfm]}
                  >
                    {userProfile.whoAmI}
                  </Markdown>
                ) : (
                  <p className="p-6">
                    You have not wrote anything about yourself.
                  </p>
                )}
              </Card>
            </div>
          </div>
          <Divider />
          <div className="flex flex-row justify-between w-full">
            <Button variant="light" color="danger" onPress={logout}>
              Log out
            </Button>
            <div className="flex flex-row gap-2">
              <Button
                variant="light"
                color="primary"
                onPress={twoFactorAuthModalOnOpen}
              >
                Manage 2FA
              </Button>
              <Button
                variant="light"
                color="primary"
                onPress={changePasswordModalOnOpen}
              >
                Change password
              </Button>
            </div>
          </div>
        </Card>
      )}
      <Modal
        isOpen={changePasswordModalIsOpen}
        onOpenChange={changePasswordModalOnOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader />
              <ModalBody>
                <ChangePasswordView onClose={onClose} />
              </ModalBody>
              <ModalFooter />
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={twoFactorAuthModalIsOpen}
        onOpenChange={twoFactorAuthModalOnOpen}
      >
        <ModalContent>
          {(on2FAClose) => (
            <>
              <ModalHeader />
              <ModalBody>
                {userProfile && (
                  <Manage2FAView
                    onClose={on2FAClose}
                    userProfile={userProfile}
                  />
                )}
              </ModalBody>
              <ModalFooter />
            </>
          )}
        </ModalContent>
      </Modal>
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
