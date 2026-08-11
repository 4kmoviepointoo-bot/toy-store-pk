"use client";

import { useRef } from "react";
import { FileDown } from "lucide-react";

interface InvoiceItem {
  name: string;
  price: string;
  quantity: number;
}

interface InvoiceData {
  orderId: string;
  date?: string;
  customer?: { name: string; phone: string; email: string | null };
  name?: string;
  phone?: string;
  email?: string;
  delivery?: { address: string; city: string };
  address?: string;
  city?: string;
  items: InvoiceItem[];
  subtotal: number;
  shipping: number;
  couponCode: string | null;
  couponDiscount: number;
  total: number;
  paymentLabel: string;
}

function fmtPrice(n: number): string {
  return `Rs. ${n.toLocaleString()}`;
}

function parsePrice(priceStr: string): number {
  const cleaned = priceStr.replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
}

export function InvoiceDownload({ order }: { order: InvoiceData }) {
  const printRef = useRef<HTMLDivElement>(null);

  const customerName = order.name || order.customer?.name || "";
  const customerPhone = order.phone || order.customer?.phone || "";
  const customerEmail = order.email || order.customer?.email || "";
  const deliveryAddress = order.address || order.delivery?.address || "";
  const deliveryCity = order.city || order.delivery?.city || "";
  const orderDate = order.date
    ? new Date(order.date).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" });

  function handlePrint() {
    const content = printRef.current;
    if (!content) return;

    const win = window.open("", "_blank", "width=800,height=900");
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${order.orderId} — ToyVerse</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; background: #fff; padding: 32px; }
          .invoice { max-width: 700px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 3px solid #1c7865; padding-bottom: 20px; }
          .brand h1 { font-size: 26px; color: #0b2420; margin-bottom: 4px; }
          .brand p { font-size: 12px; color: #6b8f88; }
          .meta { text-align: right; }
          .meta h2 { font-size: 18px; color: #1c7865; margin-bottom: 4px; }
          .meta p { font-size: 12px; color: #6b8f88; }
          .section { margin-bottom: 24px; }
          .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #6b8f88; font-weight: 700; margin-bottom: 8px; }
          .details { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .detail-block p { font-size: 13px; color: #333; line-height: 1.6; }
          .detail-block strong { color: #0b2420; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th { background: #0b2420; color: #fff; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
          th:nth-child(2), th:nth-child(3) { text-align: center; }
          th:last-child { text-align: right; }
          td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
          td:nth-child(2), td:nth-child(3) { text-align: center; }
          td:last-child { text-align: right; font-weight: 600; }
          tr:nth-child(even) { background: #f9fafb; }
          .totals { margin-top: 16px; display: flex; justify-content: flex-end; }
          .totals-table { width: 260px; }
          .totals-table div { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #555; }
          .totals-table .discount { color: #16a34a; }
          .totals-table .total-row { border-top: 2px solid #0b2420; padding-top: 10px; margin-top: 4px; font-size: 16px; font-weight: 700; color: #0b2420; }
          .footer { margin-top: 40px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 16px; }
          .footer p { font-size: 11px; color: #999; }
          .footer .brand-name { color: #1c7865; font-weight: 700; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 400);
  }

  return (
    <>
      <button
        onClick={handlePrint}
        className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-hover active:scale-[0.97]"
      >
        <FileDown className="h-4 w-4" />
        Download Invoice
      </button>

      {/* Hidden printable invoice */}
      <div ref={printRef} className="sr-only">
        <div className="invoice">
          <div className="header">
            <div className="brand">
              <h1>🧸 ToyVerse Pakistan</h1>
              <p>Your one-stop toy shop</p>
            </div>
            <div className="meta">
              <h2>INVOICE</h2>
              <p><strong>{order.orderId}</strong></p>
              <p>{orderDate}</p>
            </div>
          </div>

          <div className="section">
            <p className="section-title">Bill To</p>
            <div className="details">
              <div className="detail-block">
                <p><strong>{customerName}</strong></p>
                <p>{customerPhone}</p>
                {customerEmail && <p>{customerEmail}</p>}
              </div>
              <div className="detail-block">
                <p><strong>Delivery Address</strong></p>
                <p>{deliveryAddress}</p>
                <p>{deliveryCity}</p>
              </div>
            </div>
          </div>

          <div className="section">
            <p className="section-title">Order Items</p>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => {
                  const unitPrice = parsePrice(item.price);
                  const lineTotal = unitPrice * item.quantity;
                  return (
                    <tr key={i}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{fmtPrice(unitPrice)}</td>
                      <td>{fmtPrice(lineTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="totals">
            <div className="totals-table">
              <div>
                <span>Subtotal</span>
                <span>{fmtPrice(order.subtotal)}</span>
              </div>
              {order.couponCode && order.couponDiscount > 0 && (
                <div className="discount">
                  <span>Discount ({order.couponCode})</span>
                  <span>-{fmtPrice(order.couponDiscount)}</span>
                </div>
              )}
              <div>
                <span>Shipping</span>
                <span>{order.shipping === 0 ? "FREE" : fmtPrice(order.shipping)}</span>
              </div>
              <div className="total-row">
                <span>Total</span>
                <span>{fmtPrice(order.total)}</span>
              </div>
              <div>
                <span>Payment</span>
                <span>{order.paymentLabel}</span>
              </div>
            </div>
          </div>

          <div className="footer">
            <p>Thank you for shopping with <span className="brand-name">ToyVerse Pakistan</span>!</p>
            <p style={{ marginTop: 4 }}>Questions? Contact us on WhatsApp or email support@toyverse.pk</p>
          </div>
        </div>
      </div>
    </>
  );
}
