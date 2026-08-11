import { Resend } from "resend";

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const FROM_EMAIL = "ToyVerse <onboarding@resend.dev>";
export const NOTIFICATION_EMAIL = "4kmoviepointoo@gmail.com";
