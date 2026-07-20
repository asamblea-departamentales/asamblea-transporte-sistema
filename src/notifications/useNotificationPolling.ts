import { useEffect, useRef } from "react";

type PollCallback = () => Promise<void>;

type PollingOptions = {
  poll: PollCallback;
  intervalMs: number;
  maxIntervalMs?: number;
};

export function useNotificationPolling({
  poll,
  intervalMs,
  maxIntervalMs = intervalMs * 8,
}: PollingOptions) {
  const pollRef = useRef(poll);
  pollRef.current = poll;

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let delay = intervalMs;

    const clearTimer = () => {
      if (timer) clearTimeout(timer);
      timer = undefined;
    };

    const schedule = (nextDelay: number) => {
      clearTimer();
      if (!cancelled && document.visibilityState === "visible" && navigator.onLine) {
        timer = setTimeout(run, nextDelay);
      }
    };

    const run = async () => {
      if (cancelled || document.visibilityState !== "visible" || !navigator.onLine) return;
      try {
        await pollRef.current();
        delay = intervalMs;
      } catch {
        delay = Math.min(delay * 2, maxIntervalMs);
      }
      schedule(delay);
    };

    const resume = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        void run();
      } else {
        clearTimer();
      }
    };

    void run();
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("online", resume);
    window.addEventListener("offline", clearTimer);

    return () => {
      cancelled = true;
      clearTimer();
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("online", resume);
      window.removeEventListener("offline", clearTimer);
    };
  }, [intervalMs, maxIntervalMs]);
}
