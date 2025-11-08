/**
 * 格式化数字为紧凑格式
 * 
 * @param num - 数字
 * @returns 格式化后的字符串
 * 
 * @example
 * formatNumber(1234) // 返回 '1.2k'
 * formatNumber(1234567) // 返回 '1.2M'
 * formatNumber(123) // 返回 '123'
 */
export function formatNumber(num: number | null | undefined): string {
  // 处理空值
  if (num == null || isNaN(num)) {
    return '0';
  }
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

/**
 * 格式化数字，添加千位分隔符
 * 
 * @param num - 数字
 * @returns 格式化后的字符串
 * 
 * @example
 * formatNumberWithComma(1234567) // 返回 '1,234,567'
 */
export function formatNumberWithComma(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

