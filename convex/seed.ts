import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { assertAdmin } from "./lib/admin";
import { OFFICIAL_LINKS } from "./links";

export const seed = mutation({
  args: { adminSecret: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);

    const existingReleases = await ctx.db.query("releases").take(1);
    if (existingReleases.length === 0) {
      await ctx.db.insert("releases", {
        title: "Midnight Signal",
        artists: "Vion Konger",
        coverUrl: "",
        linkUrl: "https://open.spotify.com",
        releasedAt: "2026-01-15",
        sortOrder: 3,
      });
      await ctx.db.insert("releases", {
        title: "Afterglow",
        artists: "Vion Konger",
        coverUrl: "",
        linkUrl: "https://open.spotify.com",
        releasedAt: "2025-09-20",
        sortOrder: 2,
      });
      await ctx.db.insert("releases", {
        title: "Static Bloom",
        artists: "Vion Konger",
        coverUrl: "",
        linkUrl: "https://open.spotify.com",
        releasedAt: "2025-05-10",
        sortOrder: 1,
      });
    }

    // Tour dates come from Bandsintown sync — no placeholder shows

    const existingSettings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "default"))
      .unique();

    if (!existingSettings) {
      await ctx.db.insert("siteSettings", {
        key: "default",
        instagram: "https://www.instagram.com/vionkonger/",
        spotify: "https://open.spotify.com/artist/30IONe5gqXy6MXSNHVCCYP",
        soundcloud: "https://soundcloud.com/vionkonger",
        youtube: "https://music.youtube.com/search?q=Vion%20Konger",
        bookingEmail: "booking@vionkonger.com",
      });
    }

    const existingLinks = await ctx.db.query("links").take(1);
    if (existingLinks.length === 0) {
      for (const link of OFFICIAL_LINKS) {
        await ctx.db.insert("links", link);
      }
    }

    // Livesets come from YouTube playlist sync — no placeholders

    return null;
  },
});
