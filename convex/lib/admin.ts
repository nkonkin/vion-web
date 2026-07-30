export function assertAdmin(adminSecret: string | undefined): void {
  const expected = process.env.ADMIN_SECRET;
  if (!expected || !adminSecret || adminSecret !== expected) {
    throw new Error("Unauthorized");
  }
}
