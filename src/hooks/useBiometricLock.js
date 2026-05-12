import { useState, useEffect, useCallback, useRef } from "react";

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const STORAGE_KEY = "bio_lock_registered";

export function useBiometricLock() {
  const [isSupported, setIsSupported] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const supported =
      window.PublicKeyCredential &&
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function";
    if (!supported) return;

    window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then((available) => {
      setIsSupported(available);
      const registered = localStorage.getItem(STORAGE_KEY) === "true";
      setIsRegistered(registered);
    });
  }, []);

  const resetTimer = useCallback(() => {
    if (!isRegistered) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsLocked(true), INACTIVITY_TIMEOUT);
  }, [isRegistered]);

  useEffect(() => {
    if (!isRegistered) return;
    const events = ["mousemove", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      clearTimeout(timerRef.current);
    };
  }, [isRegistered, resetTimer]);

  const register = useCallback(async () => {
    setError(null);
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userId = crypto.getRandomValues(new Uint8Array(16));

      await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "AffinitySolution Portal", id: window.location.hostname },
          user: { id: userId, name: "portal-user", displayName: "Portal User" },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            requireResidentKey: false,
          },
          timeout: 60000,
        },
      });

      localStorage.setItem(STORAGE_KEY, "true");
      setIsRegistered(true);
    } catch (err) {
      if (err.name !== "NotAllowedError") {
        setError("Biometric registration failed. Please try again.");
      }
    }
  }, []);

  const unlock = useCallback(async () => {
    setUnlocking(true);
    setError(null);
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      await navigator.credentials.get({
        publicKey: {
          challenge,
          rpId: window.location.hostname,
          userVerification: "required",
          timeout: 60000,
        },
      });
      setIsLocked(false);
    } catch (err) {
      if (err.name !== "NotAllowedError") {
        setError("Biometric verification failed.");
      }
    } finally {
      setUnlocking(false);
    }
  }, []);

  const disable = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsRegistered(false);
    setIsLocked(false);
    clearTimeout(timerRef.current);
  }, []);

  return { isSupported, isLocked, isRegistered, unlocking, error, register, unlock, disable };
}