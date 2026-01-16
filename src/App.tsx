import { useState, useEffect } from "react";
import { TransactionForm } from "./components/TransactionForm";
import { BudgetSettings } from "./components/BudgetSettings";
import { BudgetDashboard } from "./components/BudgetDashboard";
import { Analytics } from "./components/Analytics";
import { API_BASE_URL } from "./config";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  date: string;
  note: string | null;
  category: {
    name: string;
    icon: string | null;
  };
}

type Page = "transactions" | "budget" | "analytics";

function App() {
  const [page, setPage] = useState<Page>("transactions");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchTransactions = () => {
    fetch(`${API_BASE_URL}/api/transactions`)
      .then((res) => res.json())
      .then(setTransactions)
      .catch(console.error);
  };

  const handleTransactionSuccess = () => {
    fetchTransactions();
    setRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-800">极简记账</h1>
            <div className="flex gap-1 sm:gap-2">
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
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {tx.category.icon || "💰"}
                          </span>
                          <div>
                            <p className="font-medium text-gray-800">
                              {tx.category.name}
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
            <BudgetDashboard key={refreshKey} />
          </div>
        ) : page === "budget" ? (
          <BudgetSettings />
        ) : (
          <Analytics key={refreshKey} />
        )}
      </div>
    </div>
  );
}

export default App;
