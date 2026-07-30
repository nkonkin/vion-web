import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertAdmin } from "./lib/admin";

const linkValidator = v.object({
  _id: v.id("links"),
  _creationTime: v.number(),
  label: v.string(),
  url: v.string(),
  sortOrder: v.number(),
});

/** Curated socials + DSPs for Vion Konger */
export const OFFICIAL_LINKS: { label: string; url: string; sortOrder: number }[] = [
  // DSPs
  {
    label: "Spotify",
    url: "https://open.spotify.com/artist/30IONe5gqXy6MXSNHVCCYP",
    sortOrder: 100,
  },
  {
    label: "Apple Music",
    url: "https://music.apple.com/artist/vion-konger/1089085575",
    sortOrder: 99,
  },
  {
    label: "Deezer",
    url: "https://www.deezer.com/artist/9962704",
    sortOrder: 98,
  },
  {
    label: "Amazon Music",
    url: "https://music.amazon.com/search/Vion%20Konger",
    sortOrder: 97,
  },
  {
    label: "Tidal",
    url: "https://listen.tidal.com/search?q=Vion%20Konger",
    sortOrder: 96,
  },
  {
    label: "YouTube Music",
    url: "https://music.youtube.com/search?q=Vion%20Konger",
    sortOrder: 95,
  },
  {
    label: "SoundCloud",
    url: "https://soundcloud.com/vionkonger",
    sortOrder: 94,
  },
  {
    label: "Beatport",
    url: "https://www.beatport.com/artist/vion-konger/539854",
    sortOrder: 93,
  },
  // Socials
  {
    label: "Instagram",
    url: "https://www.instagram.com/vionkonger/",
    sortOrder: 80,
  },
  {
    label: "TikTok",
    url: "https://www.tiktok.com/@vionkonger",
    sortOrder: 79,
  },
  {
    label: "Facebook",
    url: "https://www.facebook.com/VionKonger/",
    sortOrder: 78,
  },
  {
    label: "Linktree",
    url: "https://linktr.ee/vionkonger",
    sortOrder: 70,
  },
  // Booking
  {
    label: "Booking",
    url: "mailto:booking@vionkonger.com",
    sortOrder: 10,
  },
];

export const list = query({
  args: {},
  returns: v.array(linkValidator),
  handler: async (ctx) => {
    const links = await ctx.db
      .query("links")
      .withIndex("by_sort_order")
      .order("desc")
      .collect();
    return links;
  },
});

export const create = mutation({
  args: {
    adminSecret: v.string(),
    label: v.string(),
    url: v.string(),
    sortOrder: v.number(),
  },
  returns: v.id("links"),
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    return await ctx.db.insert("links", {
      label: args.label,
      url: args.url,
      sortOrder: args.sortOrder,
    });
  },
});

export const update = mutation({
  args: {
    adminSecret: v.string(),
    id: v.id("links"),
    label: v.string(),
    url: v.string(),
    sortOrder: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    await ctx.db.patch(args.id, {
      label: args.label,
      url: args.url,
      sortOrder: args.sortOrder,
    });
    return null;
  },
});

export const remove = mutation({
  args: {
    adminSecret: v.string(),
    id: v.id("links"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    await ctx.db.delete(args.id);
    return null;
  },
});

export const seedOfficial = mutation({
  args: {
    adminSecret: v.string(),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);

    const existing = await ctx.db.query("links").collect();
    for (const link of existing) {
      await ctx.db.delete(link._id);
    }

    for (const link of OFFICIAL_LINKS) {
      await ctx.db.insert("links", link);
    }

    return OFFICIAL_LINKS.length;
  },
});
