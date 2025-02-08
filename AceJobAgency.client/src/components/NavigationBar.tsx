import {
  Button,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import { useNavigate } from "react-router-dom";

export default function NavigationBar() {
  const navigate = useNavigate();

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
      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Button
            onPress={() => {
              navigate("/login");
            }}
            variant="light"
          >
            Login
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button
            onPress={() => {
              navigate("/signup");
            }}
            variant="bordered"
          >
            Sign Up
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
