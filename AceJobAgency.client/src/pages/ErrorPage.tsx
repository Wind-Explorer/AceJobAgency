import { Button, Card } from "@heroui/react";
import { useNavigate } from "react-router-dom";

export default function ErrorPage() {
  const navigate = useNavigate();
  return (
    <div className="absolute inset-0 w-full h-full flex flex-col justify-center">
      <div className="relative m-auto w-max h-max flex flex-col gap-8 justify-center text-center *:mx-auto">
        <div className="flex flex-col gap-2">
          <p className="opacity-70 text-lg">Error 404 - Not Found</p>
          <p className="text-4xl font-bold">Something's not right!</p>
          <p className="text-xl">What you're looking for is not here.</p>
        </div>
        <Card className="flex flex-row gap-4 justify-center w-max p-4">
          <Button
            variant="light"
            onPress={() => {
              navigate(-1);
            }}
          >
            Go back
          </Button>
          <Button
            color="primary"
            onPress={() => {
              navigate("/");
            }}
          >
            Go home
          </Button>
        </Card>
      </div>
    </div>
  );
}
