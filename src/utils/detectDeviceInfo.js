export const detectDeviceInfo = userAgent => {
  userAgent = userAgent.toLowerCase();

  // Device : Mobile | Tablet | Desktop
  let device = "Desktop";
  if (/iphone|android|mobile/.test(userAgent)) device = "mobile";
  else if (/tablet|ipad/.test(userAgent)) device = "tablet";

  // Browser | chrome | firefox | safari | edge
  let browser = "Unknown";
  if (userAgent.includes("chrome")) browser = "Chrome";
  else if (userAgent.includes("firefox")) browser = "Firefox";
  else if (userAgent.includes("safari")) browser = "Safari";
  else if (userAgent.includes("edge")) browser = "Edge";

  // OS : windows | ios | mac | android | linux
  let os = "Unknown";
  if (userAgent.includes("windows")) os = "Windows";
  else if (userAgent.includes("mac")) os = "MacOS";
  else if (userAgent.includes("ios")) os = "iOS";
  else if (userAgent.includes("android")) os = "Android";
  else if (userAgent.includes("linux")) os = "Linux";

  return { device, browser, os };
};
