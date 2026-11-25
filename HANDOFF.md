# JTW360 交接与状态快照（HANDOFF）

> **定位**：多账号 / 多模型切换时的**唯一热态入口**。新会话先读本文件即可接手，无需重读全库。
> **维护红线**：全文保持 **≤ 220 行**；第 1 节覆写、第 5 节倒序保留最新 **10 条**，超出归档至 `docs/handoff_archive/YYYY-MM.md`。

---

## 1. 当前状态快照（覆写区）

- **最后更新**：2026-11-25
- **仓库与分支**：`origin` = `https://github.com/cr3241389/jtw360.git`｜当前分支 `main`（已与 `origin/main` 同步）
- **基线 HEAD**：已完整回退 `fdd3076` / `6566376`，全站线上代码与图片 100% 还原至 `9620e09`（业务版本 `8f061c9`）
- **线上形态**：纯静态零构建站，托管于 Vercel（域名 `https://www.jtw360.com`），通过 `vercel.json` 处理详情/攻略重写路由；推送 `main` 后自动触发 Vercel 生产部署
- **当前进行中任务**：无（已回退上线，待排查 `fdd3076` 具体问题）
- **未提交改动**：无（仅保留第 4 节所列未跟踪本地文件）
- **待验证项**：确认 Vercel 重新部署后线上恢复至 `8f061c9` 正常状态
- **下一步建议**：向用户确认 `fdd3076` 出现的具体问题（如图片显示、样式、路由或某项交互），再做最小化定向修复

---

## 2. 硬性约束与红线

1. **纯静态零构建**：仓库无 `package.json`、无打包器、无后端 API；修改 `index.html` / `gemini_theme.css` / `liquid_glass.js` 即刻生效。
2. **严禁 `git add .` / `git add -A`**：根目录长期保留多个未跟踪的本地/历史文件（见第 4 节），提交时**必须显式指定文件路径**，且未经用户允许不要删除这些未跟踪文件。
3. **样式与主题双层机制**：
   - `index.html` 先引入外部 `gemini_theme.css`（L29），随后有内联 `<style>`（L36–1858）与防闪烁脚本（L31–35，写入 `html.dark`）；运行时切换主题操作 `body.dark-mode` 与 `localStorage['jtw360-theme']`。
   - `gemini_theme.css` 定义 Liquid Glass 材质与 `body.dark-mode, .dark` 覆盖变量；`liquid_glass.js`（L30 `defer`）负责精细指针光斑 `--lg-x/--lg-y` 及 Chromium SVG 折射滤镜 `#lg-refract`。
   - 改视觉/暗黑模式/移动端底栏时，**必须同时检查 `index.html` 内联 `<style>` 与 `gemini_theme.css`**，避免选择器优先级冲突。
4. **图片与 SEO 红线**：
   - `img/` 经多轮 WebP/JPEG 瘦身（当前 52 张约 7.7 MB），新增图片必须压缩后再入库，禁止堆放未引用的大图。
   - 动态 SEO（`updateSeo()`）与 `og:image` / `canonical` 基准域名固定为 `https://www.jtw360.com`，改动路由或默认分享图时需同步核对 `vercel.json` 与 `<head>` meta。
5. **文档不随站点发布**：`HANDOFF.md`、`AGENTS.md`、`GEMINI.md`、`docs/handoff_archive/`、`.workbuddy/` 等已写入 `.vercelignore`，避免暴露在公网静态路径下。

---

## 3. 代码地图与 `index.html` 分段索引

### 3.1 线上核心文件

| 文件 | 规模 | 职责 |
| :--- | :--- | :--- |
| `index.html` | 2,829 行 | 主站单页应用（SEO meta + 基础 CSS + 全站 HTML + 全部数据 + 交互脚本；已移除搜索框，首屏 3×3 全功能宫格） |
| `gemini_theme.css` | 633 行 | Liquid Glass 液态毛玻璃设计系统（光影令牌、宫格/卡片/按钮/浮层、移动端悬浮胶囊导航） |
| `liquid_glass.js` | 69 行 | 桌面端卡片指针高光（`--lg-x/--lg-y`）+ Chromium `backdrop-filter: url(#lg-refract)` 折射滤镜 |
| `vercel.json` | 8 行 | 静态站 4 条 rewrite：`/places/:slug`、`/guides/:slug`、`/food/:slug`、`/parking/:slug` → `/index.html` |
| `eng.html` | 634 行 | 独立工具页「English Tense Builder（英语时态积木墙）」，不挂载在主站导航 |
| `img/` | 52 张 / 7.7 MB | 静态图片：`img/`（景点与设施实拍）、`img/food/`（餐饮缩略图+菜单图）、`img/generated/`（首图/停车场/玻璃海等 WebP） |

### 3.2 `index.html` 精准行号定位（改局部时直接读对应区段）

| 行号区间 | 模块 | 关键标识 / 函数 |
| :--- | :--- | :--- |
| `L1–L35` | Head / SEO / 资源引入 | `og:*`、`twitter:*`、`canonical`、`<base href="/">`、`gemini_theme.css`、`liquid_glass.js`、暗黑防闪烁脚本 |
| `L36–L1798` | 基础内联样式 | `:root` / `body.dark-mode` 变量、紧凑 Hero、首屏 3×3 宫格（桌面 9×1）、5 项底栏 `.bottom-nav` 与角标 `.nav-badge` |
| `L1800–L1832` | 结构化数据 + SVG 雪碧图 | `application/ld+json`；图标 `#i-sun` `#i-pin` `#i-map` `#i-food` `#i-car` `#i-hospital` `#i-bag` `#i-bolt` `#i-camera` `#i-book` `#i-heart` `#i-user` `#i-arrow` `#i-back` `#i-moon` `#i-share` `#i-compass` |
| `L1835–L1986` | 首页视图 `#homeView` | 紧凑 Hero、首屏 3×3 宫格 `#quickActions`、首屏便民速查面板 `#quickResourcePanel`、置顶收藏 `#favorites`、景点 `#nearby`、美食 `#food`、攻略 `#guides`、便民 `#tools` |
| `L1988–L2029` | 详情视图 + 底部导航 + 弹窗 | `#detailView`、5 项 `.bottom-nav`（含 `#favBadge`）、`#lightbox`、`#wechatModal`（房东微信 `feel607`） |
| `L2031–L2143` | 全站内置数据源 | `AMap()`、`parseDist()`、`places`(15, 距离升序)、`foods`(12: 前9常规+后3错峰)、`hospitals`(2)、`parking`(5: 前3免费+后2二马路)、`luggage`(4)、`charging`(3)、`utilityPlaces`(1)、`guides`(5)、`allItems` |
| `L2144–L2445` | 渲染/宫格速查/筛选/收藏 | `text()`、`card()`、`quickActions`(9 项)、`openQuickResource()`、`setFoodFilter()`、`resourceData`、`showResource()`、`toggleFavorite()` / `renderFavorites()` |
| `L2447–L2721` | 详情/攻略/SEO/灯箱 | `lastHomeScrollY`、`openDetail()`、`openGuide()`、`updateSeo()`、`openLightbox()` / `closeLightbox()` |
| `L2723–L2827` | 路由/导航监听/双语/主题 | `routeFromUrl()`、`updateNavSpy()`（按可视位置选最近区块）、`applyLanguage()` / `setLanguage()`、`applyTheme()` |

### 3.3 客户端存储键（`localStorage`）

- `jtw360-theme`：`'dark'` / `'light'`（未设置时跟随系统 `prefers-color-scheme`）
- `jtw360-language`：`'zh'` / `'en'`（通过 `[data-lang]` / `[data-lang-en]` 切换）
- `jtw360-favorites`：收藏地点的 `slug` 字符串数组 JSON

---

## 4. 未跟踪与辅助文件清单（避免新号反复排查）

- **已跟踪但非线上核心**：`create_placeholders.py`（早期占位图脚本）、根目录 `jinxia.jpg` & `magong.jpg`（早期副本；主站实际引用 `img/jinxia.jpg` 和 `img/magong.jpg`）。
- **未跟踪本地文件（勿 `git add`、勿误删）**：`.DS_Store`、`.workbuddy/`（含早期单条同步记忆）、`CODE.JPG`、`index.html.bak`、`index.html.bak2`、`jtw360.code-workspace`、`patch.js`、`patch2.js`、`patch3.js`。
- **其他分支参考**：`check`（早期优化分支，已合入 `main`）、`dev-sync`（历史同步分支）、`trae/solo-agent-MexZNd`（早期改版分支）；日常开发统一在 `main`。

---

## 5. 最近任务日志（倒序置顶 · 滚动上限 10 条）

> 超出 10 条时将最旧条目移入 `docs/handoff_archive/YYYY-MM.md`。每条严格控制在 ≤ 6 行。

### [2026-11-25] 回退 `fdd3076` / `6566376` 至上一稳定版本 `9620e09`（业务代码 `8f061c9`）
- **目标**：用户反馈 `fdd3076` 上线版本存在问题，立即安全回滚线上代码与图片至上一版本。
- **改动**：使用 `git revert` 完整撤回 `fdd3076`（图片 WebP 瘦身及路由/分享/SEO/PWA 改动）与 `6566376`，使线上所有代码、配置与 52 张图片 100% 字节级恢复为 `9620e09` 状态，并推送 `origin/main` 触发 Vercel 重新部署。
- **验证**：已通过 `git diff --stat 9620e09` 确认除 `HANDOFF.md` 外零差异，且未跟踪本地文件原样保留。
- **遗留与下一步**：待用户告知具体故障现象后，再从 `fdd3076` 历史中精准定位原因。

### [2026-11-22] 移动端首屏 3×3 全功能宫格重构 & 移除搜索框
- **目标**：面向移动端核心用户去掉多余搜索框，压缩 Hero，第一屏直接以宫格呈现全部功能模块并减少长距离翻页。
- **改动**：`index.html`、`gemini_theme.css`、`liquid_glass.js`——移除 Hero 搜索框/吸顶搜索条/搜索结果区；移动端收紧 Hero 高度并将入口升级为 3×3 全功能宫格（景点/美食/攻略 + 6 项便民，含数量微副标与中英文）；点击便民宫格直接在九宫格下方原地展开 `#quickResourcePanel`；收藏夹 `#favorites` 置顶按需展开；底部悬浮导航升级为 5 项并增加收藏角标 `#favBadge`；修复移动端 `.lang-button` 居中及原 `#favorites` 多余闭合 `</div>`。
- **验证**：已通过 `node --check` 校验全部脚本语法，并在 T3 Preview（iPhone 12 Pro `390×844`）完成首屏渲染与「免费停车」原地展开/收起实测。
- **遗留与下一步**：已提交并推送至 `origin/main` 触发部署。

### [2026-11-22] 建立多账号/多模型热态交接日志体系
- **目标**：解决多 Gemini 账号切换后重读全库耗时、且原 `.workbuddy/memory/2026-10-28.md` 严重过时的问题。
- **改动**：新建 [HANDOFF.md](HANDOFF.md)、[AGENTS.md](AGENTS.md)、[GEMINI.md](GEMINI.md)、[.vercelignore](.vercelignore)，并将旧记录归档至 [docs/handoff_archive/2026-10_legacy.md](docs/handoff_archive/2026-10_legacy.md)；补齐 `2026-08 ~ 2026-11` 关键提交与 `index.html` 精确行号索引。
- **验证**：已核对 `index.html` 全部区段行号、数据条目数、引用路径与 `git status`。
- **遗留与下一步**：已随本次提交推送至 `origin/main`；后续任务结束或换号前按 `AGENTS.md` 自动更新第 1、5 节。

### [2026-11-20] `e10a457` 简化网页交互逻辑
- **目标**：降低游客使用门槛，减少页面跳转与状态丢失。
- **改动**：`index.html`（+163/-66）、`gemini_theme.css`（+21）——统一金刚区入口、合并美食筛选维度、便民服务改为就地展开面板（`showResource`）、详情页返回保留首页滚动位置（`lastHomeScrollY`）。
- **验证**：已提交并推送到 `origin/main`。
- **遗留与下一步**：如后续调整详情页返回逻辑，需保持 `lastHomeScrollY` 与 `routeFromUrl()` 同步。

### [2026-11-20] `71a2224` 上线 Liquid Glass 液态毛玻璃设计系统
- **目标**：将主站视觉升级为液态毛玻璃材质与动态光影交互。
- **改动**：新增 `gemini_theme.css`（631 行）与 `liquid_glass.js`（69 行），并在 `index.html` 引入；实现指针跟随高光、Chromium SVG 边缘折射及移动端悬浮胶囊底栏。
- **验证**：已提交并推送到 `origin/main`。
- **遗留与下一步**：无。

### [2026-10-28] 同步远端 `4f53cf2`（UI 排版与体验修复）
- **目标**：拉取远端 `4f53cf2` 更新到本地 `main`。
- **改动**：快进合并 `61a17c6 → 4f53cf2`，更新 `index.html`（+223）与 `eng.html`（+49），修复英文模式、收藏按钮、搜索滚动及响应式布局问题。
- **验证**：`git pull --ff-only` 成功，保留本地未跟踪文件。
- **遗留与下一步**：原文已归档至 `docs/handoff_archive/2026-10_legacy.md`。

### [2026-10-01] `61a17c6` 移除呷霸风味堂及其图片
- **目标**：下线不再推荐的餐饮条目并清理对应图片。
- **改动**：从 `index.html` 美食数据中删除呷霸风味堂，同步移除其关联图片资源。
- **验证**：已合入 `main`。
- **遗留与下一步**：无。

### [2026-09-01] `38c2e89` / `a06bad4` 第四轮体验与 SEO 优化
- **目标**：补全详情页动态 SEO、图片预览与首屏加载体验。
- **改动**：修复 `#i-car` 图标路径、新增 `updateSeo()` 动态更新 `og:*`/`canonical`、补全 Twitter Card、激活 Lightbox 灯箱预览、搜索输入防抖、主题首次访问跟随系统、详情页首图 `fetchpriority="high"`。
- **验证**：由 `check` 分支合并至 `main`（`a06bad4`）。
- **遗留与下一步**：无。

### [2026-08-27] `658fc04` 三轮图片瘦身与无障碍优化
- **目标**：大幅降低首屏与菜单图流量，清理死资源。
- **改动**：重编码巨型 WebP 与菜单图（引用图片总量由 19.5 MB 降至约 7.2 MB，节省 63%+）、PNG 转 JPEG、删除无引用图（`code.jpg`/`qrcode.jpg`/`parking-xinli`）、新增 `prefers-reduced-motion` 与卡片键盘可达性、详情页改为同类/最近推荐。
- **验证**：已同步至 `main`。
- **遗留与下一步**：后续新增图片沿用压缩规范。
