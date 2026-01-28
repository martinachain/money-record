// 临时文件：用于避免 Convex Dashboard 示例代码的错误
// 如果不需要 todos 功能，可以删除此文件

import { query } from "./_generated/server";

/**
 * 临时占位函数，避免 Convex Dashboard 示例代码报错
 * 如果不需要此功能，可以删除
 */
export const get = query({
  handler: async () => {
    return [];
  },
});
