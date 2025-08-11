import { query } from "./_generated/server";
import { v } from "convex/values";

export const getUserByCodename = query({
  args: { codename: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_codename", (q) => q.eq("codename", args.codename))
      .first();
  },
});

export const getUserByCode = query({
  args: { userCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_user_code", (q) => q.eq("userCode", args.userCode))
      .first();
  },
});

export const searchUsersByCodename = query({
  args: { q: v.string() },
  handler: async (ctx, args) => {
    const term = args.q.toLowerCase();
    const results = await ctx.db
      .query("users")
      .withIndex("by_codename")
      .collect();

    return results
      .filter((u) => u.codename.toLowerCase().includes(term))
      .slice(0, 20)
      .map((u) => ({ _id: u._id, codename: u.codename, userCode: (u as any).userCode }));
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const authenticateUser = query({
  args: {
    codename: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_codename", (q) => q.eq("codename", args.codename))
      .first();

    if (!user || user.passwordHash !== args.passwordHash) {
      return null;
    }

    return user;
  },
});

export const getPublicServers = query({
  handler: async (ctx) => {
    const servers = await ctx.db
      .query("servers")
      .withIndex("by_created_at")
      .filter((q) => q.eq(q.field("isPrivate"), false))
      .collect();

    const serversWithMemberCount = await Promise.all(
      servers.map(async (server) => {
        const memberCount = await ctx.db
          .query("serverMembers")
          .withIndex("by_server", (q) => q.eq("serverId", server._id))
          .collect();

        const creator = await ctx.db.get(server.createdBy);

        return {
          ...server,
          memberCount: memberCount.length,
          creatorCodename: creator?.codename || "Unknown",
        };
      })
    );

    return serversWithMemberCount;
  },
});

export const getUserServers = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("serverMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const servers = await Promise.all(
      memberships.map(async (membership) => {
        const server = await ctx.db.get(membership.serverId);
        if (!server) return null;

        const memberCount = await ctx.db
          .query("serverMembers")
          .withIndex("by_server", (q) => q.eq("serverId", server._id))
          .collect();

        const creator = await ctx.db.get(server.createdBy);

        return {
          ...server,
          memberCount: memberCount.length,
          creatorCodename: creator?.codename || "Unknown",
          joinedAt: membership.joinedAt,
        };
      })
    );

    return servers.filter(Boolean);
  },
});

export const getServerMessages = query({
  args: {
    serverId: v.id("servers"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("serverMembers")
      .withIndex("by_server_user", (q) =>
        q.eq("serverId", args.serverId).eq("userId", args.userId)
      )
      .first();

    if (!membership) {
      throw new Error("Access denied: Not a member of this server");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_server_timestamp", (q) => q.eq("serverId", args.serverId))
      .order("desc")
      .take(100);

    const messagesWithUserInfo = await Promise.all(
      messages.map(async (message) => {
        if (message.isAnonymous) {
          return {
            ...message,
            authorCodename: "Anonymous",
          };
        } else {
          const user = await ctx.db.get(message.userId);
          return {
            ...message,
            authorCodename: user?.codename || "Unknown",
          };
        }
      })
    );

    return messagesWithUserInfo.reverse();
  },
});

export const getServerInfo = query({
  args: { serverId: v.id("servers") },
  handler: async (ctx, args) => {
    const server = await ctx.db.get(args.serverId);
    if (!server) return null;

    const memberCount = await ctx.db
      .query("serverMembers")
      .withIndex("by_server", (q) => q.eq("serverId", server._id))
      .collect();

    const creator = await ctx.db.get(server.createdBy);

    return {
      ...server,
      memberCount: memberCount.length,
      creatorCodename: creator?.codename || "Unknown",
    };
  },
});

export const getUserProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return { _id: user._id, codename: user.codename, userCode: (user as any).userCode };
  },
});
