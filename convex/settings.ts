import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { assertAdmin } from "./lib/admin";

const settingsValidator = v.object({
  _id: v.id("siteSettings"),
  _creationTime: v.number(),
  key: v.literal("default"),
  instagram: v.optional(v.string()),
  spotify: v.optional(v.string()),
  soundcloud: v.optional(v.string()),
  youtube: v.optional(v.string()),
  bookingEmail: v.optional(v.string()),
});

export const get = query({
  args: {},
  returns: v.union(settingsValidator, v.null()),
  handler: async (ctx) => {
    return await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "default"))
      .unique();
  },
});

export const getInternal = internalQuery({
  args: {},
  returns: v.union(settingsValidator, v.null()),
  handler: async (ctx) => {
    return await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "default"))
      .unique();
  },
});

export const update = mutation({
  args: {
    adminSecret: v.string(),
    instagram: v.optional(v.string()),
    spotify: v.optional(v.string()),
    soundcloud: v.optional(v.string()),
    youtube: v.optional(v.string()),
    bookingEmail: v.optional(v.string()),
  },
  returns: v.id("siteSettings"),
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);

    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "default"))
      .unique();

    const data = {
      instagram: args.instagram,
      spotify: args.spotify,
      soundcloud: args.soundcloud,
      youtube: args.youtube,
      bookingEmail: args.bookingEmail,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    }

    return await ctx.db.insert("siteSettings", {
      key: "default",
      ...data,
    });
  },
});
