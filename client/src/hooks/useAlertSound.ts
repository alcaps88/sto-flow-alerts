import { useRef, useCallback } from "react";

/**
 * Plays a subtle notification sound when new alerts arrive.
 * Uses the Web Audio API to generate a short tone.
 */
export function useAlertSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playSound = useCallback((type: "inflow" | "outflow") => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Inflow = higher pitch (positive), Outflow = lower pitch (warning)
      oscillator.frequency.value = type === "inflow" ? 880 : 440;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch {
      // Audio not available, silently fail
    }
  }, []);

  return { playSound };
}
