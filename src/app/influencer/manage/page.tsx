import { redirect } from "next/navigation";

/** 旧URL互換: /influencer/manage → /dashboard */
export default function RedirectManage() {
  redirect("/dashboard");
}
