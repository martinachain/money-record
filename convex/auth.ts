// Convex 认证配置
// 注意：需要安装 @convex-dev/auth-clerk 并配置 Clerk 集成
// 或者使用 Convex 的内置认证系统

import { query } from "./_generated/server";

/**
 * 获取当前认证的用户 ID
 * 注意：这需要在 Convex Dashboard 中配置 Clerk 认证后才能使用
 */
export const getCurrentUserId = query({
  handler: async (ctx) => {
    // 如果使用 @convex-dev/auth-clerk
    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) {
    //   throw new Error("未授权");
    // }
    // return identity.subject; // Clerk user ID
    
    // 临时：从请求中获取（需要前端传递）
    // 实际应该使用 Convex 的认证系统
    throw new Error("需要配置 Convex 认证");
  },
});
