export class ActionError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "ActionError";
  }
}

export function errorDetails(error: unknown): { error: string; code: string } {
  if (error instanceof ActionError) return { error: error.message, code: error.code };
  if (error instanceof Error) {
    const code = (error as NodeJS.ErrnoException).code;
    const hints: Record<string, string> = {
      ENOENT: "The file, folder or application could not be found.",
      EACCES: "Access was denied. Check file permissions or whether the application needs administrator rights.",
      EPERM: "Windows blocked the operation. The item may be protected or in use.",
      EEXIST: "The destination already exists. Flowy will not overwrite it.",
      EXDEV: "The source and destination are on different drives.",
      EBUSY: "The item is in use. Close the application using it and retry.",
    };
    return { code: code || "ACTION_FAILED", error: hints[code || ""] ? `${hints[code!]} ${error.message}` : error.message };
  }
  return { code: "ACTION_FAILED", error: "The action failed." };
}
