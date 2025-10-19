"use client";

import { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QrCode, ExternalLink, Download, RefreshCcw, Power } from "lucide-react";
import { toast } from "sonner";
import axiosMember from "@/axiosInstances/axiosMember";

type MemberQRDTO = {
  publicSlug?: string | null;
  publicProfileEnabled?: boolean | null;
};

export default function ProfileQrPage() {
  const [info, setInfo] = useState<MemberQRDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // Load current member profile (we only care about slug + enabled)
  const fetchMe = async () => {
    try {
      setLoading(true);
      const res = await axiosMember.get("/profile");
      const d = res.data?.data as MemberQRDTO;
      setInfo({ publicSlug: d?.publicSlug ?? null, publicProfileEnabled: d?.publicProfileEnabled ?? false });
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const origin = useMemo(() => (typeof window !== "undefined" ? window.location.origin : ""), []);
  // Public page URL that people will visit after scanning
  const shareUrl = useMemo(() => {
    if (!origin || !info?.publicProfileEnabled || !info?.publicSlug) return "";
    // This is your public-facing Next.js route (no auth)
    return `${origin}/profile/${info.publicSlug}`;
  }, [origin, info?.publicProfileEnabled, info?.publicSlug]);

  const enableShare = async () => {
    try {
      setBusy(true);
      const res = await axiosMember.post("/profile/share-link"); // enable (creates slug if missing)
      setInfo({
        publicSlug: res.data?.data?.publicSlug ?? null,
        publicProfileEnabled: res.data?.data?.publicProfileEnabled ?? true,
      });
      toast.success("Share link enabled!");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to enable share link.");
    } finally {
      setBusy(false);
    }
  };

  const regenerate = async () => {
    try {
      setBusy(true);
      const res = await axiosMember.post("/profile/share-link", null, { params: { regenerate: true } });
      setInfo({
        publicSlug: res.data?.data?.publicSlug ?? null,
        publicProfileEnabled: res.data?.data?.publicProfileEnabled ?? true,
      });
      toast.success("Share link regenerated!");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to regenerate link.");
    } finally {
      setBusy(false);
    }
  };

  const disableShare = async () => {
    try {
      setBusy(true);
      await axiosMember.delete("/profile/share-link");
      setInfo((p) => ({ ...p, publicProfileEnabled: false }));
      toast.success("Share link disabled.");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to disable share link.");
    } finally {
      setBusy(false);
    }
  };

  // Download PNG (export a crisp, upscaled image from the canvas)
  const downloadPng = () => {
    const src = document.querySelector("#qr canvas") as HTMLCanvasElement | null;
    if (!src) return;
    const scale = 4; // upscale for sharp export
    const out = document.createElement("canvas");
    out.width = src.width * scale;
    out.height = src.height * scale;

    const ctx = out.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff"; // white background
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(src, 0, 0, out.width, out.height);

    const url = out.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-profile-qr.png";
    a.click();
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-6 py-8">Loading…</div>;
  }

  const isEnabled = !!info?.publicProfileEnabled && !!info?.publicSlug;

  return (
    <Card className="mt-4 sm:mt-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
          <QrCode className="h-5 w-5" />
          <span>My QR Code</span>
        </CardTitle>
        <CardDescription className="text-sm">
          Create a shareable QR that opens your public profile page
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 text-center">
        {!isEnabled ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your share link is currently <strong>disabled</strong>.
            </p>
            <Button onClick={enableShare} disabled={busy} className="text-sm">
              Enable share link
            </Button>
          </div>
        ) : (
          <>
            {/* The QR (canvas) */}
            <div id="qr" className="flex justify-center">
              <QRCodeCanvas
                value={shareUrl}
                size={220}
                level="M"
                includeMargin
                style={{ background: "white", borderRadius: 8, padding: 8 }}
              />
            </div>

            {/* URL + actions */}
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-muted-foreground">Scan to view my profile</p>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Input value={shareUrl} readOnly className="text-center text-xs sm:text-sm" />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    toast.success("Profile URL copied!");
                  }}
                  className="w-full sm:w-auto text-sm"
                >
                  Copy
                </Button>
                <Button asChild className="w-full sm:w-auto text-sm">
                  <a href={shareUrl} target="_blank" rel="noreferrer">
                    Open
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
                <Button onClick={downloadPng} className="w-full sm:w-auto text-sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download PNG
                </Button>
              </div>

              {/* Manage link */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <Button variant="secondary" onClick={regenerate} disabled={busy} className="text-sm">
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
                <Button variant="outline" onClick={disableShare} disabled={busy} className="text-sm">
                  <Power className="h-4 w-4 mr-2" />
                  Disable
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
