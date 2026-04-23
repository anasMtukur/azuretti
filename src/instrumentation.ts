export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { bootstrapStorage } = await import("@/lib/storage");
    await bootstrapStorage();
  }
}