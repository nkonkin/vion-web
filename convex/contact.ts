import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertAdmin } from "./lib/admin";

const messageValidator = v.object({
  _id: v.id("contactMessages"),
  _creationTime: v.number(),
  name: v.string(),
  email: v.string(),
  message: v.string(),
  createdAt: v.number(),
});

export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
  },
  returns: v.id("contactMessages"),
  handler: async (ctx, args) => {
    const trimmedName = args.name.trim();
    const trimmedEmail = args.email.trim().toLowerCase();
    const trimmedMessage = args.message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      throw new Error("All fields are required");
    }

    if (!trimmedEmail.includes("@")) {
      throw new Error("Invalid email address");
    }

    const recent = await ctx.db
      .query("contactMessages")
      .withIndex("by_email_and_created", (q) => q.eq("email", trimmedEmail))
      .order("desc")
      .take(1);

    const oneMinuteAgo = Date.now() - 60_000;
    if (recent[0] && recent[0].createdAt > oneMinuteAgo) {
      throw new Error("Please wait before sending another message");
    }

    return await ctx.db.insert("contactMessages", {
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: { adminSecret: v.string() },
  returns: v.array(messageValidator),
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const messages = await ctx.db.query("contactMessages").order("desc").collect();
    return messages;
  },
});
