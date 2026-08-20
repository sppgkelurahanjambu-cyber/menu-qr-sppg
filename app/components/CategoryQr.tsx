import { QRCodeCanvas } from "qrcode.react";

export default function CategoryQr({
  photoUrl,
  title,
}: {
  photoUrl: string;
  title: string;
}) {
  if (!photoUrl) {
    return (
      <div className="qrCard">
        <div className="qrCanvasWrap qrUnavailable">
          <span>Foto belum tersedia</span>
        </div>
        <h3>{title}</h3>
        <p>Upload foto melalui Admin</p>
      </div>
    );
  }

  return (
    <div className="qrCard">
      <div className="qrCanvasWrap">
        <QRCodeCanvas
          value={photoUrl}
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
      <p>Scan untuk langsung membuka foto menu</p>
    </div>
  );
}
