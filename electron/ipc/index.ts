import { registerWindowIpc } from "./windowIpc";
import { registerIslandIpc } from "./islandIpc";
import { registerRoutineIpc } from "./routineIpc";

export function registerAllIpc() {
  registerWindowIpc();
  registerIslandIpc();
  registerRoutineIpc();
}
