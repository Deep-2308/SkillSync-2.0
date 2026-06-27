interface WorkspacePageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { id } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Project Workspace</h1>
      <p className="text-muted-foreground">Project ID: {id}</p>
    </div>
  );
}
