import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * 获取指定月份的预算
 */
export const list = query({
  args: {
    month: v.number(),
    year: v.number(),
    userId: v.string(), // 临时：从客户端传递，后续改为从认证获取
  },
  handler: async (ctx, args) => {
    const userId = args.userId;

    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_userId_month_year", (q) =>
        q.eq("userId", userId).eq("month", args.month).eq("year", args.year)
      )
      .collect();

    // 获取关联的类别信息
    const budgetsWithCategories = await Promise.all(
      budgets.map(async (budget) => {
        const category = await ctx.db.get(budget.categoryId);
        return {
          ...budget,
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

    return budgetsWithCategories;
  },
});

/**
 * 创建或更新预算
 */
export const upsert = mutation({
  args: {
    categoryId: v.id("categories"),
    month: v.number(),
    year: v.number(),
    amount: v.number(),
    userId: v.string(), // 临时：从客户端传递，后续改为从认证获取
  },
  handler: async (ctx, args) => {
    const userId = args.userId;

    // 查找是否已存在
    const existing = await ctx.db
      .query("budgets")
      .withIndex("by_userId_month_year", (q) =>
        q.eq("userId", userId).eq("month", args.month).eq("year", args.year)
      )
      .filter((q) => q.eq(q.field("categoryId"), args.categoryId))
      .first();

    const now = Date.now();

    if (existing) {
      // 更新现有预算
      await ctx.db.patch(existing._id, {
        amount: args.amount,
        updatedAt: now,
      });
      const updated = await ctx.db.get(existing._id);
      const category = await ctx.db.get(args.categoryId);
      return {
        ...updated,
        category: category
          ? {
              id: category._id,
              name: category.name,
              icon: category.icon,
            }
          : null,
      };
    } else {
      // 创建新预算
      const budgetId = await ctx.db.insert("budgets", {
        month: args.month,
        year: args.year,
        amount: args.amount,
        userId,
        categoryId: args.categoryId,
        createdAt: now,
        updatedAt: now,
      });
      const budget = await ctx.db.get(budgetId);
      const category = await ctx.db.get(args.categoryId);
      return {
        ...budget,
        category: category
          ? {
              id: category._id,
              name: category.name,
              icon: category.icon,
            }
          : null,
      };
    }
  },
});

/**
 * 获取预算使用情况（当月支出统计）
 */
export const usage = query({
  args: {
    month: v.number(),
    year: v.number(),
    userId: v.string(), // 临时：从客户端传递，后续改为从认证获取
  },
  handler: async (ctx, args) => {
    const userId = args.userId;

    const startDate = new Date(args.year, args.month - 1, 1).getTime();
    const endDate = new Date(args.year, args.month, 0, 23, 59, 59, 999).getTime();

    // 获取当月所有支出交易
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId_date", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), "EXPENSE"),
          q.gte(q.field("date"), startDate),
          q.lte(q.field("date"), endDate)
        )
      )
      .collect();

    // 按类别分组统计
    const usageMap = new Map<string, number>();
    for (const tx of transactions) {
      const categoryId = tx.categoryId;
      const current = usageMap.get(categoryId) || 0;
      usageMap.set(categoryId, current + tx.amount);
    }

    // 转换为数组格式
    return Array.from(usageMap.entries()).map(([categoryId, amount]) => ({
      categoryId: categoryId as any, // 保持为 Id<"categories"> 类型
      _sum: { amount },
    }));
  },
});
