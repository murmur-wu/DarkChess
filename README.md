# DarkChess 暗棋

暗棋網頁版（4x8）- Vue 3 + TypeScript + Vite

## 本機開發

```bash
# 安裝依賴
pnpm install

# 啟動開發伺服器
pnpm dev

# 執行單元測試
pnpm test

# 執行 E2E 測試（需先啟動 dev server）
pnpm test:e2e

# 建置
pnpm build
```

## 架構

- `src/engine/` - 純函式遊戲核心邏輯
- `src/ai/` - AI 決策層（Easy/Normal/Hard）
- `src/components/` - Vue UI 元件
- `src/composables/` - Vue composables
- `src/views/` - Vue 頁面

## 部署（Cloudflare Pages）

此專案透過 GitHub Actions 自動部署到 Cloudflare Workers & Pages，**不需要在本機執行任何部署指令**。

### 設定步驟（僅需設定一次）

在 GitHub 儲存庫的 **Settings → Secrets and variables → Actions** 中新增以下兩個 Repository secrets：

| Secret 名稱 | 取得方式 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare 控制台 → My Profile → API Tokens → 建立 Token（需有 **Cloudflare Pages: Edit** 權限） |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 控制台 → Workers & Pages 頁面右側邊欄 |

設定完成後，每次推送到 `main` / `master` 分支，CI 會自動完成：
1. 執行單元測試與 E2E 測試
2. 建置專案
3. 若 Cloudflare Pages 專案不存在則自動建立
4. 部署至 Cloudflare Pages

## 規則

- 4x8 暗棋棋盤，32 子
- 玩家 vs AI
- 支援 Easy / Normal / Hard 三種難度
