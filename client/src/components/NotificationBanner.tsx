/*
 * Design: Obsidian Flow — Dark Luxury Financial Dashboard
 * NotificationBanner: Prompts user to enable browser notifications for new alerts
 */
import { Bell, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function NotificationBanner() {
  const [show, setShow] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
      if (Notification.permission === "default") {
        setShow(true);
      }
    }
  }, []);

  const requestPermission = async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "default") {
        setShow(false);
      }
    }
  };

  if (!show || permission !== "default") return null;

  return (
    <div className="mb-4 p-3 rounded-xl bg-[oklch(0.79_0.15_175/0.08)] border border-[oklch(0.79_0.15_175/0.2)] flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Bell className="w-4 h-4 text-[oklch(0.79_0.15_175)] shrink-0" />
        <span className="text-xs text-foreground">
          Enable browser notifications to get alerted when new large transfers are detected.
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={requestPermission}
          className="px-3 py-1 rounded-md bg-[oklch(0.79_0.15_175)] text-[oklch(0.13_0.01_270)] text-xs font-medium hover:opacity-90 transition-opacity"
        >
          Enable
        </button>
        <button
          onClick={() => setShow(false)}
          className="p-1 rounded hover:bg-secondary transition-colors"
        >
          <X className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
