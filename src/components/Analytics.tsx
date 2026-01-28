import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api.js";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CategoryData {
  name: string;
  icon: string;
  value: number;
}

interface MonthlyData {
  month: string;
  year: number;
  amount: number;
  income: number;
}

interface TopTransaction {
  id: string;
  amount: number;
  date: string;
  note: string | null;
  category: {
    name: string;
    icon: string | null;
  } | null;
}

const EXPENSE_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#84CC16", "#10B981",
  "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899", "#6366F1",
];

const INCOME_COLORS = [
  "#10B981", "#34D399", "#6EE7B7", "#A7F3D0", "#059669",
  "#047857", "#065F46", "#064E3B", "#14532D", "#166534",
];

type ViewMode = "month" | "week" | "day";

export function Analytics() {
  const { userId } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const monthNames = [
    "一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月"
  ];

  const getDateRange = () => {
    const today = new Date();
    if (viewMode === "day") {
      return {
        date: today.toISOString().split("T")[0],
        startDate: undefined,
        endDate: undefined,
      };
    } else if (viewMode === "week") {
      const dayOfWeek = today.getDay();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - dayOfWeek);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return {
        date: undefined,
        startDate: startOfWeek.toISOString().split("T")[0],
        endDate: endOfWeek.toISOString().split("T")[0],
      };
    }
    return {
      date: undefined,
      startDate: undefined,
      endDate: undefined,
      month,
      year,
    };
  };

  const dateRange = getDateRange();

  // 使用 Convex 查询数据
  const expenseCategoryDataRaw = useQuery(
    api.analytics.categoryBreakdown,
    userId
      ? {
          ...dateRange,
          viewMode,
          userId,
        }
      : "skip"
  );
  const expenseCategoryData = Array.isArray(expenseCategoryDataRaw) ? expenseCategoryDataRaw : [];

  const incomeCategoryDataRaw = useQuery(
    api.analytics.incomeBreakdown,
    userId
      ? {
          ...dateRange,
          viewMode,
          userId,
        }
      : "skip"
  );
  const incomeCategoryData = Array.isArray(incomeCategoryDataRaw) ? incomeCategoryDataRaw : [];

  const monthlyDataRaw = useQuery(
    api.analytics.trend,
    userId
      ? {
          viewMode,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          userId,
        }
      : "skip"
  );
  const monthlyData = Array.isArray(monthlyDataRaw) ? monthlyDataRaw : [];

  const topExpensesRaw = useQuery(
    api.analytics.topExpenses,
    userId
      ? {
          ...dateRange,
          viewMode,
          userId,
        }
      : "skip"
  );
  const topExpenses = Array.isArray(topExpensesRaw) ? topExpensesRaw : [];

  const topIncomesRaw = useQuery(
    api.analytics.topIncomes,
    userId
      ? {
          ...dateRange,
          viewMode,
          userId,
        }
      : "skip"
  );
  const topIncomes = Array.isArray(topIncomesRaw) ? topIncomesRaw : [];

  const loading = !userId || expenseCategoryDataRaw === undefined || incomeCategoryDataRaw === undefined;

  const totalExpense = expenseCategoryData.reduce((sum, item) => sum + item.value, 0);
  const totalIncome = incomeCategoryData.reduce((sum, item) => sum + item.value, 0);
  const balance = totalIncome - totalExpense;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  const getViewLabel = () => {
    if (viewMode === "day") {
      return `${year}年${month}月${now.getDate()}日`;
    } else if (viewMode === "week") {
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.getMonth() + 1}月${startOfWeek.getDate()}日 - ${endOfWeek.getMonth() + 1}月${endOfWeek.getDate()}日`;
    }
    return `${year}年${monthNames[month - 1]}`;
  };

  const getPeriodLabel = () => {
    if (viewMode === "day") return "今日";
    if (viewMode === "week") return "本周";
    return "本月";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-bold text-gray-800">数据分析</h2>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                viewMode === "day"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              日视图
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                viewMode === "week"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              周视图
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                viewMode === "month"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              月视图
            </button>
          </div>
          <span className="text-sm text-gray-500">{getViewLabel()}</span>
        </div>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 mb-1">{getPeriodLabel()}收入</p>
          <p className="text-2xl font-bold text-green-500">+¥{totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 mb-1">{getPeriodLabel()}支出</p>
          <p className="text-2xl font-bold text-red-500">-¥{totalExpense.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 mb-1">{getPeriodLabel()}结余</p>
          <p className={`text-2xl font-bold ${balance >= 0 ? "text-blue-500" : "text-orange-500"}`}>
            {balance >= 0 ? "+" : ""}¥{balance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* 收支趋势图 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          {viewMode === "day" ? "过去7天" : viewMode === "week" ? "过去4周" : "近6个月"}收支趋势
        </h3>
        {monthlyData.every((d) => d.amount === 0 && d.income === 0) ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            暂无数据
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `¥${v}`} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `¥${value.toFixed(2)}`,
                  name === "income" ? "收入" : "支出",
                ]}
                labelStyle={{ color: "#374151" }}
              />
              <Legend />
              <Bar dataKey="income" name="收入" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="amount" name="支出" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 饼图 - 支出占比 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{getPeriodLabel()}支出分布</h3>
          {expenseCategoryData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              暂无支出数据
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={expenseCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {expenseCategoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`¥${value.toFixed(2)}`, "金额"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center mt-2">
                <span className="text-gray-500">总支出：</span>
                <span className="text-xl font-bold text-red-500">¥{totalExpense.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        {/* 饼图 - 收入占比 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{getPeriodLabel()}收入分布</h3>
          {incomeCategoryData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              暂无收入数据
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={incomeCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {incomeCategoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`¥${value.toFixed(2)}`, "金额"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center mt-2">
                <span className="text-gray-500">总收入：</span>
                <span className="text-xl font-bold text-green-500">¥{totalIncome.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top 5 列表 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 支出最高的5项 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{getPeriodLabel()}支出 Top 5</h3>
          {topExpenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">暂无支出记录</div>
          ) : (
            <div className="space-y-3">
              {topExpenses.map((expense, index) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                          ? "bg-gray-400"
                          : index === 2
                          ? "bg-amber-600"
                          : "bg-gray-300"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{expense.category?.icon || "💰"}</span>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{expense.category?.name || "未知"}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(expense.date).toLocaleDateString("zh-CN")}
                          {expense.note && ` - ${expense.note}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className="text-base font-bold text-red-500">
                    -¥{expense.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 收入最高的5项 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{getPeriodLabel()}收入 Top 5</h3>
          {topIncomes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">暂无收入记录</div>
          ) : (
            <div className="space-y-3">
              {topIncomes.map((income, index) => (
                <div
                  key={income.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                          ? "bg-gray-400"
                          : index === 2
                          ? "bg-amber-600"
                          : "bg-gray-300"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{income.category?.icon || "💰"}</span>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{income.category?.name || "未知"}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(income.date).toLocaleDateString("zh-CN")}
                          {income.note && ` - ${income.note}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className="text-base font-bold text-green-500">
                    +¥{income.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
