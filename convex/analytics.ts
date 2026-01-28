import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * 获取类别支出占比（饼图数据）
 */
export const categoryBreakdown = query({
  args: {
    month: v.optional(v.number()),
    year: v.optional(v.number()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    viewMode: v.optional(v.string()),
    userId: v.string(), // 临时：从客户端传递，后续改为从认证获取
  },
  handler: async (ctx, args) => {
    const userId = args.userId;

    let startTime: number;
    let endTime: number;

    if (args.viewMode === "custom" && args.startDate && args.endDate) {
      startTime = new Date(args.startDate).setHours(0, 0, 0, 0);
      endTime = new Date(args.endDate).setHours(23, 59, 59, 999);
    } else if (args.viewMode === "day" && args.startDate) {
      startTime = new Date(args.startDate).setHours(0, 0, 0, 0);
      endTime = new Date(args.startDate).setHours(23, 59, 59, 999);
    } else {
      const m = args.month || new Date().getMonth() + 1;
      const y = args.year || new Date().getFullYear();
      startTime = new Date(y, m - 1, 1).getTime();
      endTime = new Date(y, m, 0, 23, 59, 59, 999).getTime();
    }

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId_date", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), "EXPENSE"),
          q.gte(q.field("date"), startTime),
          q.lte(q.field("date"), endTime)
        )
      )
      .collect();

    // 按类别分组统计
    const breakdown = new Map<string, number>();
    for (const tx of transactions) {
      const current = breakdown.get(tx.categoryId) || 0;
      breakdown.set(tx.categoryId, current + tx.amount);
    }

    // 获取类别信息
    const result = await Promise.all(
      Array.from(breakdown.entries()).map(async ([categoryId, value]) => {
        const category = await ctx.db.get(categoryId as any);
        return {
          name: category?.name || "未知",
          icon: category?.icon || "",
          value,
        };
      })
    );

    return result;
  },
});

/**
 * 获取收入分类占比
 */
export const incomeBreakdown = query({
  args: {
    month: v.optional(v.number()),
    year: v.optional(v.number()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    viewMode: v.optional(v.string()),
    userId: v.string(), // 临时：从客户端传递，后续改为从认证获取
  },
  handler: async (ctx, args) => {
    const userId = args.userId;

    let startTime: number;
    let endTime: number;

    if (args.viewMode === "custom" && args.startDate && args.endDate) {
      startTime = new Date(args.startDate).setHours(0, 0, 0, 0);
      endTime = new Date(args.endDate).setHours(23, 59, 59, 999);
    } else if (args.viewMode === "day" && args.startDate) {
      startTime = new Date(args.startDate).setHours(0, 0, 0, 0);
      endTime = new Date(args.startDate).setHours(23, 59, 59, 999);
    } else {
      const m = args.month || new Date().getMonth() + 1;
      const y = args.year || new Date().getFullYear();
      startTime = new Date(y, m - 1, 1).getTime();
      endTime = new Date(y, m, 0, 23, 59, 59, 999).getTime();
    }

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId_date", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), "INCOME"),
          q.gte(q.field("date"), startTime),
          q.lte(q.field("date"), endTime)
        )
      )
      .collect();

    const breakdown = new Map<string, number>();
    for (const tx of transactions) {
      const current = breakdown.get(tx.categoryId) || 0;
      breakdown.set(tx.categoryId, current + tx.amount);
    }

    const result = await Promise.all(
      Array.from(breakdown.entries()).map(async ([categoryId, value]) => {
        const category = await ctx.db.get(categoryId as any);
        return {
          name: category?.name || "未知",
          icon: category?.icon || "",
          value,
        };
      })
    );

    return result;
  },
});

/**
 * 获取趋势数据
 */
export const trend = query({
  args: {
    viewMode: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    userId: v.string(), // 临时：从客户端传递，后续改为从认证获取
  },
  handler: async (ctx, args) => {
    const userId = args.userId;

    const now = new Date();
    const results: Array<{
      month: string;
      year: number;
      amount: number;
      income: number;
    }> = [];

    if (args.viewMode === "custom" && args.startDate && args.endDate) {
      // 自定义时间段
      const start = new Date(args.startDate);
      const end = new Date(args.endDate);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff <= 14) {
        // 按天显示
        for (let i = 0; i <= daysDiff; i++) {
          const date = new Date(start);
          date.setDate(start.getDate() + i);
          const dayStart = new Date(date).setHours(0, 0, 0, 0);
          const dayEnd = new Date(date).setHours(23, 59, 59, 999);

          const [expenses, incomes] = await Promise.all([
            ctx.db
              .query("transactions")
              .withIndex("by_userId_date", (q) => q.eq("userId", userId))
              .filter((q) =>
                q.and(
                  q.eq(q.field("type"), "EXPENSE"),
                  q.gte(q.field("date"), dayStart),
                  q.lte(q.field("date"), dayEnd)
                )
              )
              .collect(),
            ctx.db
              .query("transactions")
              .withIndex("by_userId_date", (q) => q.eq("userId", userId))
              .filter((q) =>
                q.and(
                  q.eq(q.field("type"), "INCOME"),
                  q.gte(q.field("date"), dayStart),
                  q.lte(q.field("date"), dayEnd)
                )
              )
              .collect(),
          ]);

          results.push({
            month: `${date.getMonth() + 1}/${date.getDate()}`,
            year: date.getFullYear(),
            amount: expenses.reduce((sum, t) => sum + t.amount, 0),
            income: incomes.reduce((sum, t) => sum + t.amount, 0),
          });
        }
      } else if (daysDiff <= 90) {
        // 按周显示
        const weeks = Math.ceil(daysDiff / 7);
        for (let i = 0; i < weeks; i++) {
          const weekStart = new Date(start);
          weekStart.setDate(start.getDate() + i * 7);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          if (weekEnd > end) weekEnd.setTime(end.getTime());

          const weekStartTime = weekStart.setHours(0, 0, 0, 0);
          const weekEndTime = weekEnd.setHours(23, 59, 59, 999);

          const [expenses, incomes] = await Promise.all([
            ctx.db
              .query("transactions")
              .withIndex("by_userId_date", (q) => q.eq("userId", userId))
              .filter((q) =>
                q.and(
                  q.eq(q.field("type"), "EXPENSE"),
                  q.gte(q.field("date"), weekStartTime),
                  q.lte(q.field("date"), weekEndTime)
                )
              )
              .collect(),
            ctx.db
              .query("transactions")
              .withIndex("by_userId_date", (q) => q.eq("userId", userId))
              .filter((q) =>
                q.and(
                  q.eq(q.field("type"), "INCOME"),
                  q.gte(q.field("date"), weekStartTime),
                  q.lte(q.field("date"), weekEndTime)
                )
              )
              .collect(),
          ]);

          results.push({
            month: `${weekStart.getMonth() + 1}/${weekStart.getDate()}周`,
            year: weekStart.getFullYear(),
            amount: expenses.reduce((sum, t) => sum + t.amount, 0),
            income: incomes.reduce((sum, t) => sum + t.amount, 0),
          });
        }
      } else {
        // 按月显示
        const current = new Date(start.getFullYear(), start.getMonth(), 1);
        while (current <= end) {
          const monthStart = new Date(current);
          const monthEnd = new Date(
            current.getFullYear(),
            current.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
          );

          const monthStartTime = monthStart.getTime();
          const monthEndTime = monthEnd.getTime();

          const [expenses, incomes] = await Promise.all([
            ctx.db
              .query("transactions")
              .withIndex("by_userId_date", (q) => q.eq("userId", userId))
              .filter((q) =>
                q.and(
                  q.eq(q.field("type"), "EXPENSE"),
                  q.gte(q.field("date"), monthStartTime),
                  q.lte(q.field("date"), monthEndTime)
                )
              )
              .collect(),
            ctx.db
              .query("transactions")
              .withIndex("by_userId_date", (q) => q.eq("userId", userId))
              .filter((q) =>
                q.and(
                  q.eq(q.field("type"), "INCOME"),
                  q.gte(q.field("date"), monthStartTime),
                  q.lte(q.field("date"), monthEndTime)
                )
              )
              .collect(),
          ]);

          results.push({
            month: `${current.getMonth() + 1}月`,
            year: current.getFullYear(),
            amount: expenses.reduce((sum, t) => sum + t.amount, 0),
            income: incomes.reduce((sum, t) => sum + t.amount, 0),
          });

          current.setMonth(current.getMonth() + 1);
        }
      }
    } else if (args.viewMode === "day") {
      // 过去7天
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dayStart = new Date(date).setHours(0, 0, 0, 0);
        const dayEnd = new Date(date).setHours(23, 59, 59, 999);

        const [expenses, incomes] = await Promise.all([
          ctx.db
            .query("transactions")
            .withIndex("by_userId_date", (q) => q.eq("userId", userId))
            .filter((q) =>
              q.and(
                q.eq(q.field("type"), "EXPENSE"),
                q.gte(q.field("date"), dayStart),
                q.lte(q.field("date"), dayEnd)
              )
            )
            .collect(),
          ctx.db
            .query("transactions")
            .withIndex("by_userId_date", (q) => q.eq("userId", userId))
            .filter((q) =>
              q.and(
                q.eq(q.field("type"), "INCOME"),
                q.gte(q.field("date"), dayStart),
                q.lte(q.field("date"), dayEnd)
              )
            )
            .collect(),
        ]);

        results.push({
          month: `${date.getMonth() + 1}/${date.getDate()}`,
          year: date.getFullYear(),
          amount: expenses.reduce((sum, t) => sum + t.amount, 0),
          income: incomes.reduce((sum, t) => sum + t.amount, 0),
        });
      }
    } else if (args.viewMode === "week") {
      // 过去4周
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() - i * 7);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const weekStartTime = weekStart.getTime();
        const weekEndTime = weekEnd.getTime();

        const [expenses, incomes] = await Promise.all([
          ctx.db
            .query("transactions")
            .withIndex("by_userId_date", (q) => q.eq("userId", userId))
            .filter((q) =>
              q.and(
                q.eq(q.field("type"), "EXPENSE"),
                q.gte(q.field("date"), weekStartTime),
                q.lte(q.field("date"), weekEndTime)
              )
            )
            .collect(),
          ctx.db
            .query("transactions")
            .withIndex("by_userId_date", (q) => q.eq("userId", userId))
            .filter((q) =>
              q.and(
                q.eq(q.field("type"), "INCOME"),
                q.gte(q.field("date"), weekStartTime),
                q.lte(q.field("date"), weekEndTime)
              )
            )
            .collect(),
        ]);

        results.push({
          month: `${weekStart.getMonth() + 1}/${weekStart.getDate()}周`,
          year: weekStart.getFullYear(),
          amount: expenses.reduce((sum, t) => sum + t.amount, 0),
          income: incomes.reduce((sum, t) => sum + t.amount, 0),
        });
      }
    } else {
      // 过去6个月（默认）
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const startDate = new Date(year, month - 1, 1).getTime();
        const endDate = new Date(year, month, 0, 23, 59, 59, 999).getTime();

        const [expenses, incomes] = await Promise.all([
          ctx.db
            .query("transactions")
            .withIndex("by_userId_date", (q) => q.eq("userId", userId))
            .filter((q) =>
              q.and(
                q.eq(q.field("type"), "EXPENSE"),
                q.gte(q.field("date"), startDate),
                q.lte(q.field("date"), endDate)
              )
            )
            .collect(),
          ctx.db
            .query("transactions")
            .withIndex("by_userId_date", (q) => q.eq("userId", userId))
            .filter((q) =>
              q.and(
                q.eq(q.field("type"), "INCOME"),
                q.gte(q.field("date"), startDate),
                q.lte(q.field("date"), endDate)
              )
            )
            .collect(),
        ]);

        results.push({
          month: `${month}月`,
          year,
          amount: expenses.reduce((sum, t) => sum + t.amount, 0),
          income: incomes.reduce((sum, t) => sum + t.amount, 0),
        });
      }
    }

    return results;
  },
});

/**
 * 获取支出最高的5项
 */
export const topExpenses = query({
  args: {
    month: v.optional(v.number()),
    year: v.optional(v.number()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    viewMode: v.optional(v.string()),
    userId: v.string(), // 临时：从客户端传递，后续改为从认证获取
  },
  handler: async (ctx, args) => {
    const userId = args.userId;

    let startTime: number;
    let endTime: number;

    if (args.viewMode === "custom" && args.startDate && args.endDate) {
      startTime = new Date(args.startDate).setHours(0, 0, 0, 0);
      endTime = new Date(args.endDate).setHours(23, 59, 59, 999);
    } else if (args.viewMode === "day" && args.startDate) {
      startTime = new Date(args.startDate).setHours(0, 0, 0, 0);
      endTime = new Date(args.startDate).setHours(23, 59, 59, 999);
    } else {
      const m = args.month || new Date().getMonth() + 1;
      const y = args.year || new Date().getFullYear();
      startTime = new Date(y, m - 1, 1).getTime();
      endTime = new Date(y, m, 0, 23, 59, 59, 999).getTime();
    }

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId_date", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), "EXPENSE"),
          q.gte(q.field("date"), startTime),
          q.lte(q.field("date"), endTime)
        )
      )
      .collect();

    const sorted = transactions.sort((a, b) => b.amount - a.amount).slice(0, 5);

    const result = await Promise.all(
      sorted.map(async (tx) => {
        const category = await ctx.db.get(tx.categoryId);
        return {
          id: tx._id,
          amount: tx.amount,
          date: new Date(tx.date).toISOString(),
          note: tx.note,
          category: category
            ? {
                name: category.name,
                icon: category.icon,
              }
            : null,
        };
      })
    );

    return result;
  },
});

/**
 * 获取收入最高的5项
 */
export const topIncomes = query({
  args: {
    month: v.optional(v.number()),
    year: v.optional(v.number()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    viewMode: v.optional(v.string()),
    userId: v.string(), // 临时：从客户端传递，后续改为从认证获取
  },
  handler: async (ctx, args) => {
    const userId = args.userId;

    let startTime: number;
    let endTime: number;

    if (args.viewMode === "custom" && args.startDate && args.endDate) {
      startTime = new Date(args.startDate).setHours(0, 0, 0, 0);
      endTime = new Date(args.endDate).setHours(23, 59, 59, 999);
    } else if (args.viewMode === "day" && args.startDate) {
      startTime = new Date(args.startDate).setHours(0, 0, 0, 0);
      endTime = new Date(args.startDate).setHours(23, 59, 59, 999);
    } else {
      const m = args.month || new Date().getMonth() + 1;
      const y = args.year || new Date().getFullYear();
      startTime = new Date(y, m - 1, 1).getTime();
      endTime = new Date(y, m, 0, 23, 59, 59, 999).getTime();
    }

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId_date", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), "INCOME"),
          q.gte(q.field("date"), startTime),
          q.lte(q.field("date"), endTime)
        )
      )
      .collect();

    const sorted = transactions.sort((a, b) => b.amount - a.amount).slice(0, 5);

    const result = await Promise.all(
      sorted.map(async (tx) => {
        const category = await ctx.db.get(tx.categoryId);
        return {
          id: tx._id,
          amount: tx.amount,
          date: new Date(tx.date).toISOString(),
          note: tx.note,
          category: category
            ? {
                name: category.name,
                icon: category.icon,
              }
            : null,
        };
      })
    );

    return result;
  },
});
