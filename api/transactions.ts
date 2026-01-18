import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "./_db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method === "GET") {
      const transactions = await prisma.transaction.findMany({
        include: { category: true },
        orderBy: { date: "desc" },
      });
      return res.json(transactions);
    }

    if (req.method === "POST") {
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
      return res.json(transaction);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Transaction API error:", error);
    return res.status(500).json({ error: String(error) });
  }
}
