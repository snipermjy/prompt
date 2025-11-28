/**
 * 分类相似度匹配工具（混合方案）
 * 用于判断AI生成的新分类是否与现有分类相似
 */

import type { Category } from '@/lib/types/database';

/**
 * 中英文翻译映射表
 */
const TRANSLATION_MAP: Record<string, string[]> = {
  '提示词': ['prompt', 'prompts'],
  '工程': ['engineering', 'engineer'],
  '优化': ['optimization', 'optimize', 'improve'],
  'AI': ['ai', 'artificial-intelligence', '人工智能'],
  '工具': ['tool', 'tools', 'utility'],
  '效率': ['efficiency', 'productive', 'productivity'],
  '写作': ['writing', 'write', 'writer'],
  '创意': ['creative', 'creativity', 'creation'],
  '数据': ['data'],
  '分析': ['analysis', 'analyze', 'analytics'],
  '代码': ['code', 'coding', 'programming'],
  '设计': ['design'],
  '营销': ['marketing', 'market'],
  '教育': ['education', 'learning', 'teach'],
  '商业': ['business', 'commerce'],
};

/**
 * 提取关键词
 */
function extractKeywords(text: string): string[] {
  // 移除特殊字符，保留中英文和数字
  const cleaned = text.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9\s-]/g, ' ');
  
  // 分词
  const words = cleaned.split(/[\s-]+/).filter(w => w.length > 0);
  
  // 扩展翻译
  const expanded = new Set<string>(words);
  words.forEach(word => {
    Object.entries(TRANSLATION_MAP).forEach(([key, values]) => {
      if (key === word || values.includes(word)) {
        expanded.add(key);
        values.forEach(v => expanded.add(v));
      }
    });
  });
  
  return Array.from(expanded);
}

/**
 * 计算两个关键词集合的Jaccard相似度
 */
function jaccardSimilarity(set1: Set<string>, set2: Set<string>): number {
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  if (union.size === 0) return 0;
  return (intersection.size / union.size) * 100;
}

/**
 * 计算分类相似度
 * @param newCategory AI生成的新分类名称
 * @param existingCategory 现有分类
 * @returns 相似度（0-100）
 */
export function calculateCategorySimilarity(
  newCategory: string,
  existingCategory: Category
): number {
  const newName = newCategory.trim();
  const existingName = existingCategory.name.trim();
  const existingSlug = existingCategory.slug.trim();
  
  // 规则1：完全相同 → 100%
  if (newName === existingName || newName === existingSlug) {
    return 100;
  }
  
  // 规则2：包含关系 → 80%
  if (newName.includes(existingName) || existingName.includes(newName)) {
    return 80;
  }
  if (newName.includes(existingSlug) || existingSlug.includes(newName)) {
    return 80;
  }
  
  // 规则3：关键词重叠度
  const newKeywords = new Set(extractKeywords(newName));
  const existingKeywords = new Set([
    ...extractKeywords(existingName),
    ...extractKeywords(existingSlug),
    ...(existingCategory.description ? extractKeywords(existingCategory.description) : [])
  ]);
  
  const similarity = jaccardSimilarity(newKeywords, existingKeywords);
  
  return Math.round(similarity);
}

/**
 * 查找最相似的现有分类
 * @param newCategory AI生成的新分类名称
 * @param existingCategories 现有分类列表
 * @param threshold 相似度阈值（默认90%）
 * @returns 最相似的分类（如果相似度>=阈值）或null
 */
export function findSimilarCategory(
  newCategory: string,
  existingCategories: Category[],
  threshold: number = 90
): { category: Category; similarity: number } | null {
  let bestMatch: { category: Category; similarity: number } | null = null;
  
  for (const existing of existingCategories) {
    const similarity = calculateCategorySimilarity(newCategory, existing);
    
    if (similarity >= threshold) {
      if (!bestMatch || similarity > bestMatch.similarity) {
        bestMatch = { category: existing, similarity };
      }
    }
  }
  
  return bestMatch;
}

/**
 * 批量匹配分类（用于批量处理）
 * @param newCategories AI生成的新分类列表
 * @param existingCategories 现有分类列表
 * @param threshold 相似度阈值
 * @returns 匹配结果映射表
 */
export function batchMatchCategories(
  newCategories: string[],
  existingCategories: Category[],
  threshold: number = 90
): Map<string, { matchedCategory: Category | null; similarity: number; shouldCreateNew: boolean }> {
  const results = new Map();
  const processedCategories = new Map<string, Category>();
  
  for (const newCat of newCategories) {
    // 先检查是否已经处理过相同的分类
    if (processedCategories.has(newCat)) {
      results.set(newCat, {
        matchedCategory: processedCategories.get(newCat)!,
        similarity: 100,
        shouldCreateNew: false
      });
      continue;
    }
    
    // 查找相似的现有分类
    const match = findSimilarCategory(newCat, existingCategories, threshold);
    
    if (match) {
      // 找到相似的现有分类
      results.set(newCat, {
        matchedCategory: match.category,
        similarity: match.similarity,
        shouldCreateNew: false
      });
      processedCategories.set(newCat, match.category);
    } else {
      // 没有找到相似的，需要创建新分类
      results.set(newCat, {
        matchedCategory: null,
        similarity: 0,
        shouldCreateNew: true
      });
    }
  }
  
  return results;
}
