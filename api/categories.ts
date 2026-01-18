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
      const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
      });
      return res.json(categories);
    }

    if (req.method === "POST") {
      const { name, icon, type } = req.body;
      const category = await prisma.category.create({
        data: { name, icon: icon || null, type },
      });
      return res.json(category);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Categories API error:", error);
    return res.status(500).json({ error: String(error) });
  }
}
