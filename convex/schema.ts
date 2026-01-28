import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 类别表
  categories: defineTable({
    name: v.string(),
    icon: v.optional(v.string()),
    type: v.string(), // INCOME 或 EXPENSE
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_name", ["name"]),

  // 交易记录表
  transactions: defineTable({
    amount: v.number(),
    type: v.string(), // INCOME 或 EXPENSE
    date: v.number(), // 使用时间戳（毫秒）
    note: v.optional(v.string()),
    userId: v.string(), // Clerk 用户 ID
    categoryId: v.id("categories"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_categoryId", ["categoryId"])
    .index("by_date", ["date"])
    .index("by_userId_date", ["userId", "date"]),

  // 预算表
  budgets: defineTable({
    month: v.number(), // 月份 (1-12)
    year: v.number(), // 年份
    amount: v.number(), // 预算限额
    userId: v.string(), // Clerk 用户 ID
    categoryId: v.id("categories"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_month_year", ["userId", "month", "year"])
    .index("by_categoryId", ["categoryId"]),
});
