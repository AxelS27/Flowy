import { IslandOverlayView } from "./views/IslandOverlayView";
import { MainAppView } from "./views/MainAppView";

export function App() {
  const isIslandOverlayWindow = window.location.hash.includes("island");

  if (isIslandOverlayWindow) {
    return <IslandOverlayView />;
  }

  return <MainAppView />;
}

export default App;
