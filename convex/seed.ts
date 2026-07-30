import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { assertAdmin } from "./lib/admin";

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

    const existingShows = await ctx.db.query("shows").take(1);
    if (existingShows.length === 0) {
      await ctx.db.insert("shows", {
        date: "2026-04-18",
        venue: "Warehouse",
        city: "Berlin",
        country: "DE",
        ticketUrl: "https://example.com/tickets",
      });
      await ctx.db.insert("shows", {
        date: "2026-05-24",
        venue: "Motion",
        city: "London",
        country: "UK",
        ticketUrl: "https://example.com/tickets",
      });
      await ctx.db.insert("shows", {
        date: "2026-06-14",
        venue: "Output",
        city: "New York",
        country: "US",
        soldOut: false,
      });
    }

    const existingSettings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "default"))
      .unique();

    if (!existingSettings) {
      await ctx.db.insert("siteSettings", {
        key: "default",
        instagram: "https://instagram.com/vionkonger",
        spotify: "https://open.spotify.com",
        soundcloud: "https://soundcloud.com",
        youtube: "https://youtube.com",
        bookingEmail: "booking@vionkonger.com",
      });
    }

    return null;
  },
});
