import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
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
}

interface TopExpense {
  id: string;
  amount: number;
  date: string;
  note: string | null;
  category: {
    name: string;
    icon: string | null;
  };
}

const COLORS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
];

type ViewMode = "month" | "week" | "day";

export function Analytics() {
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [topExpenses, setTopExpenses] = useState<TopExpense[]>([]);
  const [loading, setLoading] = useState(true);
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
      return `date=${today.toISOString().split("T")[0]}`;
    } else if (viewMode === "week") {
      const dayOfWeek = today.getDay();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - dayOfWeek);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `startDate=${startOfWeek.toISOString().split("T")[0]}&endDate=${endOfWeek.toISOString().split("T")[0]}`;
    }
    return `month=${month}&year=${year}`;
  };

  const fetchData = () => {
    setLoading(true);
    const params = getDateRange();
    Promise.all([
      fetch(`${API_BASE_URL}/api/analytics/category-breakdown?${params}&viewMode=${viewMode}`).then((r) => r.json()),
      fetch(`${API_BASE_URL}/api/analytics/trend?viewMode=${viewMode}`).then((r) => r.json()),
      fetch(`${API_BASE_URL}/api/analytics/top-expenses?${params}&viewMode=${viewMode}`).then((r) => r.json()),
    ]).then(([category, trend, top]) => {
      setCategoryData(category);
      setMonthlyData(trend);
      setTopExpenses(top);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, [viewMode]);

  const totalExpense = categoryData.reduce((sum, item) => sum + item.value, 0);

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

      <div className="grid md:grid-cols-2 gap-6">
        {/* 饼图 - 支出占比 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{getPeriodLabel()}支出分布</h3>
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              暂无支出数据
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`¥${value.toFixed(2)}`, "金额"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center mt-2">
                <span className="text-gray-500">总支出：</span>
                <span className="text-xl font-bold text-red-500">¥{totalExpense.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        {/* 柱状图 - 趋势 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {viewMode === "day" ? "过去7天" : viewMode === "week" ? "过去4周" : "近6个月"}支出趋势
          </h3>
          {monthlyData.every((d) => d.amount === 0) ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              暂无支出数据
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `¥${v}`} />
                <Tooltip
                  formatter={(value: number) => [`¥${value.toFixed(2)}`, "支出"]}
                  labelStyle={{ color: "#374151" }}
                />
                <Legend />
                <Bar
                  dataKey="amount"
                  name="支出"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

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
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
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
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{expense.category.icon || "💰"}</span>
                    <div>
                      <p className="font-medium text-gray-800">{expense.category.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(expense.date).toLocaleDateString("zh-CN")}
                        {expense.note && ` - ${expense.note}`}
                      </p>
                    </div>
                  </div>
                </div>
                <span className="text-lg font-bold text-red-500">
                  -¥{expense.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
