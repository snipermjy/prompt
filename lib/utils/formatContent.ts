/**
 * 提示词内容格式化工具
 * 用于统一提示词内容的显示格式
 * 
 * 核心原则：
 * 1. 保持内容完全不变（一个字都不改）
 * 2. 让阅读更舒适（统一间距）
 * 3. 保留用户的原始意图（不改变结构）
 */

/**
 * 检测是否为特殊内容块（需要保护）
 */
function isProtectedBlock(line: string): boolean {
  // 代码块标记
  if (line.trim().startsWith('```')) return true;
  // 引用块
  if (line.trim().startsWith('>')) return true;
  // 表格
  if (line.trim().includes('|')) return true;
  return false;
}

/**
 * 检测是否为标题行
 */
function isTitleLine(line: string): boolean {
  const trimmed = line.trim();
  // Markdown标题
  if (/^#{1,6}\s/.test(trimmed)) return true;
  // 中文标题标记
  if (/^【.*】$/.test(trimmed)) return true;
  if (/^「.*」$/.test(trimmed)) return true;
  // 冒号结尾的标题
  if (/^[^\n]{1,20}[：:]\s*$/.test(trimmed)) return true;
  return false;
}

/**
 * 检测是否为列表项
 */
function isListItem(line: string): boolean {
  const trimmed = line.trim();
  // 数字列表
  if (/^\d+[\.\)、]\s/.test(trimmed)) return true;
  // 符号列表
  if (/^[-*+]\s/.test(trimmed)) return true;
  return false;
}

/**
 * 格式化提示词内容（增强版）
 * @param content 原始内容
 * @returns 格式化后的内容
 */
export function formatPromptContent(content: string): string {
  if (!content) return '';

  // 1. 统一换行符为 \n
  let formatted = content.replace(/\r\n/g, '\n');
  
  // 2. 统一全角/半角标点（可选）
  // 统一冒号
  formatted = formatted.replace(/：(?=\s*\n)/g, '：');
  // 统一逗号
  formatted = formatted.replace(/，/g, '，');
  // 统一句号
  formatted = formatted.replace(/。/g, '。');

  // 3. 分行处理
  const lines = formatted.split('\n');
  const result: string[] = [];
  let inProtectedBlock = false;
  let protectedBlockType = '';
  let prevLineType: 'empty' | 'title' | 'list' | 'normal' | 'protected' = 'empty';
  let lastWasParagraph = false; // 追踪上一个是否为段落

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // 检测代码块开始/结束
    if (trimmedLine.startsWith('```')) {
      if (!inProtectedBlock) {
        inProtectedBlock = true;
        protectedBlockType = 'code';
        // 代码块前加空行（如果前面不是空行）
        if (prevLineType !== 'empty' && result.length > 0) {
          result.push('');
        }
      } else {
        inProtectedBlock = false;
        protectedBlockType = '';
      }
      result.push(line.trimEnd());
      prevLineType = 'protected';
      continue;
    }
    
    // 保护块内容，保持原样
    if (inProtectedBlock) {
      result.push(line);
      prevLineType = 'protected';
      continue;
    }
    
    // 空行处理
    if (trimmedLine === '') {
      // 避免连续多个空行
      if (prevLineType !== 'empty') {
        result.push('');
        prevLineType = 'empty';
      }
      continue;
    }
    
    // 标题处理
    if (isTitleLine(line)) {
      // 标题前加空行（如果前面不是空行）
      if (prevLineType !== 'empty' && result.length > 0) {
        result.push('');
      }
      result.push(line.trimEnd());
      prevLineType = 'title';
      continue;
    }
    
    // 列表项处理
    if (isListItem(line)) {
      result.push(line.trimEnd());
      prevLineType = 'list';
      continue;
    }
    
    // 其他内容保护
    if (isProtectedBlock(line)) {
      result.push(line.trimEnd());
      prevLineType = 'protected';
      continue;
    }
    
    // 普通行 - 检测是否为段落结束
    const isParagraphEnd = trimmedLine.endsWith('。') || 
                          trimmedLine.endsWith('.') || 
                          trimmedLine.endsWith('！') || 
                          trimmedLine.endsWith('？') ||
                          trimmedLine.endsWith('」') ||
                          trimmedLine.endsWith(')') ||
                          trimmedLine.endsWith('）');
    
    result.push(line.trimEnd());
    
    // 如果是段落结束，且下一行不是空行/列表/标题，则添加空行
    if (isParagraphEnd && i < lines.length - 1) {
      const nextLine = lines[i + 1].trim();
      if (nextLine && !isListItem(lines[i + 1]) && !isTitleLine(lines[i + 1])) {
        // 检查下一行是否也是普通段落
        if (!nextLine.startsWith('```') && !nextLine.includes('|')) {
          lastWasParagraph = true;
        }
      }
    }
    
    prevLineType = 'normal';
  }

  // 3. 合并结果
  formatted = result.join('\n');

  // 4. 移除多余空行（超过2个连续换行变成2个）
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  
  // 5. 在句号后换行的地方，确保有空行分隔段落
  formatted = formatted.replace(/([。！？])\n([^\n])/g, '$1\n\n$2');

  // 5. 确保文本首尾没有多余空行
  formatted = formatted.trim();

  // 6. 确保文件以换行符结束
  if (formatted && !formatted.endsWith('\n')) {
    formatted += '\n';
  }

  return formatted;
}

/**
 * 为显示优化内容格式
 * 在保存时使用formatPromptContent，在显示时使用此函数
 * @param content 已格式化的内容
 * @returns 优化显示的内容
 */
export function optimizeContentDisplay(content: string): string {
  if (!content) return '';

  // 这里可以添加更多显示优化逻辑
  // 例如：识别Markdown语法、高亮关键词等
  // 目前保持简单，只做基本格式化
  return formatPromptContent(content);
}

/**
 * 检测内容是否包含Markdown语法
 * @param content 内容
 * @returns 是否包含Markdown
 */
export function hasMarkdownSyntax(content: string): boolean {
  if (!content) return false;

  // 检测常见的Markdown语法
  const markdownPatterns = [
    /^#{1,6}\s/m, // 标题
    /\*\*.*\*\*/,  // 粗体
    /\*.*\*/,      // 斜体
    /\[.*\]\(.*\)/, // 链接
    /^[-*+]\s/m,   // 无序列表
    /^\d+\.\s/m,   // 有序列表
    /```[\s\S]*```/, // 代码块
    /`.*`/,        // 行内代码
  ];

  return markdownPatterns.some((pattern) => pattern.test(content));
}
