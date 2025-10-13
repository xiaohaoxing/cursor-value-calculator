## Cursor Usage Cost Overlay（MV3 扩展）

在 Cursor 使用量页面统计并叠加显示本页所有金额之和，自动随页面内容变化更新，支持拖拽移动与关闭浮窗。

适用页面：`https://cursor.com/cn/dashboard?tab=usage`（Cursor Usage）

### 功能
- 自动扫描页面中的金额元素（优先从包含美元金额的 `title` 提取，如“$0.12 value”，否则回退解析文本）
- 求和后显示在右上角显眼浮窗（可拖拽、可关闭）
- 监听 DOM 变化和路由变化，表格翻页/筛选后会自动更新

### 安装（Chrome/Brave/Edge）
1. 打开扩展管理：在地址栏输入 `chrome://extensions/`（Edge 输入 `edge://extensions/`）。
2. 打开右上角“开发者模式”。
3. 点击“加载已解压的扩展程序”。
4. 选择本项目目录：`/Users/xiaohaoxing/repos/cursor-value-calculator`。
5. 访问 `https://cursor.com/cn/dashboard?tab=usage`，稍等片刻将看到右上角浮窗显示合计金额。

> 如果使用其他 Chromium 内核浏览器，流程基本一致。

### 使用说明
- 浮窗显示：合计金额（USD）与本页解析到的金额条目数。
- 浮窗交互：
  - 拖拽移动：按住浮窗空白处拖动。
  - 关闭：点击右侧“×”。（如需再次显示，刷新页面或切换路由即可重新出现）

### 工作原理
- 这是一个 Manifest V3 内容脚本扩展：
  - `manifest.json` 声明在 `https://cursor.com/*` 与 `https://www.cursor.com/*` 注入 `content.js`。
  - `content.js` 会：
    - 通过选择器聚合查找金额容器（如 `td.text-right div.cursor-help[title*="$"]` 等）。
    - 从 `title` 或文本中解析美元金额，求和后在页面右上角显示。
    - 使用 `MutationObserver` 监听 DOM 变化，并 hook `history.pushState/replaceState/popstate` 监听路由变化，自动刷新合计。

### 故障排查
- 看不到浮窗：
  - 确认已进入 `https://cursor.com/cn/dashboard?tab=usage` 页面。
  - 刷新页面；确保扩展已启用；关闭的浮窗刷新后会重新出现。
  - 打开开发者工具（F12），Console 中查看是否有报错。
- 金额与预期不符：
  - 金额解析优先读取元素 `title` 中的形如 `$0.12` 的数值；如页面结构有调整，可根据需要在 `content.js` 中调整选择器或解析逻辑。

### 隐私
- 所有逻辑均在本地浏览器中执行，不会将页面数据发送到任何服务器。

### 引用
- 本扩展面向 Cursor Usage 页面：[https://cursor.com/cn/dashboard?tab=usage](https://cursor.com/cn/dashboard?tab=usage)

---

### 发布到 Chrome Web Store（上架指南）

1. 准备素材与文件
   - 图标：`icons/icon16.png`、`icons/icon48.png`、`icons/icon128.png`（PNG）
   - 隐私政策：`PRIVACY.md`（或网站隐私页 URL）
   - 商店文案：`store/STORE_LISTING.md`（复制后填充 TODO）
2. 生成上架 ZIP
   - 运行：`./scripts/pack.sh`
   - 输出：`dist/cursor-usage-cost-overlay.zip`
3. 注册并登录开发者控制台
   - 访问：`https://chrome.google.com/webstore/developer/dashboard`
   - 支付一次性注册费并完成验证
4. 创建新项目并上传
   - 点击“添加新项目”，上传上一步生成的 ZIP
   - 填写名称、简短描述、详细描述、分类、语言
   - 上传 128×128 图标与至少 1 张截图（建议 1280×800）
5. 设置可见性与提交审核
   - 建议先“非公开/受限”自测，通过后切换公开
   - 确认权限仅作用于 `cursor.com` 域名
   - 提交审核并等待结果

注意：
- 版本递增请更新 `manifest.json` 的 `version` 字段，并重新打包上传。
- 上架页的截图、宣传图等尺寸以控制台提示为准；如有变更，以最新要求为准。


