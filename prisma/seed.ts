import { prisma } from "../server/db";

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

async function main() {
  console.log("Seeding database...");

  // 检查是否已有数据
  const count = await prisma.category.count();
  if (count > 0) {
    console.log("Categories already exist, skipping seed.");
    return;
  }

  for (const category of categories) {
    await prisma.category.create({ data: category });
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
