import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api.js";
import type { Id } from "../../convex/_generated/dataModel.js";

interface Category {
  _id: Id<"categories">;
  name: string;
  icon?: string;
  type: string;
}

interface TransactionFormProps {
  onSuccess?: () => void;
}

const ICONS = ["🍜", "🚗", "🛒", "🎮", "🏠", "💊", "📚", "💸", "🎬", "✈️", "👕", "💄", "🐱", "🎁", "📱", "💰", "💵", "📈"];

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const { userId } = useAuth();
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState<Id<"categories"> | "">("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 自定义类别状态
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customIcon, setCustomIcon] = useState("💸");

  // 使用 Convex 查询类别
  const categoriesData = useQuery(api.categories.list);
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  
  // Convex mutations
  const createCategory = useMutation(api.categories.create);
  const createTransaction = useMutation(api.transactions.create);

  useEffect(() => {
    const filtered = categories.filter((c) => c.type === type);
    if (filtered.length > 0 && (!categoryId || !filtered.find((c) => c._id === categoryId))) {
      setCategoryId(filtered[0]._id);
    }
    setShowCustom(false);
  }, [type, categories]);

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleCategoryChange = (value: string) => {
    if (value === "__custom__") {
      setShowCustom(true);
      setCategoryId("");
    } else {
      setShowCustom(false);
      setCategoryId(value);
    }
  };

  const handleAddCustomCategory = async () => {
    if (!customName.trim()) return;
    setLoading(true);

    try {
      const newCategory = await createCategory({
        name: customName.trim(),
        icon: customIcon,
        type,
      });
      if (newCategory) {
        setCategoryId(newCategory._id);
      }
      setCustomName("");
      setCustomIcon("💸");
      setShowCustom(false);
    } catch {
      setError("添加类别失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !userId) {
      setError("请选择类别");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await createTransaction({
        amount: parseFloat(amount),
        type,
        date,
        categoryId: categoryId as Id<"categories">,
        note: note || undefined,
        userId,
      });

      setAmount("");
      setNote("");
      onSuccess?.();
    } catch {
      setError("保存交易记录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">添加记录</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      {/* Type Toggle */}
      <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setType("EXPENSE")}
          className={`flex-1 py-2 rounded-lg font-medium transition ${
            type === "EXPENSE"
              ? "bg-red-500 text-white"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          支出
        </button>
        <button
          type="button"
          onClick={() => setType("INCOME")}
          className={`flex-1 py-2 rounded-lg font-medium transition ${
            type === "INCOME"
              ? "bg-green-500 text-white"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          收入
        </button>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          金额
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Date */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          日期
        </label>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          类别
        </label>
        <select
          value={showCustom ? "__custom__" : categoryId}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {filteredCategories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.icon || ""} {cat.name}
            </option>
          ))}
          <option value="__custom__">➕ 自定义类别...</option>
        </select>

        {/* 自定义类别表单 */}
        {showCustom && (
          <div className="mt-3 p-3 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">选择图标：</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setCustomIcon(icon)}
                      className={`w-8 h-8 rounded text-lg ${
                        customIcon === icon
                          ? "bg-blue-500"
                          : "bg-white hover:bg-gray-100"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{customIcon}</span>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="输入类别名称"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomCategory}
                  disabled={loading || !customName.trim()}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Note */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          备注（可选）
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="添加备注..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || showCustom}
        className={`w-full py-3 rounded-lg font-medium text-white transition ${
          type === "EXPENSE"
            ? "bg-red-500 hover:bg-red-600"
            : "bg-green-500 hover:bg-green-600"
        } disabled:opacity-50`}
      >
        {loading ? "保存中..." : "保存"}
      </button>
    </form>
  );
}
