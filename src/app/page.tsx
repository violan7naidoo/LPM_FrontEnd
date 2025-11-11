import { SlotMachine } from "@/components/game/slot-machine";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden">
      <div className="relative z-10">
        <SlotMachine />
      </div>
    </main>
  );
}

