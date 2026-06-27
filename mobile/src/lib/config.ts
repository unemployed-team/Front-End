export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://54.116.153.193:8080";

export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === "true";

export const ENABLE_DEV_LOGIN =
  process.env.EXPO_PUBLIC_ENABLE_DEV_LOGIN === "true";
