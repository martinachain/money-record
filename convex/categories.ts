import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * 获取所有类别
 */
export const list = query({
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_name")
      .collect();
    return categories;
  },
});

/**
 * 创建新类别
 */
export const create = mutation({
  args: {
    name: v.string(),
    icon: v.optional(v.string()),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const categoryId = await ctx.db.insert("categories", {
      name: args.name,
      icon: args.icon ?? undefined,
      type: args.type,
      createdAt: now,
      updatedAt: now,
    });
    return await ctx.db.get(categoryId);
  },
});
