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

## 規則

- 4x8 暗棋棋盤，32 子
- 玩家 vs AI
- 支援 Easy / Normal / Hard 三種難度
