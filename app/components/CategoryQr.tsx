"use client";

import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function CategoryQr({
  category,
  title,
}: {
  category: string;
  title: string;
}) {
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    async function loadPhotoUrl() {
      const { data, error } = await supabase
        .from("menu_photos")
        .select("image_url")
        .eq("category", category)
        .maybeSingle();

      if (error) {
        console.error("QR PHOTO ERROR:", error);
        return;
      }

      setPhotoUrl(data?.image_url || "");
    }

    loadPhotoUrl();
  }, [category]);

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
