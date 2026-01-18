import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../_db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    const { viewMode } = req.query;
    const now = new Date();
    const results = [];

    if (viewMode === "day") {
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

    return res.json(results);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
