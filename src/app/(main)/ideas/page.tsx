import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function IdeasPage() {
  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">Ideas</h1>
      <p className="mb-8 text-muted-foreground">
        Start an ideation session solo or with your team to generate and
        prioritize ideas.
      </p>

      <div className="flex max-w-md flex-col gap-4">
        <Button asChild className="w-full" size="lg">
          <Link href="/ideas/new">Start New Ideation Session</Link>
        </Button>

        <Button asChild variant="outline" className="w-full" size="lg">
          <Link href="/ideas/history">View Past Sessions</Link>
        </Button>
      </div>
    </div>
  );
}
