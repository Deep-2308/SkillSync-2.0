interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">User Profile</h1>
      <p className="text-muted-foreground">User ID: {id}</p>
    </div>
  );
}
