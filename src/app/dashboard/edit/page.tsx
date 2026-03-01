import { redirect } from "next/navigation";

/** /dashboard/edit はホームへリダイレクト */
export default function EditRedirect() {
  redirect("/dashboard");
}
