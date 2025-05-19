import UAParser from "ua-parser-js";

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
