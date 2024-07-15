import { ThemeToggle } from "@/components/theme-toggle";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { Button } from "@/components/ui/button";
import { FlipWords } from "@/components/ui/flip-words";
import { ArrowLeft, ArrowRight, CirclePlay } from "lucide-react";

export default async function Home() {
  const words = [
    "Software Developers",
    "Product Managers",
    "UI/UX Designers",
    "Marketing Specialists",
    "Business Development Manager",
  ];
  const people = [
    {
      id: 1,
      name: "John Doe",
      designation: "Software Engineer",
      image:
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3387&q=80",
    },
    {
      id: 2,
      name: "Robert Johnson",
      designation: "Product Manager",
      image:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    {
      id: 3,
      name: "Jane Smith",
      designation: "Data Scientist",
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    {
      id: 4,
      name: "Emily Davis",
      designation: "UX Designer",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    },
    {
      id: 5,
      name: "Tyler Durden",
      designation: "Soap Developer",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80",
    },
    {
      id: 6,
      name: "Dora",
      designation: "The Explorer",
      image:
        "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3534&q=80",
    },
  ];

  return (
    <main>
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="mx-auto text-4xl font-normal">
          <h1 className="mb-6 max-w-[800px] text-[64px] leading-[60px] -tracking-wider">
            Reichman Universtay Enterprensuhip Hub
          </h1>
          <span className="text-neutral-600 dark:text-neutral-400">
            Connect with
          </span>
          <FlipWords words={words} /> <br />
          <div className="mt-2 flex flex-row items-start justify-start">
            <AnimatedTooltip items={people} />
          </div>
        </div>
      </div>
      <Button
        className="fixed bottom-10 left-1/2 -translate-x-1/2 font-sans text-2xl"
        variant="expandIcon"
        iconPlacement="right"
        Icon={ArrowRight}
        size="lg"
      >
        Join
      </Button>
    </main>
  );
}
