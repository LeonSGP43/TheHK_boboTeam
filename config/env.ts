/**
 * 环境变量配置 - 统一管理所有环境变量
 * 
 * 使用方式：
 * - 本地开发：创建 .env.local 文件
 * - GitHub Actions：在 Repository Secrets 中设置
 * 
 * Vite 规则：
 * - 只有 VITE_ 前缀的变量才会暴露给客户端
 * - import.meta.env.VITE_XXX 在构建时会被替换为实际值
 */

// 后端 API 地址 (必填)
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;

// 爬虫服务器地址 (必填)
export const SPIDER_URL = import.meta.env.VITE_SPIDER_URL as string;

// Google Gemini API Key
export const API_KEY = import.meta.env.VITE_API_KEY as string || '';

// TikHub API Key
export const TIKHUB_API_KEY = import.meta.env.VITE_TIKHUB_API_KEY as string || '';

// 是否为开发模式 (Vite 内置)
export const IS_DEV = import.meta.env.DEV;

// 是否为生产模式 (Vite 内置)
export const IS_PROD = import.meta.env.PROD;

// 启动时验证必填环境变量
if (!BACKEND_URL) {
  console.error('❌ [ENV] VITE_BACKEND_URL is required but not set!');
}
if (!SPIDER_URL) {
  console.error('❌ [ENV] VITE_SPIDER_URL is required but not set!');
}

// 开发模式下打印配置
if (IS_DEV) {
  console.log('[ENV] BACKEND_URL:', BACKEND_URL || '❌ NOT SET');
  console.log('[ENV] SPIDER_URL:', SPIDER_URL || '❌ NOT SET');
  console.log('[ENV] API_KEY:', API_KEY ? '✅ SET' : '⚠️ NOT SET');
}
