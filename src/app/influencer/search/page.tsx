import { redirect } from "next/navigation";

/** 旧URL互換: /influencer/search → /dashboard/search */
export default function RedirectSearch() {
  redirect("/dashboard/search");
}
