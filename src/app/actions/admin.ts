"use server";

import { fetchAction, fetchMutation, fetchQuery } from "convex/nextjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

const SESSION_COOKIE = "vk_admin_session";

async function requireAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session?.value) {
    throw new Error("Unauthorized");
  }
}

function getAdminSecret() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SECRET is not configured");
  }
  return secret;
}

export async function loginAdmin(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || password !== expected) {
    throw new Error("Invalid password");
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  revalidatePath("/admin");
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function seedContent() {
  await requireAdminSession();
  await fetchMutation(api.seed.seed, { adminSecret: getAdminSecret() });
  revalidatePath("/");
  revalidatePath("/");
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function createRelease(data: {
  title: string;
  artists: string;
  coverUrl?: string;
  linkUrl: string;
  releasedAt: string;
  sortOrder: number;
}) {
  await requireAdminSession();
  await fetchMutation(api.releases.create, {
    adminSecret: getAdminSecret(),
    ...data,
  });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateRelease(data: {
  id: Id<"releases">;
  title: string;
  artists: string;
  coverUrl?: string;
  linkUrl: string;
  releasedAt: string;
  sortOrder: number;
}) {
  await requireAdminSession();
  await fetchMutation(api.releases.update, {
    adminSecret: getAdminSecret(),
    ...data,
  });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteRelease(id: Id<"releases">) {
  await requireAdminSession();
  await fetchMutation(api.releases.remove, {
    adminSecret: getAdminSecret(),
    id,
  });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function syncSpotifyReleases() {
  await requireAdminSession();
  const result = await fetchAction(api.spotifySync.syncNow, {
    adminSecret: getAdminSecret(),
  });
  revalidatePath("/");
  revalidatePath("/admin");
  return result;
}

export async function syncBandsintownShows() {
  await requireAdminSession();
  const result = await fetchAction(api.bandsintownSync.syncNow, {
    adminSecret: getAdminSecret(),
  });
  revalidatePath("/");
  revalidatePath("/admin");
  return result;
}

export async function syncYoutubeLivesets() {
  await requireAdminSession();
  const result = await fetchAction(api.youtubeSync.syncNow, {
    adminSecret: getAdminSecret(),
  });
  revalidatePath("/");
  revalidatePath("/admin");
  return result;
}

export async function createShow(data: {
  date: string;
  venue: string;
  city: string;
  country: string;
  ticketUrl?: string;
  soldOut?: boolean;
}) {
  await requireAdminSession();
  await fetchMutation(api.shows.create, {
    adminSecret: getAdminSecret(),
    ...data,
  });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateShow(data: {
  id: Id<"shows">;
  date: string;
  venue: string;
  city: string;
  country: string;
  ticketUrl?: string;
  soldOut?: boolean;
}) {
  await requireAdminSession();
  await fetchMutation(api.shows.update, {
    adminSecret: getAdminSecret(),
    ...data,
  });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteShow(id: Id<"shows">) {
  await requireAdminSession();
  await fetchMutation(api.shows.remove, {
    adminSecret: getAdminSecret(),
    id,
  });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateSettings(data: {
  instagram?: string;
  spotify?: string;
  soundcloud?: string;
  youtube?: string;
  bookingEmail?: string;
}) {
  await requireAdminSession();
  await fetchMutation(api.settings.update, {
    adminSecret: getAdminSecret(),
    ...data,
  });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function getContactMessages() {
  await requireAdminSession();
  return fetchQuery(api.contact.list, { adminSecret: getAdminSecret() });
}

export async function seedOfficialLinks() {
  await requireAdminSession();
  const count = await fetchMutation(api.links.seedOfficial, {
    adminSecret: getAdminSecret(),
  });
  revalidatePath("/");
  revalidatePath("/admin");
  return count;
}

export async function createLink(data: {
  label: string;
  url: string;
  sortOrder: number;
}) {
  await requireAdminSession();
  await fetchMutation(api.links.create, {
    adminSecret: getAdminSecret(),
    ...data,
  });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteLink(id: Id<"links">) {
  await requireAdminSession();
  await fetchMutation(api.links.remove, {
    adminSecret: getAdminSecret(),
    id,
  });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function createLiveset(data: {
  title: string;
  recordedAt: string;
  venue?: string;
  city?: string;
  url: string;
  coverUrl?: string;
  sortOrder: number;
}) {
  await requireAdminSession();
  await fetchMutation(api.livesets.create, {
    adminSecret: getAdminSecret(),
    ...data,
  });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteLiveset(id: Id<"livesets">) {
  await requireAdminSession();
  await fetchMutation(api.livesets.remove, {
    adminSecret: getAdminSecret(),
    id,
  });
  revalidatePath("/");
  revalidatePath("/admin");
}
