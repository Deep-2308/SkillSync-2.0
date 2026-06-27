import Link from "next/link";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  techStack: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  memberCount: number;
  maxTeamSize: number;
  status: string;
}

const difficultyColors = {
  beginner: "bg-green-500/10 text-green-500 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function ProjectCard({
  id,
  title,
  description,
  category,
  techStack,
  difficulty,
  memberCount,
  maxTeamSize,
  status,
}: ProjectCardProps) {
  return (
    <Link href={`/projects/${id}`}>
      <div className="group relative rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {category}
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${difficultyColors[difficulty]}`}
          >
            {difficulty}
          </span>
        </div>

        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {techStack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium"
            >
              {tech}
            </span>
          ))}
          {techStack.length > 4 && (
            <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              +{techStack.length - 4}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            👥 {memberCount}/{maxTeamSize} members
          </span>
          <span className="capitalize">{status}</span>
        </div>
      </div>
    </Link>
  );
}
