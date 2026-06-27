interface SkillCardProps {
  name: string;
  challengeCount: number;
  highestScore: number;
  badgeLevel?: "bronze" | "silver" | "gold" | "platinum";
  onChallenge?: () => void;
}

const badgeIcons: Record<string, string> = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  platinum: "💎",
};

export default function SkillCard({
  name,
  challengeCount,
  highestScore,
  badgeLevel,
  onChallenge,
}: SkillCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 transition-all hover:shadow-md">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold">{name}</h3>
        {badgeLevel && (
          <span className="text-xl" title={`${badgeLevel} badge`}>
            {badgeIcons[badgeLevel]}
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Challenges completed</span>
          <span className="font-medium">{challengeCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Highest score</span>
          <span className="font-medium">{highestScore}%</span>
        </div>
        {highestScore > 0 && (
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{ width: `${highestScore}%` }}
            />
          </div>
        )}
      </div>

      {onChallenge && (
        <button
          onClick={onChallenge}
          className="w-full rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
        >
          Take Challenge
        </button>
      )}
    </div>
  );
}
