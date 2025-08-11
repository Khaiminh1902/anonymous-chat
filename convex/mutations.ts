import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: {
    codename: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_codename", (q) => q.eq("codename", args.codename))
      .first();

    if (existingUser) {
      throw new Error("Codename already exists");
    }

    const base = Math.random().toString(36).slice(2, 8);
    const userCode = `${base}-${Date.now().toString(36).slice(-3)}`;

    const userId = await ctx.db.insert("users", {
      codename: args.codename,
      passwordHash: args.passwordHash,
      createdAt: Date.now(),
      userCode,
    });

    return userId;
  },
});

export const createServer = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    userId: v.id("users"),
    isPrivate: v.boolean(),
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const serverId = await ctx.db.insert("servers", {
      name: args.name,
      description: args.description,
      createdBy: args.userId,
      createdAt: Date.now(),
      isPrivate: args.isPrivate,
      password: args.password,
    });

    await ctx.db.insert("serverMembers", {
      serverId,
      userId: args.userId,
      joinedAt: Date.now(),
    });

    return serverId;
  },
});

export const joinServer = mutation({
  args: {
    serverId: v.id("servers"),
    userId: v.id("users"),
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const server = await ctx.db.get(args.serverId);
    if (!server) throw new Error("Server not found");

    if (server.isPrivate && server.password !== args.password) {
      throw new Error("Invalid server password");
    }

    const existingMember = await ctx.db
      .query("serverMembers")
      .withIndex("by_server_user", (q) =>
        q.eq("serverId", args.serverId).eq("userId", args.userId)
      )
      .first();

    if (existingMember) {
      return true;
    }

    await ctx.db.insert("serverMembers", {
      serverId: args.serverId,
      userId: args.userId,
      joinedAt: Date.now(),
    });

    return true;
  },
});

export const sendMessage = mutation({
  args: {
    content: v.string(),
    serverId: v.id("servers"),
    userId: v.id("users"),
    isAnonymous: v.boolean(),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("serverMembers")
      .withIndex("by_server_user", (q) =>
        q.eq("serverId", args.serverId).eq("userId", args.userId)
      )
      .first();

    if (!membership) {
      throw new Error("User is not a member of this server");
    }

    const messageId = await ctx.db.insert("messages", {
      content: args.content,
      serverId: args.serverId,
      userId: args.userId,
      isAnonymous: args.isAnonymous,
      timestamp: Date.now(),
    });

    return messageId;
  },
});

export const inviteToPrivateServer = mutation({
  args: {
    serverId: v.id("servers"),
    ownerId: v.id("users"),
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const server = await ctx.db.get(args.serverId);
    if (!server) throw new Error("Server not found");

    if (server.createdBy !== args.ownerId) {
      throw new Error("Only the server owner can invite members");
    }

    const existingMember = await ctx.db
      .query("serverMembers")
      .withIndex("by_server_user", (q) => q.eq("serverId", args.serverId).eq("userId", args.targetUserId))
      .first();

    if (existingMember) return true;

    await ctx.db.insert("serverMembers", {
      serverId: args.serverId,
      userId: args.targetUserId,
      joinedAt: Date.now(),
    });

    return true;
  },
});

export const deleteExpiredMessages = mutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const oldMessages = await ctx.db
      .query("messages")
      .withIndex("by_timestamp")
      .filter((q) => q.lt(q.field("timestamp"), cutoff))
      .collect();

    for (const msg of oldMessages) {
      await ctx.db.delete(msg._id);
    }

    return oldMessages.length;
  },
});
