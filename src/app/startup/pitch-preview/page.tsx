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
    .select("company_name, pitch_data, is_published, logo_url, cover_image_url, city, founded_year, employee_count, linkedin_url")
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
      logoUrl={profile.logo_url ?? null}
      coverImageUrl={profile.cover_image_url ?? null}
      city={profile.city ?? null}
      foundedYear={profile.founded_year ?? null}
      employeeCount={profile.employee_count ?? null}
      linkedinUrl={profile.linkedin_url ?? null}
    />
  );
}
