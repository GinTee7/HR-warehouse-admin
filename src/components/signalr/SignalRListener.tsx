"use client";

import { connection } from "@/lib/signalr-client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AccountDeactivatedModal } from "../account-deactivated-modal";

let isConnected = false;

export function SignalRListener() {
  const navigate = useNavigate();
  const [showDeactivatedModal, setShowDeactivatedModal] = useState(false);

  const handleAccountDeactivated = () => {
    // Clear session storage first
    localStorage.clear();
    // Set modal to false to close it
    setShowDeactivatedModal(false);
    // Then navigate to login
    navigate("/login");
  };

  useEffect(() => {
    if (!isConnected && connection.state === "Disconnected") {
      isConnected = true;
      connection
        .start()
        .then(() => console.log("✅ Connected to SignalR"))
        .catch((err) => {
          isConnected = false;
          console.error("❌ Connect fail:", err);
        });
    }

    connection.on("ReceiveNotification", (noti) => {
      console.log(noti);

      let navigatePath = "/";

      if (noti.title === "Kho") {
        navigatePath = "/warehouse/view-export";
      } else if (noti.title === "Kho Tổng") {
        navigatePath = "/planner/dashboard";
      }

      toast(noti.message, {
        action: {
          label: "Xem ngay",
          onClick: () => navigate(navigatePath),
        },
        className: "text-lg px-6 py-5 min-w-[380px]",
        style: {
          fontSize: "18px",
          borderRadius: "12px",
          minWidth: "380px",
        },
        duration: 6000,
      });
    });

    connection.on("UnActive", (noti) => {
      console.log(noti);
      setShowDeactivatedModal(true);
    });

    return () => {
      connection.off("ReceiveNotification");
      connection.off("UnActive");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AccountDeactivatedModal
      isOpen={showDeactivatedModal}
      onConfirm={handleAccountDeactivated}
    />
  );
}

export default SignalRListener;
