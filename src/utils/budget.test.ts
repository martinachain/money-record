import { describe, it, expect } from "vitest";
import {
  calculateBudget,
  calculateTotalBudget,
  formatAmount,
  getProgressColor,
} from "./budget";

describe("calculateBudget", () => {
  describe("正常情况", () => {
    it("应正确计算预算使用百分比", () => {
      const result = calculateBudget({ spent: 500, limit: 1000 });
      expect(result.percentage).toBe(50);
      expect(result.remaining).toBe(500);
      expect(result.isOverBudget).toBe(false);
      expect(result.isWarning).toBe(false);
      expect(result.hasValidBudget).toBe(true);
    });

    it("应正确判断超支情况", () => {
      const result = calculateBudget({ spent: 1200, limit: 1000 });
      expect(result.percentage).toBe(120);
      expect(result.remaining).toBe(-200);
      expect(result.isOverBudget).toBe(true);
      expect(result.isWarning).toBe(true);
    });

    it("应正确判断警告情况（>=80%）", () => {
      const result = calculateBudget({ spent: 800, limit: 1000 });
      expect(result.percentage).toBe(80);
      expect(result.isWarning).toBe(true);
      expect(result.isOverBudget).toBe(false);
    });

    it("79% 不应触发警告", () => {
      const result = calculateBudget({ spent: 79, limit: 100 });
      expect(result.percentage).toBe(79);
      expect(result.isWarning).toBe(false);
    });
  });

  describe("支出为 0 的情况", () => {
    it("支出为 0 时应正确计算", () => {
      const result = calculateBudget({ spent: 0, limit: 1000 });
      expect(result.percentage).toBe(0);
      expect(result.remaining).toBe(1000);
      expect(result.isOverBudget).toBe(false);
      expect(result.isWarning).toBe(false);
      expect(result.hasValidBudget).toBe(true);
    });

    it("支出和预算都为 0 时不应出错", () => {
      const result = calculateBudget({ spent: 0, limit: 0 });
      expect(result.percentage).toBe(0);
      expect(result.remaining).toBe(0);
      expect(result.isOverBudget).toBe(false);
      expect(result.hasValidBudget).toBe(false);
    });
  });

  describe("预算未设置的情况", () => {
    it("预算为 null 时不应出错", () => {
      const result = calculateBudget({ spent: 500, limit: null });
      expect(result.percentage).toBe(0);
      expect(result.remaining).toBe(0);
      expect(result.isOverBudget).toBe(false);
      expect(result.isWarning).toBe(false);
      expect(result.hasValidBudget).toBe(false);
    });

    it("预算为 undefined 时不应出错", () => {
      const result = calculateBudget({ spent: 500, limit: undefined });
      expect(result.percentage).toBe(0);
      expect(result.remaining).toBe(0);
      expect(result.isOverBudget).toBe(false);
      expect(result.hasValidBudget).toBe(false);
    });

    it("预算为负数时应视为无效", () => {
      const result = calculateBudget({ spent: 500, limit: -100 });
      expect(result.hasValidBudget).toBe(false);
      expect(result.percentage).toBe(0);
    });
  });

  describe("边界情况", () => {
    it("支出为 NaN 时应处理为 0", () => {
      const result = calculateBudget({ spent: NaN, limit: 1000 });
      expect(result.percentage).toBe(0);
      expect(result.remaining).toBe(1000);
    });

    it("预算为 NaN 时应视为无效", () => {
      const result = calculateBudget({ spent: 500, limit: NaN });
      expect(result.hasValidBudget).toBe(false);
      expect(result.percentage).toBe(0);
    });

    it("小数金额应正确计算", () => {
      const result = calculateBudget({ spent: 33.33, limit: 100 });
      expect(result.percentage).toBeCloseTo(33.33, 2);
      expect(result.remaining).toBeCloseTo(66.67, 2);
    });

    it("极小预算应正确处理", () => {
      const result = calculateBudget({ spent: 0.01, limit: 0.1 });
      expect(result.percentage).toBe(10);
      expect(result.hasValidBudget).toBe(true);
    });
  });
});

describe("calculateTotalBudget", () => {
  it("应正确汇总多个类别的预算", () => {
    const items = [
      { spent: 200, limit: 500 },
      { spent: 300, limit: 500 },
      { spent: 100, limit: 200 },
    ];
    const result = calculateTotalBudget(items);
    expect(result.percentage).toBe(50); // 600/1200 = 50%
    expect(result.remaining).toBe(600);
  });

  it("空数组不应出错", () => {
    const result = calculateTotalBudget([]);
    expect(result.percentage).toBe(0);
    expect(result.remaining).toBe(0);
    expect(result.hasValidBudget).toBe(false);
  });

  it("部分类别无预算时应正确处理", () => {
    const items = [
      { spent: 200, limit: 500 },
      { spent: 300, limit: null },
      { spent: 100, limit: undefined },
    ];
    const result = calculateTotalBudget(items);
    expect(result.percentage).toBe(120); // 600/500 = 120%
    expect(result.isOverBudget).toBe(true);
  });

  it("所有类别都无预算时不应出错", () => {
    const items = [
      { spent: 200, limit: null },
      { spent: 300, limit: undefined },
    ];
    const result = calculateTotalBudget(items);
    expect(result.hasValidBudget).toBe(false);
    expect(result.percentage).toBe(0);
  });
});

describe("formatAmount", () => {
  it("应正确格式化金额", () => {
    expect(formatAmount(1234.56)).toBe("¥1234.56");
  });

  it("应使用自定义前缀", () => {
    expect(formatAmount(100, "$")).toBe("$100.00");
  });

  it("NaN 应格式化为 0", () => {
    expect(formatAmount(NaN)).toBe("¥0.00");
  });

  it("负数应正确显示", () => {
    expect(formatAmount(-50)).toBe("¥-50.00");
  });
});

describe("getProgressColor", () => {
  it("无有效预算时返回灰色", () => {
    const result = calculateBudget({ spent: 100, limit: null });
    expect(getProgressColor(result)).toBe("bg-gray-300");
  });

  it("正常情况返回绿色", () => {
    const result = calculateBudget({ spent: 50, limit: 100 });
    expect(getProgressColor(result)).toBe("bg-green-500");
  });

  it("警告情况返回橙色", () => {
    const result = calculateBudget({ spent: 85, limit: 100 });
    expect(getProgressColor(result)).toBe("bg-orange-500");
  });

  it("超支情况返回红色", () => {
    const result = calculateBudget({ spent: 150, limit: 100 });
    expect(getProgressColor(result)).toBe("bg-red-500");
  });
});
