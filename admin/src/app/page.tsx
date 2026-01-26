import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  // Check auth and redirect to appropriate page
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }
  } catch {
    // If there's an auth error, redirect to login
    redirect("/login");
  }

  // If authenticated, redirect to kickstart dashboard
  redirect("/kickstart");
}
