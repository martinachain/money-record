import express from "express";
import cors from "cors";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import { prisma } from "./db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// 生产环境下提供静态文件服务
if (process.env.NODE_ENV === "production") {
  app.use(express.static(join(__dirname, "../dist")));
}

// 获取所有类别（类别是共享的，不需要用户过滤）
app.get("/api/categories", async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  res.json(categories);
});

// 创建新类别（类别是共享的，不需要用户过滤）
app.post("/api/categories", async (req, res) => {
  const { name, icon, type } = req.body;
  const category = await prisma.category.create({
    data: { name, icon: icon || null, type },
  });
  res.json(category);
});

// 创建交易记录
app.post("/api/transactions", requireAuth(), async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "未授权" });
  }

  const { amount, type, date, note, categoryId } = req.body;

  const transaction = await prisma.transaction.create({
    data: {
      amount: parseFloat(amount),
      type,
      date: new Date(date),
      note: note || null,
      categoryId,
      userId,
    },
    include: { category: true },
  });

  res.json(transaction);
});

// 获取所有交易记录
app.get("/api/transactions", requireAuth(), async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "未授权" });
  }

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { date: "desc" },
  });
  res.json(transactions);
});

// 删除交易记录
app.delete("/api/transactions", requireAuth(), async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "未授权" });
  }

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "缺少交易 ID" });
  }

  // 确保只能删除自己的交易
  const transaction = await prisma.transaction.findUnique({
    where: { id },
  });

  if (!transaction) {
    return res.status(404).json({ error: "交易记录不存在" });
  }

  if (transaction.userId !== userId) {
    return res.status(403).json({ error: "无权删除此交易" });
  }

  await prisma.transaction.delete({
    where: { id },
  });

  res.json({ success: true });
});

// 获取指定月份的预算
app.get("/api/budgets", requireAuth(), async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "未授权" });
  }

  const { month, year } = req.query;
  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      month: parseInt(month as string),
      year: parseInt(year as string),
    },
    include: { category: true },
  });
  res.json(budgets);
});

// 创建或更新预算
app.post("/api/budgets", requireAuth(), async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "未授权" });
  }

  const { categoryId, month, year, amount } = req.body;

  const budget = await prisma.budget.upsert({
    where: {
      userId_categoryId_month_year: { userId, categoryId, month, year },
    },
    update: { amount: parseFloat(amount) },
    create: {
      categoryId,
      month,
      year,
      amount: parseFloat(amount),
      userId,
    },
    include: { category: true },
  });

  res.json(budget);
});

// 获取预算使用情况（当月支出统计）
app.get("/api/budgets/usage", requireAuth(), async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "未授权" });
  }

  const { month, year } = req.query;
  const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
  const endDate = new Date(parseInt(year as string), parseInt(month as string), 0, 23, 59, 59);

  const transactions = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: startDate, lte: endDate },
    },
    _sum: { amount: true },
  });

  res.json(transactions);
});

// 获取类别支出占比（饼图数据）- 支持月/周/日/自定义视图
app.get("/api/analytics/category-breakdown", requireAuth(), async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "未授权" });
  }

  const { month, year, date, startDate: startDateStr, endDate: endDateStr, viewMode } = req.query;

  let startDate: Date;
  let endDate: Date;

  if ((viewMode === "custom" || viewMode === "week") && startDateStr && endDateStr) {
    startDate = new Date(startDateStr as string);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(endDateStr as string);
    endDate.setHours(23, 59, 59, 999);
  } else if (viewMode === "day" && date) {
    startDate = new Date(date as string);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(date as string);
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
      userId,
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
app.get("/api/analytics/monthly-trend", requireAuth(), async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "未授权" });
  }

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
        userId,
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

// 通用趋势数据接口 - 支持月/周/日/自定义视图（包含收入和支出）
app.get("/api/analytics/trend", requireAuth(), async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "未授权" });
  }

  const { viewMode, startDate: startDateStr, endDate: endDateStr } = req.query;
  const now = new Date();
  const results = [];

  if (viewMode === "custom" && startDateStr && endDateStr) {
    // 自定义时间段 - 按天显示
    const start = new Date(startDateStr as string);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDateStr as string);
    end.setHours(23, 59, 59, 999);

    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // 根据时间跨度决定显示粒度
    if (daysDiff <= 14) {
      // 14天以内按天显示
      for (let i = 0; i <= daysDiff; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const [expenseData, incomeData] = await Promise.all([
          prisma.transaction.aggregate({
            where: { userId, type: "EXPENSE", date: { gte: dayStart, lte: dayEnd } },
            _sum: { amount: true },
          }),
          prisma.transaction.aggregate({
            where: { userId, type: "INCOME", date: { gte: dayStart, lte: dayEnd } },
            _sum: { amount: true },
          }),
        ]);

        results.push({
          month: `${date.getMonth() + 1}/${date.getDate()}`,
          year: date.getFullYear(),
          amount: expenseData._sum.amount || 0,
          income: incomeData._sum.amount || 0,
        });
      }
    } else if (daysDiff <= 90) {
      // 90天以内按周显示
      const weeks = Math.ceil(daysDiff / 7);
      for (let i = 0; i < weeks; i++) {
        const weekStart = new Date(start);
        weekStart.setDate(start.getDate() + i * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        if (weekEnd > end) weekEnd.setTime(end.getTime());

        const [expenseData, incomeData] = await Promise.all([
          prisma.transaction.aggregate({
            where: { userId, type: "EXPENSE", date: { gte: weekStart, lte: weekEnd } },
            _sum: { amount: true },
          }),
          prisma.transaction.aggregate({
            where: { userId, type: "INCOME", date: { gte: weekStart, lte: weekEnd } },
            _sum: { amount: true },
          }),
        ]);

        results.push({
          month: `${weekStart.getMonth() + 1}/${weekStart.getDate()}周`,
          year: weekStart.getFullYear(),
          amount: expenseData._sum.amount || 0,
          income: incomeData._sum.amount || 0,
        });
      }
    } else {
      // 超过90天按月显示
      const current = new Date(start.getFullYear(), start.getMonth(), 1);
      while (current <= end) {
        const monthStart = new Date(current);
        const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59);

        const [expenseData, incomeData] = await Promise.all([
          prisma.transaction.aggregate({
            where: { userId, type: "EXPENSE", date: { gte: monthStart, lte: monthEnd } },
            _sum: { amount: true },
          }),
          prisma.transaction.aggregate({
            where: { userId, type: "INCOME", date: { gte: monthStart, lte: monthEnd } },
            _sum: { amount: true },
          }),
        ]);

        results.push({
          month: `${current.getMonth() + 1}月`,
          year: current.getFullYear(),
          amount: expenseData._sum.amount || 0,
          income: incomeData._sum.amount || 0,
        });

        current.setMonth(current.getMonth() + 1);
      }
    }
  } else if (viewMode === "day") {
    // 过去7天
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const [expenseData, incomeData] = await Promise.all([
        prisma.transaction.aggregate({
          where: { type: "EXPENSE", date: { gte: startDate, lte: endDate } },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { type: "INCOME", date: { gte: startDate, lte: endDate } },
          _sum: { amount: true },
        }),
      ]);

      results.push({
        month: `${date.getMonth() + 1}/${date.getDate()}`,
        year: date.getFullYear(),
        amount: expenseData._sum.amount || 0,
        income: incomeData._sum.amount || 0,
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

      const [expenseData, incomeData] = await Promise.all([
        prisma.transaction.aggregate({
          where: { type: "EXPENSE", date: { gte: weekStart, lte: weekEnd } },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { type: "INCOME", date: { gte: weekStart, lte: weekEnd } },
          _sum: { amount: true },
        }),
      ]);

      results.push({
        month: `${weekStart.getMonth() + 1}/${weekStart.getDate()}周`,
        year: weekStart.getFullYear(),
        amount: expenseData._sum.amount || 0,
        income: incomeData._sum.amount || 0,
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

      const [expenseData, incomeData] = await Promise.all([
        prisma.transaction.aggregate({
          where: { type: "EXPENSE", date: { gte: startDate, lte: endDate } },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { type: "INCOME", date: { gte: startDate, lte: endDate } },
          _sum: { amount: true },
        }),
      ]);

      results.push({
        month: `${month}月`,
        year,
        amount: expenseData._sum.amount || 0,
        income: incomeData._sum.amount || 0,
      });
    }
  }

  res.json(results);
});

// 获取收入分类占比（饼图数据）- 支持月/周/日/自定义视图
app.get("/api/analytics/income-breakdown", requireAuth(), async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "未授权" });
  }

  const { month, year, date, startDate: startDateStr, endDate: endDateStr, viewMode } = req.query;

  let startDate: Date;
  let endDate: Date;

  if ((viewMode === "custom" || viewMode === "week") && startDateStr && endDateStr) {
    startDate = new Date(startDateStr as string);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(endDateStr as string);
    endDate.setHours(23, 59, 59, 999);
  } else if (viewMode === "day" && date) {
    startDate = new Date(date as string);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(date as string);
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
      userId,
      type: "INCOME",
      date: { gte: startDate, lte: endDate },
    },
    _sum: { amount: true },
  });

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

// 获取支出最高的5项 - 支持月/周/日/自定义视图
app.get("/api/analytics/top-expenses", requireAuth(), async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "未授权" });
  }

  const { month, year, date, startDate: startDateStr, endDate: endDateStr, viewMode } = req.query;

  let startDate: Date;
  let endDate: Date;

  if ((viewMode === "custom" || viewMode === "week") && startDateStr && endDateStr) {
    startDate = new Date(startDateStr as string);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(endDateStr as string);
    endDate.setHours(23, 59, 59, 999);
  } else if (viewMode === "day" && date) {
    startDate = new Date(date as string);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(date as string);
    endDate.setHours(23, 59, 59, 999);
  } else {
    const m = parseInt(month as string);
    const y = parseInt(year as string);
    startDate = new Date(y, m - 1, 1);
    endDate = new Date(y, m, 0, 23, 59, 59);
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: startDate, lte: endDate },
    },
    include: { category: true },
    orderBy: { amount: "desc" },
    take: 5,
  });

  res.json(transactions);
});

// 获取收入最高的5项 - 支持月/周/日/自定义视图
app.get("/api/analytics/top-incomes", requireAuth(), async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "未授权" });
  }

  const { month, year, date, startDate: startDateStr, endDate: endDateStr, viewMode } = req.query;

  let startDate: Date;
  let endDate: Date;

  if ((viewMode === "custom" || viewMode === "week") && startDateStr && endDateStr) {
    startDate = new Date(startDateStr as string);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(endDateStr as string);
    endDate.setHours(23, 59, 59, 999);
  } else if (viewMode === "day" && date) {
    startDate = new Date(date as string);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(date as string);
    endDate.setHours(23, 59, 59, 999);
  } else {
    const m = parseInt(month as string);
    const y = parseInt(year as string);
    startDate = new Date(y, m - 1, 1);
    endDate = new Date(y, m, 0, 23, 59, 59);
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: "INCOME",
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
