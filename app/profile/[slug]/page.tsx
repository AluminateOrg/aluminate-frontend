"use client";

import { useEffect, useState, use } from "react";
import axiosGlobal from "@/axiosInstances/axiosGlobal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PublicMemberProfileDTO {
  name: string | null;
  position: string | null;
  company: string | null;
  batch: number | null;
  degree: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  photoUrl: string | null;
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function ProfilePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  
  const [data, setData] = useState<PublicMemberProfileDTO | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosGlobal.get(`/public/profile/${slug}`);
        setData(res.data?.data ?? null);
      } catch (e: any) {
        setErr(e?.response?.data?.message || "Profile not found or disabled.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [slug]);

  // ... rest of the component remains the same
  if (loading)
    return (
      <div className="max-w-xl mx-auto p-6 text-center text-muted-foreground">
        Loading profile...
      </div>
    );

  if (err)
    return (
      <div className="max-w-xl mx-auto p-6 text-center text-red-500">
        {err}
      </div>
    );

  if (!data)
    return (
      <div className="max-w-xl mx-auto p-6 text-center text-muted-foreground">
        Profile not found.
      </div>
    );

  const initials =
    (data.name ?? "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2) || "U";

  return (
    <div className="max-w-xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Member Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={data.photoUrl ?? undefined} alt={data.name ?? "User"} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div>
              <div className="text-xl font-semibold">{data.name}</div>
              <div className="text-sm text-muted-foreground">
                {data.position}
                {data.company ? ` • ${data.company}` : ""}
              </div>
              {data.batch && (
                <div className="text-xs text-muted-foreground">
                  Class of {data.batch}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 text-sm">
            {data.degree && <div>🎓 Degree: {data.degree}</div>}
            {data.linkedinUrl && (
              <div>
                <a
                  className="underline text-primary"
                  href={data.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                </a>
              </div>
            )}
            {data.githubUrl && (
              <div>
                <a
                  className="underline text-primary"
                  href={data.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              </div>
            )}
            {data.websiteUrl && (
              <div>
                <a
                  className="underline text-primary"
                  href={data.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Website
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}