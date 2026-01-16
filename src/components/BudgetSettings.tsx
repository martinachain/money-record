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
  month: number;
  year: number;
  amount: number;
  category: Category;
}

interface UsageData {
  categoryId: string;
  _sum: { amount: number | null };
}

const ICONS = ["🍜", "🚗", "🛒", "🎮", "🏠", "💊", "📚", "💸", "🎬", "✈️", "👕", "💄", "🐱", "🎁", "📱"];

export function BudgetSettings() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [usage, setUsage] = useState<UsageData[]>([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // 新增类别状态
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("💸");

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  const fetchCategories = () => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then((res) => res.json())
      .then(setCategories);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBudgets();
    fetchUsage();
  }, [month, year]);

  const fetchBudgets = () => {
    fetch(`${API_BASE_URL}/api/budgets?month=${month}&year=${year}`)
      .then((res) => res.json())
      .then(setBudgets);
  };

  const fetchUsage = () => {
    fetch(`${API_BASE_URL}/api/budgets/usage?month=${month}&year=${year}`)
      .then((res) => res.json())
      .then(setUsage);
  };

  const getBudgetForCategory = (categoryId: string) => {
    return budgets.find((b) => b.categoryId === categoryId);
  };

  const getUsageForCategory = (categoryId: string) => {
    const u = usage.find((u) => u.categoryId === categoryId);
    return u?._sum.amount || 0;
  };

  const handleSave = async (categoryId: string) => {
    if (!editAmount) return;
    setLoading(true);

    await fetch(`${API_BASE_URL}/api/budgets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId,
        month,
        year,
        amount: parseFloat(editAmount),
      }),
    });

    setEditingId(null);
    setEditAmount("");
    fetchBudgets();
    setLoading(false);
  };

  const startEdit = (categoryId: string) => {
    const budget = getBudgetForCategory(categoryId);
    setEditingId(categoryId);
    setEditAmount(budget ? budget.amount.toString() : "");
  };

  const handleAddCategory = async () => {
    if (!newName.trim()) return;
    setLoading(true);

    await fetch(`${API_BASE_URL}/api/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName.trim(),
        icon: newIcon,
        type: "EXPENSE",
      }),
    });

    setNewName("");
    setNewIcon("💸");
    setShowAddForm(false);
    fetchCategories();
    setLoading(false);
  };

  const months = [
    "一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月"
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">预算设置</h2>

      {/* Month/Year Selector */}
      <div className="flex gap-4 mb-6">
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {months.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {[2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035].map((y) => (
            <option key={y} value={y}>{y}年</option>
          ))}
        </select>
      </div>

      {/* Budget List */}
      <div className="space-y-4">
        {expenseCategories.map((category) => {
          const budget = getBudgetForCategory(category.id);
          const spent = getUsageForCategory(category.id);
          const limit = budget?.amount || 0;
          const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
          const isOverBudget = spent > limit && limit > 0;

          return (
            <div key={category.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{category.icon}</span>
                  <span className="font-medium text-gray-800">{category.name}</span>
                </div>

                {editingId === category.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSave(category.id)}
                      disabled={loading}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(category.id)}
                    className="px-3 py-1 text-blue-500 hover:bg-blue-50 rounded"
                  >
                    {budget ? `¥${limit.toFixed(2)}` : "设置预算"}
                  </button>
                )}
              </div>

              {budget && (
                <>
                  {/* Progress Bar */}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isOverBudget ? "bg-red-500" : "bg-green-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-sm">
                    <span className={isOverBudget ? "text-red-500" : "text-gray-600"}>
                      已花费 ¥{spent.toFixed(2)}
                    </span>
                    <span className="text-gray-500">
                      {isOverBudget ? "超支" : "剩余"} ¥{Math.abs(limit - spent).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {/* 添加新类别表单 */}
        {showAddForm ? (
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">图标：</span>
                <div className="flex flex-wrap gap-1">
                  {ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewIcon(icon)}
                      className={`w-8 h-8 rounded ${
                        newIcon === icon
                          ? "bg-blue-500 text-white"
                          : "bg-white hover:bg-gray-100"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{newIcon}</span>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="输入类别名称"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewName("");
                    setNewIcon("💸");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  取消
                </button>
                <button
                  onClick={handleAddCategory}
                  disabled={loading || !newName.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition flex items-center justify-center gap-2"
          >
            <span className="text-2xl">+</span>
            <span>添加新类别</span>
          </button>
        )}
      </div>
    </div>
  );
}
