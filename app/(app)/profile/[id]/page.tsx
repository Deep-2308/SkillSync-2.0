import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { getPublicProfile } from "@/lib/profile";
import { ProfileExperience } from "@/components/profile/ProfileExperience";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const isOwn = session.user.id === id;

  // Same data the GET /api/users/[id] endpoint returns, sourced directly for
  // reliable server rendering.
  const profile = await getPublicProfile(id, isOwn);
  if (!profile) notFound();

  return <ProfileExperience profile={profile} isOwn={isOwn} />;
}
