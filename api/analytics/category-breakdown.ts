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

    return res.json(result);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
