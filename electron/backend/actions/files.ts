import { shell } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { ActionError } from "../errors";
import { nativeAction } from "../native";
import { checkCancelled, message } from "../runtime";
import { localPath, newName } from "../validation";
import { ActionRegistry } from "./definition";

async function rejectLinks(target: string): Promise<void> {
  let current = target;
  while (true) {
    try {
      if ((await fs.lstat(current)).isSymbolicLink()) throw new ActionError("UNSAFE_PATH", "Symbolic links and junctions are not supported. Choose the actual local file or folder.");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    const parent = path.dirname(current);
    if (parent === current) return;
    current = parent;
  }
}

async function existing(target: string, kind?: "file" | "folder"): Promise<void> {
  await rejectLinks(target);
  const stat = await fs.lstat(target);
  if (!stat.isDirectory() && !stat.isFile()) throw new ActionError("UNSAFE_PATH", "Choose a regular file or folder.");
  if (kind === "file" && !stat.isFile() || kind === "folder" && !stat.isDirectory()) {
    throw new ActionError("PATH_TYPE_MISMATCH", `The selected path is not a ${kind}.`);
  }
}

function notRoot(target: string): void {
  if (target === path.parse(target).root) throw new ActionError("UNSAFE_PATH", "Drive roots cannot be deleted, copied or moved.");
}

async function newDestination(source: string, destination: string): Promise<void> {
  await rejectLinks(destination);
  const relative = path.relative(source, destination);
  if (relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative))) {
    throw new ActionError("INVALID_DESTINATION", "The destination cannot be the source or a location inside it.");
  }
  try {
    await fs.lstat(destination);
    throw new ActionError("DESTINATION_EXISTS", "Destination already exists. Flowy will not overwrite it.");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  if (!(await fs.stat(path.dirname(destination))).isDirectory()) throw new ActionError("INVALID_DESTINATION", "The destination parent must be an existing folder.");
}

const open = (kind: "file" | "folder"): ActionRegistry[string] => ({
  prepare: (step) => {
    const target = localPath(step.param);
    return async ({ signal }) => {
      await existing(target, kind);
      checkCancelled(signal);
      const error = await shell.openPath(target);
      if (error) throw new ActionError("OPEN_FAILED", error);
    };
  },
});

const recycle = (kind: "file" | "folder"): ActionRegistry[string] => ({
  prepare: (step) => {
    const target = localPath(step.param);
    notRoot(target);
    return async (context) => {
      await existing(target, kind);
      await message(context, `Move this ${kind}${kind === "folder" ? " and its contents" : ""} to the Recycle Bin?\n${target}`, true);
      // Re-check after the user responds; the item may have changed while the dialog was open.
      await existing(target, kind);
      checkCancelled(context.signal);
      await shell.trashItem(target);
    };
  },
});

const transfer = (mode: "copy" | "move" | "rename"): ActionRegistry[string] => ({
  native: true,
  prepare: (step) => {
    const source = localPath(step.param);
    notRoot(source);
    const destination = mode === "rename"
      ? path.join(path.dirname(source), newName(step.secondaryParam))
      : localPath(step.secondaryParam);
    return async ({ signal }) => {
      await existing(source);
      await newDestination(source, destination);
      checkCancelled(signal);
      if (mode !== "copy") {
        // Windows FileSystem handles cross-drive moves and refuses file replacement.
        await nativeAction("path.move", source, signal, destination);
        return;
      }
      // Stage the copy beside its destination. Cancellation/failure never deletes
      // the source or publishes an incomplete destination.
      const staging = path.join(path.dirname(destination), `.flowy-copy-${randomUUID()}`);
      try {
        await fs.cp(source, staging, {
          recursive: true, force: false, errorOnExist: true,
          filter: async (item) => {
            checkCancelled(signal);
            if ((await fs.lstat(item)).isSymbolicLink()) throw new ActionError("UNSAFE_PATH", "The folder contains a symbolic link or junction. Copy the actual files instead.");
            return true;
          },
        });
        checkCancelled(signal);
        await newDestination(source, destination);
        await nativeAction("path.move", staging, signal, destination);
      } finally {
        // Only our unique staging path is removed, never a user destination.
        await fs.rm(staging, { recursive: true, force: true }).catch(() => {});
      }
    };
  },
});

export const fileActions: ActionRegistry = {
  "file.open": open("file"),
  "folder.open": open("folder"),
  "folder.create": {
    prepare: (step) => {
      const target = localPath(step.param);
      return async ({ signal }) => {
        await rejectLinks(target);
        checkCancelled(signal);
        await fs.mkdir(target, { recursive: true });
        await existing(target, "folder");
      };
    },
  },
  "file.delete": recycle("file"),
  "folder.delete": recycle("folder"),
  "path.copy": transfer("copy"),
  "path.move": transfer("move"),
  "path.rename": transfer("rename"),
};
