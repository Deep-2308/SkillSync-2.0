import Link from "next/link";

export default function Home() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-8 px-6"
      style={{ backgroundColor: "#0A0C14" }}
    >
      <h1
        className="text-5xl font-extrabold tracking-tight sm:text-6xl"
        style={{ color: "#22D3EE", fontFamily: "'Syne', sans-serif" }}
      >
        SkillSync
      </h1>

      <p className="max-w-md text-center text-lg" style={{ color: "#94A3B8" }}>
        Coming soon — AI-powered skill verification platform
      </p>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-lg border px-6 py-3 text-sm font-semibold transition-colors hover:bg-white/5"
          style={{
            borderColor: "#22D3EE",
            color: "#22D3EE",
          }}
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="rounded-lg px-6 py-3 text-sm font-semibold transition-colors hover:opacity-90"
          style={{
            backgroundColor: "#22D3EE",
            color: "#0A0C14",
          }}
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
