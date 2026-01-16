export interface BudgetCalculationInput {
  spent: number;
  limit: number | null | undefined;
}

export interface BudgetCalculationResult {
  percentage: number;
  remaining: number;
  isOverBudget: boolean;
  isWarning: boolean;
  hasValidBudget: boolean;
}

/**
 * 计算预算使用情况
 * @param input - 包含已花费金额和预算限额
 * @returns 预算计算结果
 */
export function calculateBudget(input: BudgetCalculationInput): BudgetCalculationResult {
  const { spent, limit } = input;

  // 处理无效的支出值
  const safeSpent = typeof spent === "number" && !isNaN(spent) ? spent : 0;

  // 处理未设置或无效的预算限额
  const hasValidBudget = typeof limit === "number" && !isNaN(limit) && limit > 0;
  const safeLimit = hasValidBudget ? limit : 0;

  // 计算百分比（避免除以零）
  const percentage = hasValidBudget ? (safeSpent / safeLimit) * 100 : 0;

  // 计算剩余金额
  const remaining = hasValidBudget ? safeLimit - safeSpent : 0;

  // 判断是否超支（必须有有效预算才能判断）
  const isOverBudget = hasValidBudget && safeSpent > safeLimit;

  // 判断是否接近预算上限（>=80%）
  const isWarning = hasValidBudget && percentage >= 80;

  return {
    percentage,
    remaining,
    isOverBudget,
    isWarning,
    hasValidBudget,
  };
}

/**
 * 计算多个类别的总预算使用情况
 * @param items - 每个类别的支出和预算数组
 * @returns 汇总的预算计算结果
 */
export function calculateTotalBudget(
  items: BudgetCalculationInput[]
): BudgetCalculationResult {
  const totalSpent = items.reduce((sum, item) => {
    const spent = typeof item.spent === "number" && !isNaN(item.spent) ? item.spent : 0;
    return sum + spent;
  }, 0);

  const totalLimit = items.reduce((sum, item) => {
    const limit = typeof item.limit === "number" && !isNaN(item.limit) && item.limit > 0
      ? item.limit
      : 0;
    return sum + limit;
  }, 0);

  return calculateBudget({ spent: totalSpent, limit: totalLimit > 0 ? totalLimit : null });
}

/**
 * 格式化金额显示
 * @param amount - 金额
 * @param prefix - 前缀（默认 ¥）
 * @returns 格式化后的金额字符串
 */
export function formatAmount(amount: number, prefix = "¥"): string {
  const safeAmount = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  return `${prefix}${safeAmount.toFixed(2)}`;
}

/**
 * 获取进度条颜色类名
 * @param result - 预算计算结果
 * @returns Tailwind CSS 类名
 */
export function getProgressColor(result: BudgetCalculationResult): string {
  if (!result.hasValidBudget) return "bg-gray-300";
  if (result.isOverBudget) return "bg-red-500";
  if (result.isWarning) return "bg-orange-500";
  return "bg-green-500";
}
