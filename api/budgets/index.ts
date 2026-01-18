import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../_db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    const { month, year } = req.query;
    const budgets = await prisma.budget.findMany({
      where: {
        month: parseInt(month as string),
        year: parseInt(year as string),
      },
      include: { category: true },
    });
    return res.json(budgets);
  }

  if (req.method === "POST") {
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
    return res.json(budget);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
