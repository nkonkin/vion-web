import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertAdmin } from "./lib/admin";

const showValidator = v.object({
  _id: v.id("shows"),
  _creationTime: v.number(),
  date: v.string(),
  venue: v.string(),
  city: v.string(),
  country: v.string(),
  ticketUrl: v.optional(v.string()),
  soldOut: v.optional(v.boolean()),
  bandsintownId: v.optional(v.string()),
});

export const listUpcoming = query({
  args: { today: v.string() },
  returns: v.array(showValidator),
  handler: async (ctx, args) => {
    const year = args.today.slice(0, 4);
    const shows = await ctx.db
      .query("shows")
      .withIndex("by_date")
      .collect();

    return shows
      .filter((show) => show.date.startsWith(year) && show.date >= args.today)
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});

export const listAll = query({
  args: {
    today: v.optional(v.string()),
  },
  returns: v.array(showValidator),
  handler: async (ctx, args) => {
    const shows = await ctx.db
      .query("shows")
      .withIndex("by_date")
      .collect();

    const today = args.today;
    const year = today?.slice(0, 4);
    const scoped = year
      ? shows.filter((show) => show.date.startsWith(year))
      : shows;

    if (!today) {
      return scoped.sort((a, b) => b.date.localeCompare(a.date));
    }

    return scoped.sort((a, b) => {
      const aUpcoming = a.date >= today;
      const bUpcoming = b.date >= today;
      if (aUpcoming !== bUpcoming) {
        return aUpcoming ? -1 : 1;
      }
      return aUpcoming
        ? a.date.localeCompare(b.date)
        : b.date.localeCompare(a.date);
    });
  },
});

export const create = mutation({
  args: {
    adminSecret: v.string(),
    date: v.string(),
    venue: v.string(),
    city: v.string(),
    country: v.string(),
    ticketUrl: v.optional(v.string()),
    soldOut: v.optional(v.boolean()),
  },
  returns: v.id("shows"),
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    return await ctx.db.insert("shows", {
      date: args.date,
      venue: args.venue,
      city: args.city,
      country: args.country,
      ticketUrl: args.ticketUrl,
      soldOut: args.soldOut,
    });
  },
});

export const update = mutation({
  args: {
    adminSecret: v.string(),
    id: v.id("shows"),
    date: v.string(),
    venue: v.string(),
    city: v.string(),
    country: v.string(),
    ticketUrl: v.optional(v.string()),
    soldOut: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    await ctx.db.patch(args.id, {
      date: args.date,
      venue: args.venue,
      city: args.city,
      country: args.country,
      ticketUrl: args.ticketUrl,
      soldOut: args.soldOut,
    });
    return null;
  },
});

export const remove = mutation({
  args: {
    adminSecret: v.string(),
    id: v.id("shows"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    await ctx.db.delete(args.id);
    return null;
  },
});
