import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface SessionTimeoutProps {
  timeout: number;
  onLogout: () => void;
}

const SessionTimeout: React.FC<SessionTimeoutProps> = ({
  timeout,
  onLogout,
}) => {
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
  const [notified, setNotified] = useState<boolean>(false);

  const resetTimer = useCallback(() => {
    setLastActivityTime(Date.now());
    setNotified(false);
  }, []);

  useEffect(() => {
    const events = ["click", "mousemove", "keypress", "scroll", "touchstart"];
    const eventHandler = () => resetTimer();

    events.forEach((event) => window.addEventListener(event, eventHandler));

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, eventHandler)
      );
    };
  }, [resetTimer]);

  useEffect(() => {
    const interval = setInterval(() => {
      const timeElapsed = Date.now() - lastActivityTime;

      if (timeElapsed >= timeout) {
        onLogout();
      } else if (timeElapsed >= timeout - 30000 && !notified) {
        toast.warn("30 more seconds before automatic logout from idling.");
        setNotified(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastActivityTime, timeout, onLogout, notified]);

  return <></>;
};

export default SessionTimeout;
