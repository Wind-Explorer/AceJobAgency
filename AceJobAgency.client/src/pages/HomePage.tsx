import {
  Button,
  Card,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { useState } from "react";
import LoginView from "../components/LoginView";
import SignupView from "../components/SignupView";

export default function HomePage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isSignup, setIsSignup] = useState(false);
  const [emailValue, setEmailValue] = useState("");

  return (
    <div className="absolute inset-0 w-full h-full flex flex-col justify-center bg-indigo-500/10 dark:bg-indigo-500/20">
      <div className="relative m-auto w-max h-max flex flex-col gap-10 justify-center text-center *:mx-auto">
        <div className="flex flex-col gap-6 w-full text-wrap">
          <p className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold">
            Where the best employees get
            <br />
            matched with the best employers.
          </p>
          <p className="text-xl">
            Join the world’s most widely adopted job search platform.
          </p>
        </div>
        <div>
          <Card className="flex flex-row gap-2 p-2">
            <Input
              placeholder="Enter your email"
              size="lg"
              value={emailValue}
              onValueChange={setEmailValue}
            />
            <Button
              color="primary"
              size="lg"
              onPress={() => {
                setIsSignup(true);
                onOpen();
              }}
            >
              Sign up
            </Button>
          </Card>
        </div>
      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader />
              <ModalBody>
                {isSignup ? (
                  <SignupView
                    onLogin={() => {
                      setIsSignup(false);
                    }}
                    email={emailValue}
                  />
                ) : (
                  <LoginView
                    onSignup={() => {
                      setIsSignup(true);
                    }}
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
