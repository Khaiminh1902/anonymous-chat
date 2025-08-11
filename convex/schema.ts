import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    codename: v.string(),
    passwordHash: v.string(),
    createdAt: v.number(),
    userCode: v.string(),
  }).index("by_codename", ["codename"]).index("by_user_code", ["userCode"]),

  servers: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    isPrivate: v.boolean(),
    password: v.optional(v.string()),
  }).index("by_created_at", ["createdAt"]),

  messages: defineTable({
    content: v.string(),
    serverId: v.id("servers"),
    userId: v.id("users"),
    isAnonymous: v.boolean(),
    timestamp: v.number(),
  }).index("by_server_timestamp", ["serverId", "timestamp"]).index("by_timestamp", ["timestamp"]),

  serverMembers: defineTable({
    serverId: v.id("servers"),
    userId: v.id("users"),
    joinedAt: v.number(),
  }).index("by_server", ["serverId"])
    .index("by_user", ["userId"])
    .index("by_server_user", ["serverId", "userId"]),
});
