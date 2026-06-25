// Detects social in-app browsers (Instagram/Facebook etc.). These break OAuth
// and magic links — which is why this app uses email OTP. When detected, prompt
// the user to open in their default browser.
export function isInAppBrowser(
  ua: string = typeof navigator !== "undefined" ? navigator.userAgent : ""
): boolean {
  return /FBAN|FBAV|FB_IAB|Instagram|Line\/|Twitter|WhatsApp|Snapchat/i.test(ua);
}
