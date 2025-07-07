import UAParser from "ua-parser-js";
import { Request, Response, NextFunction } from "express";
import logger from "./logger";

export class Device {
  declare browser: string;
  declare os: string;
  declare deviceType: string;
  declare vendor: string;
  declare model: string;
}

export async function GetDevice(
  user_agent: string | undefined
): Promise<Device> {
  let device = new Device();

  const parser = (UAParser as any)(user_agent);

  device.browser = parser.browser.name || "";
  device.os = parser.os.name || "";
  device.deviceType = parser.device.type || "desktop"; // 如果沒有特別指定，默認為 desktop
  device.vendor = parser.device.vendor || "";
  device.model = parser.device.model || "";

  return device;
}

export function GetToken(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    logger.info("Found token in auth");
    const token = authHeader.split(" ")[1];

    return token;
  }

  const cookies = req.cookies;
  if (cookies && cookies.token) {
    logger.info("Found token in cookies");

    return cookies.token;
  }

  return null;
}
