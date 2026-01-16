import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  type: string;
}

interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  category: Category;
}

interface UsageData {
  categoryId: string;
  _sum: { amount: number | null };
}

export function BudgetDashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [usage, setUsage] = useState<UsageData[]>([]);

  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  const monthNames = [
    "一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月"
  ];

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then((res) => res.json())
      .then(setCategories);

    fetch(`${API_BASE_URL}/api/budgets?month=${month}&year=${year}`)
      .then((res) => res.json())
      .then(setBudgets);

    fetch(`${API_BASE_URL}/api/budgets/usage?month=${month}&year=${year}`)
      .then((res) => res.json())
      .then(setUsage);
  }, []);

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  const getBudgetForCategory = (categoryId: string) => {
    return budgets.find((b) => b.categoryId === categoryId);
  };

  const getUsageForCategory = (categoryId: string) => {
    const u = usage.find((u) => u.categoryId === categoryId);
    return u?._sum.amount || 0;
  };

  // 计算总预算和总支出
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = usage.reduce((sum, u) => sum + (u._sum.amount || 0), 0);
  const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // 只显示有预算的类别
  const categoriesWithBudget = expenseCategories.filter((c) =>
    getBudgetForCategory(c.id)
  );

  if (categoriesWithBudget.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">预算看板</h2>
        <p className="text-gray-500 text-center py-4">
          暂未设置预算，请前往「预算」页面设置
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">预算看板</h2>
        <span className="text-sm text-gray-500">{year}年{monthNames[month - 1]}</span>
      </div>

      {/* 总览 */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">本月总预算</span>
          <span className="font-bold text-gray-800">¥{totalBudget.toFixed(2)}</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full transition-all ${
              totalPercentage >= 100
                ? "bg-red-500"
                : totalPercentage >= 80
                ? "bg-orange-500"
                : "bg-blue-500"
            }`}
            style={{ width: `${Math.min(totalPercentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className={totalPercentage >= 80 ? "text-red-500" : "text-gray-600"}>
            已花费 ¥{totalSpent.toFixed(2)} ({totalPercentage.toFixed(0)}%)
          </span>
          <span className="text-gray-500">
            剩余 ¥{Math.max(totalBudget - totalSpent, 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* 分类预算列表 */}
      <div className="space-y-3">
        {categoriesWithBudget.map((category) => {
          const budget = getBudgetForCategory(category.id);
          const spent = getUsageForCategory(category.id);
          const limit = budget?.amount || 0;
          const percentage = limit > 0 ? (spent / limit) * 100 : 0;
          const isWarning = percentage >= 80;
          const isOverBudget = percentage >= 100;

          return (
            <div key={category.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icon}</span>
                  <span className="font-medium text-gray-700">{category.name}</span>
                </div>
                <div className="text-right">
                  <span className={`font-bold ${isOverBudget ? "text-red-500" : "text-gray-800"}`}>
                    ¥{spent.toFixed(2)}
                  </span>
                  <span className="text-gray-400 text-sm"> / ¥{limit.toFixed(2)}</span>
                </div>
              </div>

              {/* 进度条 */}
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    isOverBudget
                      ? "bg-red-500"
                      : isWarning
                      ? "bg-orange-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>

              <div className="flex justify-between mt-1 text-xs">
                <span className={isWarning ? "text-orange-500" : "text-gray-500"}>
                  {percentage.toFixed(0)}%
                </span>
                <span className={isOverBudget ? "text-red-500" : "text-gray-500"}>
                  {isOverBudget ? "超支 " : "剩余 "}
                  ¥{Math.abs(limit - spent).toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
