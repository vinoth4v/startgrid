import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PitchSlide } from "@/app/actions/generate-pitch";
import PitchDeckEditor from "./PitchDeckEditor";

export default async function PitchPreviewPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("startup_profiles")
    .select("company_name, pitch_data, is_published")
    .eq("user_id", user.id)
    .single();

  if (!profile || !Array.isArray(profile.pitch_data)) {
    redirect("/startup/onboard");
  }

  const slides = profile.pitch_data as PitchSlide[];

  return (
    <PitchDeckEditor
      slides={slides}
      companyName={profile.company_name ?? "Your company"}
      isPublished={profile.is_published ?? false}
    />
  );
}
