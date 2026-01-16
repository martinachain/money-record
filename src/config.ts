// API 基础 URL 配置
// 生产环境使用相对路径（前后端同域），开发环境使用 localhost:3001
export const API_BASE_URL = import.meta.env.PROD ? "" : "http://localhost:3001";
