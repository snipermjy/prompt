# AI提示词库 - UI设计文档

## 文档说明

本文档记录AI提示词库项目的UI设计规范，包括布局、配色、字体、间距、组件尺寸等详细信息。

**文档版本**：v1.0  
**最后更新**：2025-11-04  
**设计风格**：卡片丰富风

---

## 一、整体设计风格

### 设计定位
- **风格**：卡片丰富风
- **特点**：圆角卡片、简洁现代、信息密度适中
- **用户体验**：清晰的层级结构、流畅的交互动画

### 核心设计原则
1. 简洁明了，信息层级清晰
2. 卡片化展示，便于浏览
3. 适度的动画效果，提升体验
4. 良好的响应式适配

---

## 二、配色方案（科技蓝）

### 主色调
```css
--primary: #3B82F6          /* 主色 - 蓝色 */
--primary-dark: #2563EB     /* 主色深色 */
--primary-light: #60A5FA    /* 主色浅色 */
```

### 辅助色
```css
--secondary: #8B5CF6        /* 辅助色 - 紫色 */
--success: #10B981          /* 成功 - 绿色 */
--text-primary: #1F2937     /* 主要文字 */
--text-secondary: #6B7280   /* 次要文字 */
--bg-gray: #FAFAFA          /* 背景灰色 */
```

### 功能色
```css
/* 热度显示 */
--hot-color: #F97316        /* 橙色 - 用于热度图标 */

/* 分类标签背景 */
--category-bg: #EFF6FF      /* 蓝色浅背景 */
--category-text: #1E40AF    /* 蓝色文字 */

/* 二级标签背景 */
--tag-bg: #F3E8FF           /* 紫色浅背景 */
--tag-text: #6B21A8         /* 紫色文字 */
--tag-hover: #7C3AED        /* 紫色悬停 */
```

### 边框和分隔线
```css
--border-gray: #E5E7EB      /* 浅灰色边框 */
--border-light: #F3F4F6     /* 极浅边框 */
```

---

## 三、字体规范

### 字体族
```css
font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
```

### 字体大小
```css
/* 标题 */
--text-3xl: 1.875rem  (30px)  /* 页面大标题 */
--text-2xl: 1.5rem    (24px)  /* 二级标题 */
--text-xl: 1.25rem    (20px)  /* Logo标题 */
--text-lg: 1.125rem   (18px)  /* 区块标题 */

/* 正文 */
--text-base: 1rem     (16px)  /* 卡片标题 */
--text-sm: 0.875rem   (14px)  /* 分类导航、按钮 */
--text-xs: 0.75rem    (12px)  /* 描述、标签、辅助信息 */
```

### 字重
```css
--font-bold: 700        /* 加粗 - 标题、Logo */
--font-semibold: 600    /* 半粗 - 卡片标题、分类名 */
--font-medium: 500      /* 中等 - 按钮、标签 */
--font-normal: 400      /* 常规 - 正文 */
```

---

## 四、首页布局设计

### 4.1 整体布局结构

```
┌─────────────────────────────────────────────────────────┐
│  顶部导航栏 (固定，81px高)                                │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│  左侧    │  右侧内容区                                   │
│  分类    │  - 排序筛选栏                                 │
│  导航    │  - 5列卡片网格                                │
│  (固定)  │  - 无限滚动                                   │
│          │                                              │
│  264px   │  flex-1                                      │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

### 4.2 尺寸规范

#### 顶部导航栏
```css
高度: 81px (含border)
内边距: px-6 py-4 (24px 16px)
最大宽度: 1920px
背景: #FFFFFF
边框: 底部 1px #F3F4F6
阴影: shadow-sm
定位: sticky top-0
层级: z-50
```

#### 左侧分类导航
```css
宽度: 256px
背景: #FFFFFF
边框: 右侧 1px #F3F4F6
最小高度: calc(100vh - 81px)
定位: sticky top-81px
内边距: p-4 (16px)
```

#### 右侧内容区
```css
宽度: flex-1
内边距: p-6 (24px)
背景: #FAFAFA (继承body)
```

---

## 五、组件设计规范

### 5.1 顶部导航栏组件

#### Logo区域
```css
容器:
  display: flex
  gap: 12px (gap-3)
  
Logo图标:
  尺寸: 40px × 40px (w-10 h-10)
  背景: linear-gradient(135deg, #3B82F6, #2563EB)
  圆角: 8px (rounded-lg)
  图标大小: 24px (w-6 h-6)
  图标颜色: #FFFFFF
  动画: pulse-slow (3s 无限循环)
  
文字:
  主标题: 20px (text-xl), 加粗 (font-bold), #1F2937
  副标题: 12px (text-xs), 常规, #6B7280
```

#### 搜索框
```css
容器:
  最大宽度: 32rem (max-w-2xl)
  flex: 1
  
输入框:
  宽度: 100%
  内边距: 20px 12px 20px 48px (py-3 px-5 pl-12)
  背景: #FAFAFA
  边框: 1px #E5E7EB
  圆角: 12px (rounded-xl)
  字体: 14px (text-sm)
  
  聚焦状态:
    边框: transparent
    外圈: 2px #3B82F6 + 阴影
  
搜索图标:
  尺寸: 20px (w-5 h-5)
  颜色: #9CA3AF
  位置: 绝对定位 left-4
```

#### 右侧按钮区
```css
主题切换按钮:
  内边距: 10px (p-2.5)
  圆角: 8px (rounded-lg)
  悬停: 背景 #F3F4F6
  图标: 20px, #4B5563
  
提交按钮:
  内边距: 10px 24px (py-2.5 px-6)
  背景: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)
  颜色: #FFFFFF
  圆角: 8px (rounded-lg)
  字重: 500 (font-medium)
  
  悬停:
    背景: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)
    向上移动: -2px
    阴影: 0 10px 20px -5px rgba(59,130,246,0.3)
```

### 5.2 左侧分类导航

#### 标题栏
```css
容器:
  display: flex
  justify-content: space-between
  margin-bottom: 16px (mb-4)
  
标题:
  字体: 14px (text-sm), 半粗 (font-semibold)
  颜色: #374151
  
折叠按钮:
  内边距: 4px (p-1)
  圆角: 4px (rounded)
  悬停: 背景 #F3F4F6
  图标: 16px, #4B5563
```

#### 分类项
```css
容器:
  内边距: 10px 12px (py-2.5 px-3)
  圆角: 8px (rounded-lg)
  边框左: 4px transparent
  光标: pointer
  过渡: 0.2s ease
  
图标:
  大小: 28px (text-2xl)
  
文字:
  字体: 14px (text-sm)
  颜色: #1F2937
  
计数徽章:
  字体: 12px (text-xs)
  颜色: #6B7280
  
  活跃状态:
    背景: #EFF6FF
    颜色: #2563EB
    内边距: 2px 8px
    圆角: 9999px (rounded-full)
  
悬停状态:
  背景: linear-gradient(90deg, rgba(59,130,246,0.1) 0%, transparent 100%)
  边框左颜色: #3B82F6
  
活跃状态:
  背景: linear-gradient(90deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.05) 100%)
  边框左颜色: #3B82F6
  颜色: #3B82F6
  字重: 600
```

#### 子分类
```css
容器:
  margin-left: 40px (ml-10)
  margin-top: 4px (mt-1)
  
子项:
  内边距: 6px 12px (py-1.5 px-3)
  字体: 14px (text-sm)
  颜色: #6B7280
  
  悬停:
    颜色: #2563EB
```

### 5.3 排序筛选栏

```css
容器:
  display: flex
  justify-content: space-between
  margin-bottom: 24px (mb-6)
  
统计文字:
  字体: 14px (text-sm)
  颜色: #4B5563
  高亮数字: #2563EB, font-semibold
  
排序按钮:
  内边距: 8px 16px (py-2 px-4)
  字体: 14px (text-sm), font-medium
  圆角: 8px (rounded-lg)
  过渡: 0.2s
  
  活跃状态:
    背景: #EFF6FF
    颜色: #2563EB
  
  非活跃:
    颜色: #4B5563
    悬停: 背景 #F3F4F6
```

### 5.4 提示词卡片（核心组件）

#### 整体尺寸
```css
高度: 135px (固定)
宽度: 自适应 (grid列宽)
背景: #FFFFFF
边框: 1px #E5E7EB
圆角: 8px (rounded-lg)
内边距: 12px 12px 16px 12px (px-3 pt-4 pb-3)
光标: pointer
```

#### 布局结构（从上到下）
```
┌─────────────────────────────────────┐
│ [标题 + 分类标签]           [热度]   │  第1行: mb-1.5 (6px)
│                                     │
│ 简介文字（2行）                      │  第2-3行: mt-2 mb-1.5
│                                     │
│ #标签1 #标签2 #标签3                │  最底行
└─────────────────────────────────────┘
```

#### 第一行：标题、分类、热度
```css
容器:
  display: flex
  justify-content: space-between
  margin-bottom: 6px (mb-1.5)
  
左侧容器:
  display: flex
  gap: 6px (gap-1.5)
  flex: 1
  min-width: 0
  
标题:
  字体: 16px (text-base), 半粗 (font-semibold)
  颜色: #111827
  行数限制: 1行 (line-clamp-1)
  flex-shrink: 允许收缩
  
分类标签:
  内边距: 2px 8px (py-0.5 px-2)
  背景: #EFF6FF
  颜色: #1E40AF
  字体: 12px (text-xs), font-medium
  圆角: 4px (rounded)
  flex-shrink: 0 (不收缩)
  
热度区域:
  display: flex
  gap: 2px (gap-0.5)
  颜色: #F97316
  flex-shrink: 0
  margin-left: 4px (ml-1)
  
  火焰图标: 16px (text-base)
  数字: 12px (text-xs), font-medium
```

#### 第二/三行：简介
```css
容器:
  margin-top: 8px (mt-2)
  margin-bottom: 6px (mb-1.5)
  flex: 1
  
文字:
  字体: 12px (text-xs)
  颜色: #4B5563
  行高: 1.5
  行数限制: 2行 (line-clamp-2)
```

#### 第四行：二级标签
```css
容器:
  display: flex
  flex-wrap: wrap
  gap: 4px (gap-1)
  
标签:
  内边距: 2px 6px (py-0.5 px-1.5)
  背景: #F3E8FF
  颜色: #6B21A8
  字体: 12px (text-xs)
  圆角: 4px (rounded)
  光标: pointer
  过渡: 0.2s ease
  
  悬停:
    背景: #7C3AED
    颜色: #FFFFFF
    缩放: 1.05
```

#### 卡片交互效果
```css
悬停:
  向上移动: -4px
  阴影: 0 20px 25px -5px rgba(59,130,246,0.1),
        0 10px 10px -5px rgba(59,130,246,0.04)
  过渡: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
  
点击:
  向上移动: -2px
  缩放: 0.98
```

### 5.5 卡片网格布局

```css
容器:
  display: grid
  gap: 12px (gap-3)
  
响应式列数:
  xl (1280px+):  5列  grid-cols-5
  lg (1024px+):  3列  grid-cols-3
  md (768px+):   2列  grid-cols-2
  默认:          1列  grid-cols-1
```

---

## 六、间距规范

### 内边距 (Padding)
```css
/* 容器级别 */
p-6:  24px    /* 主内容区 */
p-4:  16px    /* 左侧导航、区块内 */
p-3:  12px    /* 卡片内边距 */

/* 组件级别 */
py-4: 16px    /* 顶部导航垂直 */
px-6: 24px    /* 顶部导航水平 */
py-3: 12px    /* 搜索框、按钮 */
px-5: 20px    /* 搜索框 */

/* 小组件 */
py-2.5: 10px  /* 小按钮、分类项 */
px-3:   12px  /* 小按钮 */
py-0.5: 2px   /* 标签、徽章 */
px-2:   8px   /* 标签、徽章 */
```

### 外边距 (Margin)
```css
/* 区块间距 */
mb-6: 24px    /* 大区块间距 */
mb-4: 16px    /* 中等区块间距 */
mb-2: 8px     /* 小区块间距 */

/* 卡片内间距 */
mb-1.5: 6px   /* 卡片内元素间距 */
mt-2:   8px   /* 简介上边距 */

/* 组件间距 */
gap-6:  24px  /* 导航栏元素间距 */
gap-3:  12px  /* Logo元素、统计按钮 */
gap-2:  8px   /* 小按钮组 */
gap-1.5: 6px  /* 卡片标题区 */
gap-1:  4px   /* 标签组 */
gap-0.5: 2px  /* 紧密元素（如热度图标+数字）*/
```

### 网格间距
```css
卡片网格: gap-3 (12px)
```

---

## 七、圆角规范

```css
/* 大圆角 */
rounded-2xl: 16px   /* 大容器、模态框 */
rounded-xl:  12px   /* 搜索框、卡片、按钮 */

/* 中等圆角 */
rounded-lg:  8px    /* Logo图标、小卡片、分类项 */

/* 小圆角 */
rounded:     4px    /* 标签、徽章 */

/* 完全圆角 */
rounded-full: 9999px  /* 徽章、头像 */
```

---

## 八、阴影规范

```css
/* 导航栏 */
shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)

/* 卡片悬停 */
0 20px 25px -5px rgba(59, 130, 246, 0.1),
0 10px 10px -5px rgba(59, 130, 246, 0.04)

/* 按钮悬停 */
0 10px 20px -5px rgba(59, 130, 246, 0.3)

/* 输入框聚焦 */
0 0 0 3px rgba(59, 130, 246, 0.1)
```

---

## 九、动画与过渡

### 过渡效果
```css
/* 快速过渡 */
transition: all 0.2s ease
用于: 按钮、链接、标签悬停

/* 标准过渡 */
transition: all 0.3s ease
用于: 卡片、大组件

/* 平滑过渡 */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
用于: 卡片悬停、拖拽效果
```

### 动画效果
```css
/* Logo脉动动画 */
@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
animation: pulse-slow 3s ease-in-out infinite

/* 加载旋转 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 骨架屏闪烁 */
@keyframes shimmer {
  0% { background-position: -468px 0; }
  100% { background-position: 468px 0; }
}
```

---

## 十、响应式断点

### 断点定义
```css
sm:  640px   /* 小屏手机 */
md:  768px   /* 平板 */
lg:  1024px  /* 小笔记本 */
xl:  1280px  /* 桌面显示器 */
2xl: 1536px  /* 大显示器 */
```

### 首页响应式适配

#### 卡片网格
```css
默认 (< 768px):   1列
md (768px+):      2列
lg (1024px+):     3列
xl (1280px+):     5列
```

#### 导航适配
```css
桌面端 (md+):
  - 左侧导航固定显示
  - 顶部导航完整显示
  
移动端 (< md):
  - 左侧导航隐藏/折叠
  - 底部显示移动导航栏
  - 搜索框可能简化
```

---

## 十一、滚动条样式

```css
/* 宽度 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

/* 轨道 */
::-webkit-scrollbar-track {
  background: #F1F1F1;
}

/* 滑块 */
::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 4px;
}

/* 滑块悬停 */
::-webkit-scrollbar-thumb:hover {
  background: #94A3B8;
}
```

---

## 十二、特殊状态样式

### 空状态
```css
容器:
  text-align: center
  padding: 48px 24px
  
图标: 
  大小: 64px
  颜色: #D1D5DB
  
文字:
  颜色: #6B7280
  字体: 14px
```

### 加载状态
```css
容器:
  display: flex
  justify-content: center
  align-items: center
  padding: 48px 0
  
旋转图标:
  大小: 20px
  颜色: #6B7280
  动画: spin 1s linear infinite
  
文字:
  颜色: #6B7280
  字体: 14px
  margin-left: 12px
```

### 错误状态
```css
颜色: #EF4444
图标: 感叹号或叉号
```

---

## 十三、无障碍设计

### 聚焦状态
```css
所有可交互元素:
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:border-transparent
```

### 对比度
```css
文字与背景对比度: >= 4.5:1
大文字对比度: >= 3:1
```

### 可点击区域
```css
最小点击区域: 44px × 44px
按钮内边距保证足够大
```

---

## 十四、设计资源

### 图标库
- **Lucide Icons** (或类似的图标库)
- 使用SVG格式
- 图标大小: 16px, 20px, 24px

### 占位符
```css
背景色: #F3F4F6
文字色: #9CA3AF
边框色: #E5E7EB
```

---

## 十五、设计检查清单

### 布局检查
- [ ] 元素对齐是否一致
- [ ] 间距是否统一使用规范值
- [ ] 层级关系是否清晰

### 视觉检查
- [ ] 颜色使用是否符合配色方案
- [ ] 字体大小和字重是否正确
- [ ] 圆角是否统一

### 交互检查
- [ ] 悬停效果是否流畅
- [ ] 点击反馈是否明显
- [ ] 过渡动画是否自然

### 响应式检查
- [ ] 在不同屏幕尺寸下布局是否正常
- [ ] 文字是否可读
- [ ] 点击区域是否足够大

---

## 附录：常用CSS类名对照表

### Tailwind CSS 类名速查

| 类名 | CSS | 用途 |
|------|-----|------|
| `text-base` | `font-size: 1rem` | 卡片标题 |
| `text-sm` | `font-size: 0.875rem` | 分类、按钮 |
| `text-xs` | `font-size: 0.75rem` | 标签、描述 |
| `font-bold` | `font-weight: 700` | Logo、大标题 |
| `font-semibold` | `font-weight: 600` | 卡片标题 |
| `font-medium` | `font-weight: 500` | 按钮、标签 |
| `p-6` | `padding: 1.5rem` | 24px |
| `p-4` | `padding: 1rem` | 16px |
| `p-3` | `padding: 0.75rem` | 12px |
| `mb-6` | `margin-bottom: 1.5rem` | 24px |
| `mb-4` | `margin-bottom: 1rem` | 16px |
| `mb-2` | `margin-bottom: 0.5rem` | 8px |
| `gap-3` | `gap: 0.75rem` | 12px |
| `gap-1.5` | `gap: 0.375rem` | 6px |
| `rounded-xl` | `border-radius: 0.75rem` | 12px |
| `rounded-lg` | `border-radius: 0.5rem` | 8px |

---

## 十六、详情页设计规范

### 16.1 页面布局

#### 整体结构
```
┌─────────────────────────────────────────────────────────┐
│  顶部导航栏 (返回按钮 + Logo + 收藏按钮)                 │
├─────────────────────────────────────────────────────────┤
│  面包屑导航 (首页 > 分类 > 当前页)                       │
├─────────────────────────────────────────────────────────┤
│  标题信息区域                                            │
├──────────────────────────────────┬──────────────────────┤
│  提示词内容 (左侧，flex-1)        │  相关推荐 (右侧)      │
│                                  │  256px 固定宽度       │
└──────────────────────────────────┴──────────────────────┘
```

#### 容器尺寸
```css
最大宽度: max-w-7xl (1280px)
内边距: px-6 py-6
间距: gap-4 (16px)
```

### 16.2 顶部导航栏

```css
容器:
  高度: 81px (含border)
  背景: #FFFFFF
  边框: 底部 1px #F3F4F6
  定位: sticky top-0
  层级: z-50

返回按钮:
  内边距: p-2 (8px)
  圆角: 8px (rounded-lg)
  悬停: 背景 #F3F4F6
  图标: 20px (w-5 h-5)

Logo区域:
  与首页相同
  间距: gap-3 (12px)

收藏按钮:
  内边距: px-6 py-2.5
  字体: 14px (text-sm)
  圆角: 8px (rounded-lg)
  边框: 1px #E5E7EB
```

### 16.3 面包屑导航

```css
容器:
  display: flex
  align-items: center
  间距: gap-2 (8px)
  字体: 14px (text-sm)
  下边距: mb-4 (16px)

链接:
  颜色: #6B7280 (text-gray-500)
  悬停: #2563EB (text-blue-600)
  过渡: transition-colors
  
分隔符:
  图标: 右箭头 (chevron-right)
  大小: 16px (w-4 h-4)
  颜色: #9CA3AF (text-gray-400)

当前页:
  颜色: #1F2937 (text-gray-900)
  字重: 500 (font-medium)
  不可点击

示例结构:
  首页 > 营销文案 > 小红书爆款文案生成器
```

### 16.4 标题信息区域

```css
容器:
  背景: #FFFFFF
  圆角: 8px (rounded-lg)
  边框: 1px #E5E7EB
  内边距: p-4 (16px)
  下边距: mb-4 (16px)

布局层级:
  1. 标题行 (mb-2)
  2. 二级标签和语言 (mb-3)
  3. 描述文字 (mb-3)
  4. 适用AI模型和统计信息
```

#### 标题行
```css
容器:
  display: flex
  justify-content: space-between
  
标题:
  字体: 20px (text-xl)
  字重: 700 (font-bold)
  颜色: #1F2937
  
一级分类标签:
  位置: 标题后面，同一行
  内边距: px-2 py-0.5
  背景: #EFF6FF
  颜色: #1E40AF
  字体: 12px (text-xs)
  字重: 500 (font-medium)
  圆角: 4px (rounded)
  间距: gap-2
  
热度:
  图标: 16px (text-base) 🔥
  数字: 14px (text-sm)
  颜色: #F97316
```

#### 二级标签和语言
```css
容器:
  display: flex
  gap: 8px (gap-2)
  flex-wrap: wrap
  
二级标签:
  内边距: px-1.5 py-0.5
  背景: #F3E8FF
  颜色: #6B21A8
  字体: 12px (text-xs)
  圆角: 4px (rounded)
  悬停: 背景 #7C3AED, 颜色 #FFFFFF
  
语言信息:
  字体: 12px (text-xs)
  颜色: #6B7280
  分隔符: • (#D1D5DB)
```

#### 描述文字
```css
字体: 14px (text-sm)
颜色: #374151
行高: leading-relaxed (1.625)
下边距: mb-3 (12px)
```

#### 适用AI模型和统计信息
```css
容器:
  display: flex
  justify-content: space-between
  边框上: 1px #F3F4F6
  上内边距: pt-3 (12px)

左侧 - 适用AI模型:
  标题: 12px (text-xs), font-semibold
  模型标签间距: gap-1.5 (6px)
  
  模型标签:
    内边距: px-2.5 py-1
    字体: 12px (text-xs)
    字重: 500 (font-medium)
    圆角: 4px (rounded)
    颜色: 白色
    背景: 渐变
      - ChatGPT: green-400 to green-500
      - Claude: orange-400 to orange-500
      - 文心一言: blue-400 to blue-500
      - 通义千问: purple-400 to purple-500

右侧 - 统计信息:
  容器间距: gap-4 (16px)
  字体: 12px (text-xs)
  颜色: #6B7280
  
  图标: 16px (w-4 h-4)
  数字: font-medium, #1F2937
```

### 16.5 提示词内容区域

#### 标题和按钮行
```css
容器:
  display: flex
  justify-content: space-between
  align-items: center
  下边距: mb-3 (12px)

标题:
  字体: 18px (text-lg)
  字重: 600 (font-semibold)
  颜色: #1F2937

按钮组:
  间距: gap-2 (8px)
  
  复制按钮:
    背景: 渐变 (#3B82F6 to #2563EB)
    颜色: #FFFFFF
    内边距: px-4 py-2
    字体: 12px (text-xs)
    字重: 500 (font-medium)
    圆角: 8px (rounded-lg)
    图标: 14px (w-3.5 h-3.5)
    间距: gap-1.5
    
  分享按钮:
    背景: #FFFFFF
    颜色: #374151
    边框: 1px #E5E7EB
    内边距: px-4 py-2
    字体: 12px (text-xs)
    字重: 500 (font-medium)
    圆角: 8px (rounded-lg)
    图标: 14px (w-3.5 h-3.5)
    间距: gap-1.5
```

#### 内容框
```css
容器:
  背景: #FFFFFF
  圆角: 8px (rounded-lg)
  边框: 1px #E5E7EB
  内边距: p-6 (24px)

提示词内容:
  背景: #F9FAFB
  左边框: 4px #3B82F6
  内边距: p-6 (24px)
  圆角: 8px (rounded-lg)
  字体: 12px (text-xs)
  字体族: 'Consolas', 'Monaco', 'Courier New', monospace
  行高: leading-relaxed (1.625)
  换行: pre-wrap
```

### 16.6 相关推荐区域

#### 整体结构
```css
容器宽度: w-64 (256px, 固定)

标题:
  字体: 18px (text-lg)
  字重: 600 (font-semibold)
  颜色: #1F2937
  下边距: mb-3 (12px)

卡片容器:
  display: flex-col
  间距: gap-3 (12px)
```

#### 推荐卡片
```css
容器:
  背景: #FFFFFF
  圆角: 8px (rounded-lg)
  边框: 1px #E5E7EB
  内边距: p-3 (12px)
  光标: pointer
  高度: 自适应 (约 100-110px)

标题和热度:
  display: flex
  justify-content: space-between
  下边距: mb-1.5 (6px)
  
  标题:
    字体: 14px (text-sm)
    字重: 600 (font-semibold)
    颜色: #1F2937
    行数: 2行 (line-clamp-2)
    
  热度:
    图标: 14px (text-sm) 🔥
    数字: 12px (text-xs)
    颜色: #F97316

描述:
  字体: 12px (text-xs)
  颜色: #4B5563
  行数: 2行 (line-clamp-2)
  下边距: mb-2 (8px)

分类标签:
  内边距: px-2 py-0.5
  背景: #EFF6FF
  颜色: #1E40AF
  字体: 12px (text-xs)
  字重: 500 (font-medium)
  圆角: 4px (rounded)

悬停效果:
  上移: -4px
  阴影: 0 20px 25px -5px rgba(59,130,246,0.1),
        0 10px 10px -5px rgba(59,130,246,0.04)
  过渡: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
```

### 16.7 响应式适配

```css
桌面端 (默认):
  - 左右布局
  - 提示词内容: flex-1
  - 相关推荐: 256px

移动端 (< md):
  - 建议改为上下布局
  - 相关推荐改为横向滚动或隐藏
```

### 16.8 交互状态

#### 按钮点击反馈
```css
复制按钮:
  点击后显示"已复制"
  背景变为绿色 (bg-green-500)
  2秒后恢复

分享按钮:
  点击后复制链接到剪贴板
  显示Toast提示
```

#### Toast提示
```css
位置: top-100px, 居中
背景: #10B981 (成功) / #EF4444 (错误)
颜色: #FFFFFF
内边距: px-6 py-3
圆角: 8px (rounded-lg)
阴影: shadow-lg
显示时长: 3秒
```

### 16.9 详情页与首页的一致性

#### 相同元素
- Logo和导航栏样式
- 卡片圆角和阴影
- 颜色方案
- 字体规范
- 标签样式
- 热度显示

#### 差异点
- 详情页标题更大 (20px vs 16px)
- 详情页有返回按钮
- 详情页有收藏按钮
- 详情页有面包屑导航
- 详情页布局为左右结构

---

## 十七、用户提交表单页设计规范

### 17.1 整体风格

```css
设计原则: 简洁、紧凑、易用

与首页保持一致:
  背景色: #FAFAFA (var(--bg-gray))
  配色方案: 科技蓝主题
  卡片圆角: 8px (rounded-lg)
  输入框圆角: 8px (rounded-lg)
  按钮圆角: 8px (rounded-lg)
  字体: 'PingFang SC', 'Microsoft YaHei'

页面布局:
  最大宽度: max-w-4xl (896px)
  内边距: px-6 py-6
  底部内边距: pb-8
```

### 17.2 面包屑导航

```css
位置: 主内容区顶部
容器:
  display: flex
  align-items: center
  间距: gap-2 (8px)
  字体: 14px (text-sm)
  下边距: mb-5 (20px)

链接:
  颜色: #6B7280 (text-gray-500)
  悬停: #2563EB (text-blue-600)
  过渡: transition-colors
  
分隔符:
  图标: 右箭头 (chevron-right)
  大小: 16px (w-4 h-4)
  颜色: #9CA3AF (text-gray-400)

当前页:
  颜色: #1F2937 (text-gray-900)
  字重: 500 (font-medium)
  不可点击

示例结构:
  首页 > 提交提示词
```

### 17.3 页面标题

```css
布局:
  display: flex
  align-items: center
  间距: gap-3 (12px)
  下边距: mb-5 (20px)

图标容器:
  大小: w-12 h-12 (48px)
  背景: #DBEAFE (bg-blue-100)
  圆角: 8px (rounded-lg)
  flex-shrink: 0
  
图标:
  大小: w-6 h-6 (24px)
  颜色: #2563EB (text-blue-600)
  类型: 加号图标

标题文字:
  字体: 24px (text-2xl)
  字重: 700 (font-bold)
  颜色: #1F2937 (text-gray-900)

注意:
  - 不显示副标题或说明文字
  - 图标和标题在同一行，左对齐
```

### 17.4 表单容器

```css
容器:
  背景: #FFFFFF
  圆角: 8px (rounded-lg)
  边框: 1px #E5E7EB (border-gray-200)
  内边距: p-6 (24px)
  
字段间距:
  mb-4 (16px)
```

### 17.5 表单字段规范

#### 提示词内容（必填）
```css
类型: textarea
行数: 10行
字体: monospace (font-mono), 14px (text-sm)
内边距: px-4 py-3
最大字符: 10000
圆角: 8px (rounded-lg)
边框: 1px #D1D5DB (border-gray-300)

标签:
  字体: 14px (text-sm)
  字重: 600 (font-semibold)
  颜色: #1F2937 (text-gray-900)
  下边距: mb-2

提示文字:
  字体: 12px (text-xs)
  颜色: #6B7280 (text-gray-500)
  上边距: mt-2

字符计数器:
  位置: 右侧
  字体: 12px (text-xs)
  颜色:
    - 默认: #6B7280
    - 70%+: #F59E0B (warning)
    - 90%+: #EF4444 (danger)
```

#### 提示词简介/说明（选填）
```css
类型: textarea
行数: 2行
字体: 14px (text-sm)
内边距: px-4 py-2.5
最大字符: 200
建议长度: 50-200字
圆角: 8px (rounded-lg)
边框: 1px #D1D5DB

提示文字:
  上边距: mt-1.5
  
字符计数器: 与内容字段相同规则
```

#### 提交人信息区域（选填）
```css
容器:
  背景: #EFF6FF (bg-blue-50)
  圆角: 8px (rounded-lg)
  内边距: p-5 (20px)
  下边距: mb-4

标题:
  字体: 14px (text-sm)
  字重: 600 (font-semibold)
  颜色: #1F2937 (text-gray-900)
  下边距: mb-3 (12px)
  display: flex
  align-items: center
  gap: 8px
  
标题图标:
  用户图标 (user icon)
  大小: 20px (w-5 h-5)
  颜色: #2563EB (text-blue-600)

说明文字:
  字体: 12px (text-xs)
  颜色: #4B5563 (text-gray-600)
  下边距: mb-3

字段布局:
  PC端: 2列网格 (md:grid-cols-2)
  移动端: 1列
  间距: gap-4

输入框:
  内边距: px-3 py-2
  字体: 14px (text-sm)
  圆角: 8px (rounded-lg)
  边框: 1px #D1D5DB

包含字段:
  1. 账号名称
     - 类型: text input
     - 最大字符: 50
     - 占位符: "例如：小红书昵称、B站UP主名"
  
  2. 账号链接
     - 类型: url input
     - 占位符: "https://..."
```

#### 邮箱地址（选填）
```css
类型: email input
内边距: px-3 py-2
字体: 14px (text-sm)
圆角: 8px (rounded-lg)
边框: 1px #D1D5DB

标签区域:
  display: flex
  justify-content: space-between
  align-items: center
  mb-2

标签:
  包含emoji 📧
  字体: 14px (text-sm)
  字重: 600 (font-semibold)

辅助文字:
  字体: 12px (text-xs)
  颜色: #6B7280 (text-gray-500)

说明文字:
  上边距: mt-1.5
  字体: 12px (text-xs)
```

### 17.6 提交须知

```css
容器:
  背景: #EFF6FF (bg-blue-50)
  边框: 1px #DBEAFE (border-blue-100)
  圆角: 8px (rounded-lg)
  内边距: p-4 (16px)
  下边距: mb-4

标题:
  字体: 14px (text-sm)
  字重: 600 (font-semibold)
  颜色: #1E3A8A (text-blue-900)
  下边距: mb-2
  display: flex
  align-items: center
  gap: 8px
  
图标:
  信息图标 (info icon)
  大小: w-5 h-5

列表:
  字体: 12px (text-xs)
  颜色: #1E40AF (text-blue-800)
  间距: space-y-1.5
  左边距: ml-7 (与标题对齐)
```

### 17.7 同意条款

```css
容器:
  下边距: mb-5 (20px)

布局:
  display: flex
  align-items: start
  间距: gap-2.5 (10px)
  cursor: pointer

复选框:
  上边距: mt-0.5
  大小: w-4 h-4
  颜色: #2563EB (text-blue-600)
  边框: #D1D5DB (border-gray-300)
  圆角: rounded
  聚焦环: ring-blue-500

文字:
  字体: 14px (text-sm)
  颜色: #374151 (text-gray-700)
```

### 17.8 按钮组

```css
容器:
  display: flex
  align-items: center
  间距: gap-3 (12px)

提交按钮:
  背景: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)
  圆角: 8px (rounded-lg)
  内边距: px-6 py-3
  字体: 14px
  字重: 600 (font-semibold)
  颜色: #FFFFFF
  宽度: flex-1
  display: flex
  align-items: center
  justify-content: center
  gap: 8px
  
  悬停效果:
    - 背景: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)
    - 向上移动: translateY(-2px)
    - 阴影: 0 10px 20px -5px rgba(59, 130, 246, 0.3)
  
  禁用状态:
    - 透明度: 0.5
    - cursor: not-allowed

取消按钮:
  边框: 1px #D1D5DB (border-gray-300)
  圆角: 8px (rounded-lg)
  内边距: px-6 py-3
  字体: 14px
  字重: 600 (font-semibold)
  颜色: #374151 (text-gray-700)
  
  悬停: 背景 #F9FAFB (bg-gray-50)
```

### 17.9 底部提示

```css
容器:
  text-align: center
  上边距: mt-6 (24px)
  字体: 12px (text-xs)
  颜色: #6B7280 (text-gray-500)

内容:
  "提交即代表您同意我们使用AI技术对您的提示词进行分析和优化"
```

### 17.10 成功模态框

```css
遮罩:
  背景: rgba(0, 0, 0, 0.5)
  位置: fixed
  层级: z-50

容器:
  背景: #FFFFFF
  圆角: 8px (rounded-lg)
  内边距: p-8 (32px)
  最大宽度: max-w-md
  文字对齐: center

图标:
  大小: w-16 h-16 (64px)
  背景: #D1FAE5 (bg-green-100)
  圆角: rounded-full
  图标颜色: #059669 (text-green-600)
  下边距: mb-4

标题:
  字体: 24px (text-2xl)
  字重: 700 (font-bold)
  颜色: #1F2937
  下边距: mb-2

说明:
  字体: 16px
  颜色: #4B5563 (text-gray-600)
  下边距: mb-6

按钮组:
  display: flex
  flex-direction: column
  间距: gap-3

主按钮:
  蓝色渐变
  圆角: 8px (rounded-lg)
  
次按钮:
  灰色边框
  圆角: 8px (rounded-lg)
```

### 17.11 响应式设计

```css
移动端 (< md):
  - 容器内边距减小
  - 提交人信息改为1列布局
  - 按钮可能堆叠显示
  
PC端 (≥ md):
  - 提交人信息2列布局
  - 按钮横向排列
```

### 17.12 交互状态

```css
输入框聚焦:
  边框: #3B82F6 (border-blue-600)
  阴影: 0 0 0 3px rgba(59, 130, 246, 0.1)
  outline: none
  过渡: transition-all

按钮加载状态:
  禁用: disabled
  显示: 旋转图标
  文字: "提交中..."
  
字符计数器:
  颜色变化: transition-colors (0.2s ease)
```

---

## 十八、管理后台设计规范

### 18.1 面包屑导航（子页面）

```css
位置: 顶部栏下方
容器:
  内边距: px-8 pt-6
  
导航样式:
  display: flex
  align-items: center
  间距: gap-2 (8px)
  字体: 14px (text-sm)

链接:
  颜色: #6B7280 (text-gray-500)
  悬停: #2563EB (text-blue-600)
  过渡: transition-colors
  
分隔符:
  图标: 右箭头 (chevron-right)
  大小: 16px (w-4 h-4)
  颜色: #9CA3AF (text-gray-400)

当前页:
  颜色: #1F2937 (text-gray-900)
  字重: 500 (font-medium)
  不可点击

示例结构:
  管理后台 > 提示词管理 > 添加提示词

注意:
  - 管理后台首页（概览）不需要面包屑
  - 只在子页面显示面包屑导航
```

---

## 十九、提示词来源信息显示规范

### 19.1 功能说明

为了感谢原作者，当提示词来自其他平台或作者时，需要展示来源信息。用户可以点击作者名称跳转到原作者的社交媒体账号。

### 19.2 数据库字段

```sql
author_name: varchar(100)  -- 来源作者名称（如：小红书昵称、B站UP主名）
author_link: varchar(500)  -- 来源作者链接（完整URL）
```

### 19.3 首页卡片显示

```css
位置: 卡片底部右侧，与标签同行
显示条件: 仅当 author_name 和 author_link 字段不为空时显示

容器:
  display: flex
  justify-content: space-between
  align-items: center
  gap: 8px (gap-2)

标签区域:
  flex: 1
  min-width: 0
  flex-wrap: wrap

来源区域:
  flex-shrink: 0
  字体: 12px (text-xs)
  颜色: #6B7280 (text-gray-500)
  悬停: #2563EB (text-blue-600)
  字重: 500 (font-medium)
  过渡: transition-colors
  
图标:
  用户图标 (user icon)
  大小: 12px (w-3 h-3)
  
格式:
  @作者名称
  
交互:
  - 点击打开作者链接（target="_blank"）
  - 点击时阻止事件冒泡（onclick="event.stopPropagation()"）
  - 悬停显示蓝色
  - title="来源作者"

示例HTML:
<a href="{author_link}" target="_blank" 
   class="flex items-center gap-0.5 text-xs text-gray-500 hover:text-blue-600 transition-colors flex-shrink-0" 
   onclick="event.stopPropagation()" 
   title="来源作者">
    <svg class="w-3 h-3">...</svg>
    <span class="font-medium">@{author_name}</span>
</a>
```

### 19.4 详情页显示

```css
位置: 描述下方，适用AI模型上方
显示条件: 仅当 author_name 和 author_link 字段不为空时显示

容器:
  display: flex
  align-items: center
  gap: 6px (gap-1.5)
  下边距: mb-3 (12px)
  下边框: border-b border-gray-100
  内边距: pb-3 (12px)

文字样式:
  字体: 14px (text-sm)
  颜色: #4B5563 (text-gray-600)

链接图标:
  大小: 16px (w-4 h-4)
  颜色: #6B7280 (text-gray-500)

用户图标:
  大小: 14px (w-3.5 h-3.5)

作者链接:
  颜色: #2563EB (text-blue-600)
  悬停: #1D4ED8 (text-blue-700)
  字重: 500 (font-medium)
  过渡: transition-colors

外部链接图标:
  大小: 12px (w-3 h-3)
  位置: 作者名称右侧

格式:
  来源： @作者名称 [外部链接图标]
  
示例HTML:
<div class="flex items-center gap-1.5 text-sm text-gray-600 mb-3 pb-3 border-b border-gray-100">
    <svg class="w-4 h-4 text-gray-500">链接图标</svg>
    <span class="text-xs">来源：</span>
    <a href="{author_link}" target="_blank" 
       class="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors">
        <svg class="w-3.5 h-3.5">用户图标</svg>
        <span>@{author_name}</span>
        <svg class="w-3 h-3">外部链接图标</svg>
    </a>
</div>
```

### 19.5 用户提交时填写

在用户提交表单中，用户可以选填：
- **账号名称**：自媒体账号名称（最大50字符）
- **账号链接**：自媒体账号URL地址

这些信息会保存到 `author_name` 和 `author_link` 字段，审核通过后展示。

---

## 二十、管理后台 - 添加提示词页面设计规范

### 20.1 整体风格

```css
与前端保持一致:
  背景色: #FAFAFA (var(--bg-gray))
  配色方案: 科技蓝主题
  圆角: 8px (rounded-lg)
  字体: 'PingFang SC', 'Microsoft YaHei'

设计原则: 简洁、紧凑、高效
```

### 20.2 适用AI模型字段（标签输入模式）

#### 设计理念
既支持AI自动生成任意模型名称，也支持用户手动输入或快速选择常见模型。采用标签输入模式，灵活性更高。

#### 容器样式
```css
背景: #FFFFFF
圆角: 8px (rounded-lg)
边框: 1px #E5E7EB (border-gray-200)
内边距: p-4 (16px)
下边距: mb-4

AI字段标识:
  背景: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)
  左边框: 3px solid #8B5CF6
```

#### 标签输入框
```css
容器类: .tag-input
  display: flex
  flex-wrap: wrap
  gap: 8px (gap-2)
  padding: 12px
  border: 1px #D1D5DB
  border-radius: 8px (rounded-lg)
  min-height: 100px
  cursor: text

输入框:
  flex: 1
  min-width: 200px
  outline: none
  border: none
  font-size: 14px (text-sm)
  placeholder: "AI将自动生成，您也可以手动添加..."

输入方式:
  - 按 Enter 键添加
  - 按 逗号(,) 键添加
  - 点击快速选择按钮添加
```

#### 已添加的模型标签
```css
标签样式 (.tag-item):
  display: inline-flex
  align-items: center
  gap: 8px
  padding: 6px 12px (px-1.5 py-0.5)
  background: #EFF6FF (bg-blue-50)
  color: #1E40AF (text-blue-800)
  border-radius: 8px (rounded)
  font-size: 14px (text-sm)
  transition: all 0.2s

删除按钮:
  display: flex
  align-items: center
  justify-content: center
  width: 16px
  height: 16px
  border-radius: 50%
  background: rgba(30, 64, 175, 0.2)
  color: #1E40AF
  font-size: 12px
  transition: all 0.2s
  
  悬停:
    background: rgba(30, 64, 175, 0.3)
```

#### 快速选择按钮组
```css
位置: 输入框下方
上边距: mt-2 (8px)

布局:
  display: flex
  flex-wrap: wrap
  gap: 6px (gap-1.5)

提示文字:
  字体: 12px (text-xs)
  颜色: #6B7280 (text-gray-500)
  内容: "快速选择："

选择按钮:
  内边距: px-2 py-0.5
  背景: #F3F4F6 (bg-gray-100)
  颜色: #374151 (text-gray-700)
  字体: 12px (text-xs)
  圆角: rounded
  过渡: transition-colors
  
  悬停:
    背景: #DBEAFE (bg-blue-100)
    颜色: #1D4ED8 (text-blue-700)
  
常见选项:
  - ChatGPT
  - Claude
  - Gemini
  - 文心一言
  - 通义千问
  - Midjourney
```

#### JavaScript 交互逻辑
```javascript
功能:
  1. handleAIModelInput(event)
     - 监听 Enter 和 逗号键
     - 验证输入值非空
     - 防止重复添加
     - 清空输入框
  
  2. addAIModel(model)
     - 快速选择按钮点击
     - 检查是否已存在
     - 添加到数组并渲染
  
  3. removeAIModel(model)
     - 删除按钮点击
     - 从数组中移除
     - 重新渲染列表
  
  4. renderAIModels()
     - 清空容器
     - 遍历数组创建标签元素
     - 追加输入框到末尾

数据存储:
  let aiModels = [];  // 全局数组存储所有已添加的模型
```

### 20.3 AI生成行为

```css
AI生成时:
  1. 分析提示词内容的特征和用途
  2. 自动选择最适合的AI模型
  3. 可能生成常见模型（ChatGPT、Claude等）
  4. 也可能生成特定模型（如 GPT-4、DALL-E 3、Stable Diffusion等）
  5. 支持任意模型名称，不限于预设选项

用户调整:
  - 可以删除AI生成的任何模型
  - 可以手动输入任何模型名称
  - 可以通过快速选择添加常见模型
  - 输入完全自由，无固定选项限制
```

### 20.4 数据库存储

```sql
字段类型: text[]
存储示例: ["ChatGPT", "Claude", "GPT-4", "自定义模型名"]
说明: 支持存储任意模型名称的数组，不做枚举限制
```

### 20.5 优势说明

```
相比checkbox模式的优势:
  1. 灵活性 - AI可以生成任意模型名称，不受预设选项限制
  2. 可扩展 - 新出现的AI模型无需修改代码
  3. 用户友好 - 快速选择+手动输入双重方式
  4. 一致性 - 与标签字段的交互方式保持一致
  5. 未来兼容 - 自动适应AI技术的快速发展
```

---

**设计文档持续更新中...**

下一步：将记录管理后台其他页面的详细设计规范。

