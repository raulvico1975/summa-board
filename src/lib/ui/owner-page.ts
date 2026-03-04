import { redirect } from "next/navigation";
import type { OwnerContext } from "@/src/lib/firebase/auth";
import { getOwnerFromServerCookies } from "@/src/lib/firebase/auth";

export async function requireOwnerPage(): Promise<OwnerContext> {
  const owner = await getOwnerFromServerCookies();
  if (!owner) {
    redirect("/login");
  }

  return owner;
}
