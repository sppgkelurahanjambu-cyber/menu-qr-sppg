"use client";

import { QRCodeCanvas } from "qrcode.react";

export default function CategoryQr({
  href,
  title,
}: {
  href: string;
  title: string;
}) {
  const url = typeof window !== "undefined" ? `${window.location.origin}${href}` : href;

  return (
    <div className="qrCard">
      <div className="qrCanvasWrap">
        <QRCodeCanvas
          value={url}
          size={190}
          level="H"
          includeMargin
          imageSettings={{
            src: "/logo-bgn.png",
            height: 42,
            width: 42,
            excavate: true,
            opacity: 1,
          }}
        />
      </div>
      <h3>{title}</h3>
      <p>Scan untuk membuka menu</p>
    </div>
  );
}
