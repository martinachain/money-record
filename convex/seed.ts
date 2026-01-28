import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * 初始化预设类别
 * 只在数据库为空时运行
 */
export const initializeCategories = mutation({
  handler: async (ctx) => {
    // 检查是否已有类别
    const existingCategories = await ctx.db.query("categories").collect();
    if (existingCategories.length > 0) {
      return { message: "类别已存在，跳过初始化", count: existingCategories.length };
    }

    const categories = [
      // 支出类别
      { name: "餐饮", icon: "🍜", type: "EXPENSE" },
      { name: "交通", icon: "🚗", type: "EXPENSE" },
      { name: "购物", icon: "🛒", type: "EXPENSE" },
      { name: "娱乐", icon: "🎮", type: "EXPENSE" },
      { name: "住房", icon: "🏠", type: "EXPENSE" },
      { name: "医疗", icon: "💊", type: "EXPENSE" },
      { name: "教育", icon: "📚", type: "EXPENSE" },
      { name: "其他支出", icon: "💸", type: "EXPENSE" },
      // 收入类别
      { name: "工资", icon: "💰", type: "INCOME" },
      { name: "奖金", icon: "🎁", type: "INCOME" },
      { name: "投资收益", icon: "📈", type: "INCOME" },
      { name: "其他收入", icon: "💵", type: "INCOME" },
    ];

    const now = Date.now();
    const created = [];

    for (const category of categories) {
      const id = await ctx.db.insert("categories", {
        name: category.name,
        icon: category.icon,
        type: category.type,
        createdAt: now,
        updatedAt: now,
      });
      created.push(id);
    }

    return { message: "初始化完成", count: created.length };
  },
});
