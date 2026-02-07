/**
 * 分类冲突检测工具
 * 用于检测新分类与现有分类的相似度，避免重复分类
 */

import { getCategories } from '@/app/actions/categories';

/**
 * 计算两个字符串的相似度（Levenshtein距离）
 */
function calculateLevenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // 初始化矩阵
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // 计算编辑距离
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // 删除
        matrix[i][j - 1] + 1,      // 插入
        matrix[i - 1][j - 1] + cost // 替换
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * 计算字符串相似度（0-1之间）
 */
function calculateSimilarity(str1: string, str2: string): number {
  const distance = calculateLevenshteinDistance(str1, str2);
  const maxLen = Math.max(str1.length, str2.length);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
}

/**
 * 冲突检测结果
 */
export interface ConflictDetectionResult {
  hasConflict: boolean;
  similarCategories: Array<{
    id: string;
    name: string;
    slug: string;
    similarity: number;
  }>;
  suggestion: string;
}

/**
 * 检测分类名称冲突
 * 
 * @param newCategoryName - 新分类名称
 * @param threshold - 相似度阈值（默认0.7，即70%，适合中文）
 * @returns 冲突检测结果
 */
export async function detectCategoryConflict(
  newCategoryName: string,
  threshold: number = 0.7
): Promise<ConflictDetectionResult> {
  try {
    // 获取所有现有分类
    const existingCategories = await getCategories();
    
    // 计算与每个现有分类的相似度
    const similarCategories = existingCategories
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        similarity: calculateSimilarity(newCategoryName, cat.name)
      }))
      .filter(item => item.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity);

    // 如果有相似分类，返回冲突信息
    if (similarCategories.length > 0) {
      const topMatch = similarCategories[0];
      const similarityPercent = (topMatch.similarity * 100).toFixed(0);
      
      return {
        hasConflict: true,
        similarCategories,
        suggestion: `新分类"${newCategoryName}"与现有分类"${topMatch.name}"相似度${similarityPercent}%，建议合并或重命名。`
      };
    }

    // 没有冲突
    return {
      hasConflict: false,
      similarCategories: [],
      suggestion: ''
    };
  } catch (error) {
    console.error('Error in detectCategoryConflict:', error);
    return {
      hasConflict: false,
      similarCategories: [],
      suggestion: ''
    };
  }
}

/**
 * 批量检测多个分类名称
 */
export async function detectMultipleCategoryConflicts(
  categoryNames: string[]
): Promise<Map<string, ConflictDetectionResult>> {
  const results = new Map<string, ConflictDetectionResult>();
  
  for (const name of categoryNames) {
    const result = await detectCategoryConflict(name);
    results.set(name, result);
  }
  
  return results;
}
