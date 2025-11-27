/**
 * 相似度计算工具
 * 用于提示词去重检查
 */

import crypto from 'crypto';

/**
 * 相似度计算结果
 */
export interface SimilarityResult {
  similarity: number; // 0-100
  method: 'exact' | 'high' | 'medium' | 'low';
  details: {
    titleMatch: boolean;
    contentHashMatch: boolean;
    jaccardScore: number;
  };
}

/**
 * 生成内容的 SHA256 hash
 */
export function generateContentHash(content: string): string {
  return crypto
    .createHash('sha256')
    .update(content.trim())
    .digest('hex');
}

/**
 * 标准化内容（移除占位符和多余空格）
 */
export function normalizeContent(content: string): string {
  return content
    .replace(/\[.*?\]/g, '') // 移除占位符 [在这里输入]
    .replace(/\s+/g, ' ')    // 标准化空格
    .trim();
}

/**
 * 计算 Jaccard 相似度
 * 基于分词的集合交并比
 */
export function calculateJaccardSimilarity(text1: string, text2: string): number {
  // 标准化文本
  const normalized1 = normalizeContent(text1);
  const normalized2 = normalizeContent(text2);

  // 分词（支持中英文）
  const words1 = new Set(
    normalized1
      .split(/[\s\n,，。.!！?？;；:：、]+/)
      .filter(w => w.length > 0)
  );
  
  const words2 = new Set(
    normalized2
      .split(/[\s\n,，。.!！?？;；:：、]+/)
      .filter(w => w.length > 0)
  );

  // 计算交集
  const intersection = new Set(
    [...words1].filter(word => words2.has(word))
  );

  // 计算并集
  const union = new Set([...words1, ...words2]);

  // 避免除零
  if (union.size === 0) return 0;

  // 返回百分比
  return (intersection.size / union.size) * 100;
}

/**
 * 计算两个提示词的相似度
 */
export function calculateSimilarity(
  content1: string,
  content2: string,
  title1?: string,
  title2?: string
): SimilarityResult {
  // 1. Hash 完全匹配检查
  const hash1 = generateContentHash(content1);
  const hash2 = generateContentHash(content2);
  const contentHashMatch = hash1 === hash2;

  if (contentHashMatch) {
    return {
      similarity: 100,
      method: 'exact',
      details: {
        titleMatch: true,
        contentHashMatch: true,
        jaccardScore: 100,
      },
    };
  }

  // 2. 标题匹配检查
  const titleMatch = !!(
    title1 &&
    title2 &&
    title1.trim().toLowerCase() === title2.trim().toLowerCase()
  );

  // 3. Jaccard 相似度计算
  const jaccardScore = calculateJaccardSimilarity(content1, content2);

  // 4. 综合评分
  let finalSimilarity = jaccardScore;

  // 标题相同加权 +10%
  if (titleMatch) {
    finalSimilarity = Math.min(finalSimilarity + 10, 99);
  }

  // 内容前缀高度相似加权
  const prefix1 = normalizeContent(content1).substring(0, 500);
  const prefix2 = normalizeContent(content2).substring(0, 500);
  if (prefix1 === prefix2 && prefix1.length > 100) {
    finalSimilarity = Math.min(finalSimilarity + 5, 99);
  }

  // 5. 确定相似度等级
  let method: 'high' | 'medium' | 'low';
  if (finalSimilarity >= 90) {
    method = 'high';
  } else if (finalSimilarity >= 80) {
    method = 'medium';
  } else {
    method = 'low';
  }

  return {
    similarity: Math.round(finalSimilarity),
    method,
    details: {
      titleMatch,
      contentHashMatch: false,
      jaccardScore: Math.round(jaccardScore),
    },
  };
}

/**
 * 获取相似度等级的颜色类名
 */
export function getSimilarityColor(similarity: number): string {
  if (similarity >= 95) return 'text-red-600';
  if (similarity >= 90) return 'text-orange-600';
  if (similarity >= 85) return 'text-yellow-600';
  return 'text-blue-600';
}

/**
 * 获取相似度等级的背景颜色类名
 */
export function getSimilarityBgColor(similarity: number): string {
  if (similarity >= 95) return 'bg-red-50 border-red-200';
  if (similarity >= 90) return 'bg-orange-50 border-orange-200';
  if (similarity >= 85) return 'bg-yellow-50 border-yellow-200';
  return 'bg-blue-50 border-blue-200';
}

/**
 * 获取相似度等级的描述文本
 */
export function getSimilarityDescription(similarity: number): string {
  if (similarity === 100) return '完全相同';
  if (similarity >= 95) return '几乎完全相同（可能只有标点或空格差异）';
  if (similarity >= 90) return '高度相似（核心内容相同，表述略有不同）';
  if (similarity >= 85) return '较为相似（主题相同，部分内容重复）';
  if (similarity >= 80) return '部分相似（有一定重复，但差异明显）';
  return '低相似度（仅供参考）';
}
