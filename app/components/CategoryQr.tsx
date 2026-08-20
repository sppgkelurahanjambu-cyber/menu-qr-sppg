"use client";

import dynamic from "next/dynamic";

const QRCodeCanvas = dynamic(
  () => import("qrcode.react").then((mod) => mod.QRCodeCanvas),
  { ssr: false }
);

const PUBLIC_SITE_URL = "https://menu-qr-sppg.vercel.app";

export default function CategoryQr({
  categoryPath,
  title,
}: {
  categoryPath: string;
  title: string;
}) {
  // QR selalu mengarah ke halaman kategori yang tetap.
  // Foto boleh berubah berkali-kali tanpa mengubah QR yang dicetak.
  const qrUrl = `${PUBLIC_SITE_URL}${categoryPath}`;

  return (
    <div className="qrCard">
      <div className="qrCanvasWrap">
        <QRCodeCanvas
          value={qrUrl}
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
      <p>Scan untuk melihat foto menu terbaru</p>
    </div>
  );
}
