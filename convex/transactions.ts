import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * 获取当前用户的所有交易记录
 */
export const list = query({
  args: {
    userId: v.string(), // 临时：从客户端传递，后续改为从认证获取
  },
  handler: async (ctx, args) => {
    const userId = args.userId;

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // 获取关联的类别信息
    const transactionsWithCategories = await Promise.all(
      transactions.map(async (tx) => {
        const category = await ctx.db.get(tx.categoryId);
        return {
          ...tx,
          category: category
            ? {
                id: category._id,
                name: category.name,
                icon: category.icon,
              }
            : null,
        };
      })
    );

    return transactionsWithCategories;
  },
});

/**
 * 创建交易记录
 */
export const create = mutation({
  args: {
    amount: v.number(),
    type: v.string(),
    date: v.string(), // ISO 日期字符串
    note: v.optional(v.string()),
    categoryId: v.id("categories"),
    userId: v.string(), // 临时：从客户端传递，后续改为从认证获取
  },
  handler: async (ctx, args) => {
    const userId = args.userId;

    const date = new Date(args.date).getTime();
    const now = Date.now();

    const transactionId = await ctx.db.insert("transactions", {
      amount: args.amount,
      type: args.type,
      date,
      note: args.note ?? undefined,
      userId,
      categoryId: args.categoryId,
      createdAt: now,
      updatedAt: now,
    });

    const transaction = await ctx.db.get(transactionId);
    const category = await ctx.db.get(args.categoryId);

    return {
      ...transaction,
      category: category
        ? {
            id: category._id,
            name: category.name,
            icon: category.icon,
          }
        : null,
    };
  },
});

/**
 * 删除交易记录
 */
export const remove = mutation({
  args: {
    id: v.id("transactions"),
    userId: v.string(), // 临时：从客户端传递，后续改为从认证获取
  },
  handler: async (ctx, args) => {
    const userId = args.userId;

    const transaction = await ctx.db.get(args.id);
    if (!transaction) {
      throw new Error("交易记录不存在");
    }

    if (transaction.userId !== userId) {
      throw new Error("无权删除此交易");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});
