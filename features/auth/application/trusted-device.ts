const TRUSTED_DEVICE_STORAGE_KEY = "trusted_device_auth_v1";
const TRUSTED_DEVICE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

type TrustedDeviceMap = Record<string, number>;

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function readTrustedDevices(): TrustedDeviceMap {
  if (!canUseStorage()) return {};

  try {
    const raw = window.localStorage.getItem(TRUSTED_DEVICE_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as TrustedDeviceMap;
    if (!parsed || typeof parsed !== "object") return {};

    return parsed;
  } catch {
    return {};
  }
}

function writeTrustedDevices(map: TrustedDeviceMap) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(TRUSTED_DEVICE_STORAGE_KEY, JSON.stringify(map));
}

export function markTrustedDevice(email: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return;

  const trusted = readTrustedDevices();
  trusted[normalizedEmail] = Date.now();
  writeTrustedDevices(trusted);
}

export function isTrustedDevice(email: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return false;

  const trusted = readTrustedDevices();
  const lastSeen = trusted[normalizedEmail];
  if (!lastSeen) return false;

  const isStillValid = Date.now() - lastSeen <= TRUSTED_DEVICE_MAX_AGE_MS;

  if (!isStillValid) {
    delete trusted[normalizedEmail];
    writeTrustedDevices(trusted);
  }

  return isStillValid;
}
