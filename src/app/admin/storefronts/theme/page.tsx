import { redirect } from "next/navigation";

/** Themes UI lives on /admin/storefronts */
export default function StorefrontThemeRedirect() {
  redirect("/admin/storefronts");
}
