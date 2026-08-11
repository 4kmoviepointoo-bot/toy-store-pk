import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "ToyVerse <onboarding@resend.dev>";
const NOTIFICATION_EMAIL = "4kmoviepointoo@gmail.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "asgah960@gmail.com";
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923037663472";

interface OrderNotificationData {
  orderId: string;
  customer: { name: string; phone: string; email: string | null };
  delivery: { address: string; city: string };
  items: Array<{ name: string; price: string; quantity: number }>;
  subtotal: number;
  shipping: number;
  couponCode: string | null;
  couponDiscount: number;
  total: number;
  paymentLabel: string;
}

function buildItemsRows(items: OrderNotificationData["items"]): string {
  return items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #184841;font-size:14px;color:#f7fafa;">${item.name}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #184841;font-size:14px;color:#f7fafa;text-align:center;">${item.quantity}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #184841;font-size:14px;color:#f7fafa;text-align:right;font-weight:600;">${item.price}</td>
      </tr>`
    )
    .join("");
}

function buildCustomerEmailHtml(order: OrderNotificationData): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0b2420;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:28px;">
      <h1 style="margin:0;font-size:26px;color:#1c7865;">🧸 ToyVerse Pakistan</h1>
      <p style="margin:6px 0 0;font-size:13px;color:#6b8f88;">Order Confirmation</p>
    </div>

    <div style="background:#0e2f2b;border-radius:16px;padding:28px;margin-bottom:16px;border:1px solid #184841;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;background:#1c7865;color:#fff;font-size:30px;width:52px;height:52px;line-height:52px;border-radius:50%;">&#10003;</div>
        <h2 style="margin:14px 0 6px;font-size:20px;color:#f7fafa;">Order Confirmed!</h2>
        <p style="margin:0;font-size:14px;color:#a0b4b0;">Order ID: <strong style="color:#1c7865;">${order.orderId}</strong></p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead>
          <tr style="background:#0b2420;">
            <th style="padding:12px 16px;text-align:left;font-size:12px;color:#6b8f88;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Item</th>
            <th style="padding:12px 16px;text-align:center;font-size:12px;color:#6b8f88;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
            <th style="padding:12px 16px;text-align:right;font-size:12px;color:#6b8f88;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${buildItemsRows(order.items)}
        </tbody>
      </table>

      <div style="border-top:1px solid #184841;padding-top:16px;">
        <div style="display:flex;justify-content:space-between;font-size:14px;color:#a0b4b0;margin-bottom:6px;">
          <span>Subtotal</span><span>Rs. ${order.subtotal.toLocaleString()}</span>
        </div>
        ${order.couponCode && order.couponDiscount > 0 ? `<div style="display:flex;justify-content:space-between;font-size:14px;color:#38b2ac;margin-bottom:6px;"><span>Discount (${order.couponCode})</span><span>- Rs. ${order.couponDiscount.toLocaleString()}</span></div>` : ""}
        <div style="display:flex;justify-content:space-between;font-size:14px;color:#a0b4b0;margin-bottom:10px;">
          <span>Shipping</span><span>${order.shipping === 0 ? "FREE" : `Rs. ${order.shipping.toLocaleString()}`}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;color:#f7fafa;border-top:1px solid #184841;padding-top:10px;">
          <span>Total</span><span style="color:#1c7865;">Rs. ${order.total.toLocaleString()}</span>
        </div>
      </div>
    </div>

    <div style="background:#0e2f2b;border-radius:16px;padding:22px 28px;margin-bottom:16px;border:1px solid #184841;">
      <h3 style="margin:0 0 14px;font-size:15px;color:#f7fafa;">Delivery Details</h3>
      <p style="margin:0;font-size:14px;color:#a0b4b0;line-height:1.6;">
        ${order.customer.name}<br/>
        ${order.delivery.address}<br/>
        ${order.delivery.city}<br/>
        ${order.customer.phone}
      </p>
    </div>

    <div style="background:#0e2f2b;border-radius:16px;padding:22px 28px;margin-bottom:28px;border:1px solid #184841;">
      <h3 style="margin:0 0 10px;font-size:15px;color:#f7fafa;">Payment Method</h3>
      <p style="margin:0;font-size:14px;color:#a0b4b0;">${order.paymentLabel}</p>
    </div>

    <div style="text-align:center;">
      <p style="font-size:13px;color:#6b8f88;">Questions? Reply to this email or WhatsApp us.</p>
      <p style="font-size:12px;color:#4a7068;margin-top:10px;">&copy; ${new Date().getFullYear()} ToyVerse Pakistan. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

function buildAdminEmailHtml(order: OrderNotificationData): string {
  const itemsList = order.items.map((i) => `${i.quantity}x ${i.name} (${i.price})`).join("<br/>");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0b2420;font-family:'Segoe UI',Tahoma,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <div style="background:#0e2f2b;border-left:4px solid #ecc94b;padding:18px;border-radius:0 12px 12px 0;margin-bottom:16px;border:1px solid #184841;">
      <h2 style="margin:0;font-size:17px;color:#ecc94b;">New Order Received</h2>
      <p style="margin:5px 0 0;font-size:14px;color:#a0b4b0;">Order ID: <strong>${order.orderId}</strong></p>
    </div>

    <div style="background:#0e2f2b;border:1px solid #184841;border-radius:12px;padding:22px;margin-bottom:12px;">
      <h3 style="margin:0 0 10px;font-size:15px;color:#f7fafa;">Customer</h3>
      <p style="margin:0;font-size:14px;color:#a0b4b0;">
        ${order.customer.name} | ${order.customer.phone}${order.customer.email ? ` | ${order.customer.email}` : ""}
      </p>
      <p style="margin:5px 0 0;font-size:14px;color:#a0b4b0;">${order.delivery.address}, ${order.delivery.city}</p>
    </div>

    <div style="background:#0e2f2b;border:1px solid #184841;border-radius:12px;padding:22px;margin-bottom:12px;">
      <h3 style="margin:0 0 10px;font-size:15px;color:#f7fafa;">Items</h3>
      <p style="margin:0;font-size:14px;color:#a0b4b0;line-height:1.7;">${itemsList}</p>
    </div>

    <div style="background:#0e2f2b;border:1px solid #1c7865;border-radius:12px;padding:18px;text-align:center;">
      <p style="margin:0;font-size:14px;color:#a0b4b0;">Total: <strong style="font-size:20px;color:#1c7865;">Rs. ${order.total.toLocaleString()}</strong></p>
      <p style="margin:5px 0 0;font-size:13px;color:#38b2ac;">Payment: ${order.paymentLabel}</p>
    </div>
  </div>
</body>
</html>`;
}

export function generateWhatsAppLink(order: OrderNotificationData): string {
  const items = order.items.map((i) => `• ${i.quantity}x ${i.name} — ${i.price}`).join("%0A");
  const msg = [
    `Hi ToyVerse!`,
    ``,
    `I just placed an order and want to confirm it.`,
    ``,
    `Order ID: ${order.orderId}`,
    `Name: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
    ``,
    `Items:`,
    items,
    ``,
    `Total: Rs. ${order.total.toLocaleString()}`,
    `Payment: ${order.paymentLabel}`,
    ``,
    `Thank you!`,
  ].join("%0A");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export async function sendOrderNotification(order: OrderNotificationData): Promise<void> {
  if (!resend) {
    console.warn("[Notifications] RESEND_API_KEY not set — skipping email notifications");
    return;
  }

  console.log("[Notifications] Sending order notification for:", order.orderId);

  const customerHtml = buildCustomerEmailHtml(order);
  const adminHtml = buildAdminEmailHtml(order);
  const shortId = order.orderId.slice(-6);

  const tasks: Promise<unknown>[] = [];

  // Send to customer (if email provided) + notification email
  if (order.customer.email) {
    tasks.push(
      resend.emails
        .send({
          from: FROM_EMAIL,
          to: [order.customer.email, NOTIFICATION_EMAIL],
          subject: `Order Confirmed! ToyVerse Order #${shortId}`,
          html: customerHtml,
          text: `Order Confirmed! Your ToyVerse order #${shortId} has been received. Total: Rs. ${order.total.toLocaleString()}. Thank you for shopping with ToyVerse Pakistan!`,
        })
        .then((res) => {
          console.log("[Resend] Customer email sent successfully:", JSON.stringify(res));
          return res;
        })
        .catch((err) => {
          console.error("[Resend] Customer email failed:", JSON.stringify(err));
          throw err;
        })
    );
  } else {
    // No customer email — still send to notification email
    tasks.push(
      resend.emails
        .send({
          from: FROM_EMAIL,
          to: NOTIFICATION_EMAIL,
          subject: `Order Confirmed! ToyVerse Order #${shortId}`,
          html: customerHtml,
          text: `Order Confirmed! Your ToyVerse order #${shortId} has been received. Total: Rs. ${order.total.toLocaleString()}. Thank you for shopping with ToyVerse Pakistan!`,
        })
        .then((res) => {
          console.log("[Resend] Notification email sent successfully:", JSON.stringify(res));
          return res;
        })
        .catch((err) => {
          console.error("[Resend] Notification email failed:", JSON.stringify(err));
          throw err;
        })
    );
  }

  // Send admin notification
  tasks.push(
    resend.emails
      .send({
        from: FROM_EMAIL,
        to: [ADMIN_EMAIL, NOTIFICATION_EMAIL],
        subject: `New Order: ${order.orderId} — Rs. ${order.total.toLocaleString()}`,
        html: adminHtml,
        text: `New Order: ${order.orderId}. Customer: ${order.customer.name} (${order.customer.phone}). Total: Rs. ${order.total.toLocaleString()}. Payment: ${order.paymentLabel}.`,
      })
      .then((res) => {
        console.log("[Resend] Admin email sent successfully:", JSON.stringify(res));
        return res;
      })
      .catch((err) => {
        console.error("[Resend] Admin email failed:", JSON.stringify(err));
        throw err;
      })
  );

  await Promise.allSettled(tasks);
  console.log("[Notifications] All email tasks completed for order:", order.orderId);
}
