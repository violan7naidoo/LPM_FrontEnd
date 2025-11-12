import { TopSection } from "@/components/game/TopSection";
import { MiddleSection } from "@/components/game/MiddleSection";
import { BottomSection } from "@/components/game/BottomSection";

export default function Home() {
  return (
    <div className="game-container">
      <TopSection />
      <MiddleSection />
      <BottomSection />
    </div>
  );
}

