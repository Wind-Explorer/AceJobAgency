import {
  Button,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  useDisclosure,
} from "@heroui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignupView from "./SignupView";
import LoginView from "./LoginView";
import { getAccessToken } from "../http";

export default function NavigationBar() {
  const navigate = useNavigate();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isSignup, setIsSignup] = useState(false);
  const accessToken = getAccessToken();

  return (
    <Navbar className="border-b-[1px] border-neutral-500/25">
      <NavbarBrand>
        <Link
          color="foreground"
          onPress={() => {
            navigate("/");
          }}
        >
          <img
            src="/aja.svg"
            alt="aja logo"
            width={100}
            className="dark:invert"
          />
        </Link>
      </NavbarBrand>
      {!accessToken && (
        <NavbarContent justify="end">
          <NavbarItem className="hidden lg:flex">
            <Button
              onPress={() => {
                setIsSignup(false);
                onOpen();
              }}
              variant="light"
            >
              Login
            </Button>
          </NavbarItem>
          <NavbarItem>
            <Button
              onPress={() => {
                setIsSignup(true);
                onOpen();
              }}
              variant="bordered"
            >
              Sign Up
            </Button>
          </NavbarItem>
        </NavbarContent>
      )}
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
                    email=""
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
    </Navbar>
  );
}
