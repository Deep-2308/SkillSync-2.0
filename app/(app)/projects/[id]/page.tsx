interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Project Details</h1>
      <p className="text-muted-foreground">Project ID: {id}</p>
    </div>
  );
}
