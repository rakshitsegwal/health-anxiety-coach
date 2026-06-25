import "server-only";
import Razorpay from "razorpay";

// Lazy singleton — the Razorpay constructor THROWS if key_id is missing, so we
// defer creating it until a request actually needs it. Without this, importing a
// payment route during `next build`/dev crashes when keys aren't configured.
let _rzp: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!_rzp) {
    _rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return _rzp;
}
