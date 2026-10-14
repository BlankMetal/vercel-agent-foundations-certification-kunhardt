import { Sandbox } from "@vercel/sandbox";

export const SANDBOX_NAME = "admin-agent-sandbox";

// Back-office tools save their full results here so the bash tool can compute
// over them without the model retyping rows into a command. In the universal
// image $HOME is /vercel and /vercel/sandbox does not exist, so use absolute
// paths under $HOME.
export const SANDBOX_DATA_DIR = "/vercel/data";

// The admin agent's notes and saved report scripts. Both live only in the
// persistent sandbox's snapshot, and every admin shares them.
export const SANDBOX_MEMORY_PATH = "/vercel/memories.md";
export const SANDBOX_SCRIPTS_DIR = "/vercel/scripts";

export const createOrGetSandbox = async (name: string) => {
  try {
    return await getOrCreate(name);
  } catch (err) {
    // The agent calls tools in parallel. When the sandbox doesn't exist yet,
    // two steps both try to create it and the loser fails on the name. By the
    // time it retries, the winner's sandbox is there to get.
    console.warn(`[sandbox] getOrCreate failed, retrying once`, err);
    return getOrCreate(name);
  }
};

const getOrCreate = (name: string) =>
  // getOrCreate only falls back to create on not_found. Sandbox.get in a bare
  // try/catch also treated auth and network failures as "missing" and tried to
  // create a second sandbox under the same name.
  Sandbox.getOrCreate({
    name,
    // Applies only when the sandbox is first created. The model writes the code
    // and support tickets carry customer-written text, so a prompt injection
    // could otherwise send customer data out. No egress also means no pip:
    // Python is stdlib only (json, csv, sqlite3, statistics).
    networkPolicy: "deny-all",
    // persistent: true is the beta default; auto-snapshots on stop, auto-resumes on next get
    snapshotExpiration: 7 * 24 * 60 * 60 * 1000, // 7 days
    timeout: 2700000, // 45 minutes
  });

/**
 * Write a tool result into the sandbox as JSON and return its path, or null if
 * the sandbox is unavailable. Callers still return the data inline, so a
 * sandbox outage degrades the agent to read-only instead of breaking the tool.
 */
export async function saveToSandbox(kind: string, data: unknown): Promise<string | null> {
  try {
    const sandbox = await createOrGetSandbox(SANDBOX_NAME);
    const path = `${SANDBOX_DATA_DIR}/${kind}-${Date.now().toString(36)}.json`;
    await sandbox.writeFiles([{ path, content: JSON.stringify(data) }]);
    return path;
  } catch (err) {
    console.error(`[sandbox] couldn't save ${kind} result`, err);
    return null;
  }
}
