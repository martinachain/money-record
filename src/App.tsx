import { useState, useEffect } from "react";
import { useAuth, SignIn, UserButton, useClerk } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api.js";
import { TransactionForm } from "./components/TransactionForm";
import { BudgetSettings } from "./components/BudgetSettings";
import { BudgetDashboard } from "./components/BudgetDashboard";
import { Analytics } from "./components/Analytics";

type Page = "transactions" | "budget" | "analytics";

function App() {
  const { isSignedIn, userId } = useAuth();
  const { signOut } = useClerk();
  const [page, setPage] = useState<Page>("transactions");
  const [showAllRecords, setShowAllRecords] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 查询类别列表
  const categoriesData = useQuery(api.categories.list);
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  
  // 初始化类别的 mutation
  const initializeCategories = useMutation(api.seed.initializeCategories);

  // 自动初始化类别（只在类别为空时执行一次）
  useEffect(() => {
    if (isSignedIn && categories.length === 0 && categoriesData !== undefined) {
      // categoriesData 为 undefined 表示还在加载中，空数组表示已加载但没有数据
      initializeCategories().catch((error) => {
        console.error("初始化类别失败:", error);
      });
    }
  }, [isSignedIn, categories.length, categoriesData, initializeCategories]);

  const handleSignOut = async () => {
    await signOut();
  };

  // 使用 Convex 查询交易记录
  const transactionsData = useQuery(
    api.transactions.list,
    isSignedIn && userId ? { userId } : "skip"
  );
  const transactions = Array.isArray(transactionsData) ? transactionsData : [];

  // 删除交易记录的 mutation
  const deleteTransaction = useMutation(api.transactions.remove);

  const handleTransactionSuccess = () => {
    // Convex 会自动更新，不需要手动刷新
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这条记录吗？")) {
      return;
    }
    if (!userId) return;
    
    setDeletingId(id);
    try {
      await deleteTransaction({ id: id as any, userId });
    } catch (error) {
      console.error("删除失败:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const displayedRecords = showAllRecords ? transactions : transactions.slice(0, 5);

  // 如果未登录，显示登录界面
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">极简记账</h1>
          <SignIn />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-800">极简记账</h1>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setPage("transactions")}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition text-sm sm:text-base ${
                  page === "transactions"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                记账
              </button>
              <button
                onClick={() => setPage("budget")}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition text-sm sm:text-base ${
                  page === "budget"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                预算
              </button>
              <button
                onClick={() => setPage("analytics")}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition text-sm sm:text-base ${
                  page === "analytics"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                分析
              </button>
              <div className="ml-2 flex items-center gap-2">
                <UserButton />
                <button
                  onClick={handleSignOut}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
                  title="登出"
                >
                  登出
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        {page === "transactions" ? (
          <div className="space-y-8">
            {/* 添加记录和最近记录 */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Form */}
              <TransactionForm onSuccess={handleTransactionSuccess} />

              {/* Transaction List */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                  最近记录
                </h2>

                {transactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    暂无记录
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {transactions.slice(0, 5).map((tx) => (
                      <div
                        key={tx._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {tx.category?.icon || "💰"}
                          </span>
                          <div>
                            <p className="font-medium text-gray-800">
                              {tx.category?.name || "未知"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(tx.date).toLocaleDateString("zh-CN")}
                              {tx.note && ` - ${tx.note}`}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-bold ${
                            tx.type === "EXPENSE"
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          {tx.type === "EXPENSE" ? "-" : "+"}¥{tx.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 预算看板 */}
            <BudgetDashboard />

            {/* 所有记录 */}
            {transactions.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                  所有记录 ({transactions.length})
                </h2>

                <div className="space-y-3">
                  {displayedRecords.map((tx) => (
                    <div
                      key={tx._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition group"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl">
                          {tx.category?.icon || "💰"}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {tx.category?.name || "未知"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(tx.date).toLocaleDateString("zh-CN")}
                            {tx.note && ` - ${tx.note}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-bold ${
                            tx.type === "EXPENSE"
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          {tx.type === "EXPENSE" ? "-" : "+"}¥{tx.amount.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleDelete(tx._id)}
                          disabled={deletingId === tx._id}
                          className="opacity-0 group-hover:opacity-100 px-2 py-1 text-red-500 hover:bg-red-50 rounded transition disabled:opacity-50"
                          title="删除"
                        >
                          {deletingId === tx._id ? "..." : "删除"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {transactions.length > 5 && (
                  <button
                    onClick={() => setShowAllRecords(!showAllRecords)}
                    className="w-full mt-4 py-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                  >
                    {showAllRecords ? "收起" : `显示更多 (${transactions.length - 5} 条)`}
                  </button>
                )}
              </div>
            )}
          </div>
        ) : page === "budget" ? (
          <BudgetSettings />
        ) : (
          <Analytics />
        )}
      </div>
    </div>
  );
}

export default App;
