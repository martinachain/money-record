/**
 * 认证辅助函数
 * 
 * 注意：当前版本需要从客户端传递 userId
 * 配置 Convex 认证后，可以改为从 ctx.auth 获取
 */

/**
 * 从 Convex context 获取用户 ID
 * 当前实现：需要从参数中传递 userId
 * 配置认证后：可以从 ctx.auth.getUserIdentity() 获取
 */
export async function getUserId(ctx: any, userId?: string): Promise<string> {
  // TODO: 配置 Convex 认证后，使用以下代码：
  // const identity = await ctx.auth.getUserIdentity();
  // if (!identity) {
  //   throw new Error("未授权");
  // }
  // return identity.subject; // Clerk user ID
  
  // 临时实现：从参数获取
  if (!userId) {
    throw new Error("未授权：需要提供 userId");
  }
  return userId;
}
