import express from "express";
import cors from "cors";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { prisma } from "./db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// 生产环境下提供静态文件服务
if (process.env.NODE_ENV === "production") {
  app.use(express.static(join(__dirname, "../dist")));
}

// 获取所有类别
app.get("/api/categories", async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  res.json(categories);
});

// 创建新类别
app.post("/api/categories", async (req, res) => {
  const { name, icon, type } = req.body;
  const category = await prisma.category.create({
    data: { name, icon: icon || null, type },
  });
  res.json(category);
});

// 创建交易记录
app.post("/api/transactions", async (req, res) => {
  const { amount, type, date, note, categoryId } = req.body;

  const transaction = await prisma.transaction.create({
    data: {
      amount: parseFloat(amount),
      type,
      date: new Date(date),
      note: note || null,
      categoryId,
    },
    include: { category: true },
  });

  res.json(transaction);
});

// 获取所有交易记录
app.get("/api/transactions", async (_req, res) => {
  const transactions = await prisma.transaction.findMany({
    include: { category: true },
    orderBy: { date: "desc" },
  });
  res.json(transactions);
});

// 获取指定月份的预算
app.get("/api/budgets", async (req, res) => {
  const { month, year } = req.query;
  const budgets = await prisma.budget.findMany({
    where: {
      month: parseInt(month as string),
      year: parseInt(year as string),
    },
    include: { category: true },
  });
  res.json(budgets);
});

// 创建或更新预算
app.post("/api/budgets", async (req, res) => {
  const { categoryId, month, year, amount } = req.body;

  const budget = await prisma.budget.upsert({
    where: {
      categoryId_month_year: { categoryId, month, year },
    },
    update: { amount: parseFloat(amount) },
    create: {
      categoryId,
      month,
      year,
      amount: parseFloat(amount),
    },
    include: { category: true },
  });

  res.json(budget);
});

// 获取预算使用情况（当月支出统计）
app.get("/api/budgets/usage", async (req, res) => {
  const { month, year } = req.query;
  const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
  const endDate = new Date(parseInt(year as string), parseInt(month as string), 0, 23, 59, 59);

  const transactions = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      type: "EXPENSE",
      date: { gte: startDate, lte: endDate },
    },
    _sum: { amount: true },
  });

  res.json(transactions);
});

// 获取类别支出占比（饼图数据）- 支持月/周/日视图
app.get("/api/analytics/category-breakdown", async (req, res) => {
  const { month, year, date, startDate: startDateStr, endDate: endDateStr, viewMode } = req.query;

  let startDate: Date;
  let endDate: Date;

  if (viewMode === "day" && date) {
    startDate = new Date(date as string);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(date as string);
    endDate.setHours(23, 59, 59, 999);
  } else if (viewMode === "week" && startDateStr && endDateStr) {
    startDate = new Date(startDateStr as string);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(endDateStr as string);
    endDate.setHours(23, 59, 59, 999);
  } else {
    const m = parseInt(month as string);
    const y = parseInt(year as string);
    startDate = new Date(y, m - 1, 1);
    endDate = new Date(y, m, 0, 23, 59, 59);
  }

  const data = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      type: "EXPENSE",
      date: { gte: startDate, lte: endDate },
    },
    _sum: { amount: true },
  });

  // 获取类别信息
  const categories = await prisma.category.findMany({
    where: { id: { in: data.map((d) => d.categoryId) } },
  });

  const result = data.map((d) => {
    const category = categories.find((c) => c.id === d.categoryId);
    return {
      name: category?.name || "未知",
      icon: category?.icon || "",
      value: d._sum.amount || 0,
    };
  });

  res.json(result);
});

// 获取过去6个月支出趋势（柱状图数据）
app.get("/api/analytics/monthly-trend", async (_req, res) => {
  const now = new Date();
  const results = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const data = await prisma.transaction.aggregate({
      where: {
        type: "EXPENSE",
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    results.push({
      month: `${month}月`,
      year,
      amount: data._sum.amount || 0,
    });
  }

  res.json(results);
});

// 通用趋势数据接口 - 支持月/周/日视图
app.get("/api/analytics/trend", async (req, res) => {
  const { viewMode } = req.query;
  const now = new Date();
  const results = [];

  if (viewMode === "day") {
    // 过去7天
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const data = await prisma.transaction.aggregate({
        where: {
          type: "EXPENSE",
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      });

      results.push({
        month: `${date.getMonth() + 1}/${date.getDate()}`,
        year: date.getFullYear(),
        amount: data._sum.amount || 0,
      });
    }
  } else if (viewMode === "week") {
    // 过去4周
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() - i * 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const data = await prisma.transaction.aggregate({
        where: {
          type: "EXPENSE",
          date: { gte: weekStart, lte: weekEnd },
        },
        _sum: { amount: true },
      });

      results.push({
        month: `${weekStart.getMonth() + 1}/${weekStart.getDate()}周`,
        year: weekStart.getFullYear(),
        amount: data._sum.amount || 0,
      });
    }
  } else {
    // 过去6个月（默认）
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const data = await prisma.transaction.aggregate({
        where: {
          type: "EXPENSE",
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      });

      results.push({
        month: `${month}月`,
        year,
        amount: data._sum.amount || 0,
      });
    }
  }

  res.json(results);
});

// 获取支出最高的5项 - 支持月/周/日视图
app.get("/api/analytics/top-expenses", async (req, res) => {
  const { month, year, date, startDate: startDateStr, endDate: endDateStr, viewMode } = req.query;

  let startDate: Date;
  let endDate: Date;

  if (viewMode === "day" && date) {
    startDate = new Date(date as string);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(date as string);
    endDate.setHours(23, 59, 59, 999);
  } else if (viewMode === "week" && startDateStr && endDateStr) {
    startDate = new Date(startDateStr as string);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(endDateStr as string);
    endDate.setHours(23, 59, 59, 999);
  } else {
    const m = parseInt(month as string);
    const y = parseInt(year as string);
    startDate = new Date(y, m - 1, 1);
    endDate = new Date(y, m, 0, 23, 59, 59);
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      type: "EXPENSE",
      date: { gte: startDate, lte: endDate },
    },
    include: { category: true },
    orderBy: { amount: "desc" },
    take: 5,
  });

  res.json(transactions);
});

// 生产环境下，所有非 API 路由返回 index.html (SPA)
if (process.env.NODE_ENV === "production") {
  app.get("*", (_req, res) => {
    res.sendFile(join(__dirname, "../dist/index.html"));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
