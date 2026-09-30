import { IslandOverlayView } from "./views/IslandOverlayView";
import { MainAppView } from "./views/MainAppView";
import { CelebrationOverlayView } from "./views/CelebrationOverlayView";

export function App() {
  if (window.location.hash === "#/celebration" || window.location.hash === "#celebration") {
    return <CelebrationOverlayView />;
  }

  const isIslandOverlayWindow = window.location.hash.includes("island");

  if (isIslandOverlayWindow) {
    return <IslandOverlayView />;
  }

  return <MainAppView />;
}

export default App;
