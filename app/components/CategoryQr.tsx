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
  icon,
}: {
  categoryPath: string;
  title: string;
  icon: string;
}) {
  // QR selalu mengarah ke halaman kategori yang tetap.
  // Foto boleh berubah tanpa mengubah QR yang sudah dicetak.
  const qrUrl = `${PUBLIC_SITE_URL}${categoryPath}`;

  return (
    <article className="categoryQrCard">
      <div className="categoryIcon" aria-hidden="true">{icon}</div>
      <h3>{title}</h3>
      <div className="categoryAccent" aria-hidden="true" />
      <p className="categoryDescription">Menu terbaru sesuai kelompok sasaran.</p>
      <div className="qrCanvasWrap">
        <QRCodeCanvas
          value={qrUrl}
          size={170}
          level="H"
          includeMargin
          imageSettings={{
            src: "/logo-bgn.png",
            height: 40,
            width: 40,
            excavate: true,
            opacity: 1,
          }}
        />
      </div>
      <p className="akgText">Sesuai Angka Kecukupan Gizi Harian</p>
    </article>
  );
}
