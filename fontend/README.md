# 链上红包 DApp

技术栈：React + Vite + TailwindCSS + RainbowKit + Wagmi + viem

## 快速开始

```bash
npm install


npm run dev
```

默认网络：Sepolia  
在 `src/App.jsx` 中将 `CONTRACT_ADDRESS` 改为你的合约地址（此模板已写入你提供的地址）。
本项目抢红包合约地址： `0xC1eE62365fdA52e3fbCc0CC01Bd5365865DaA40d`
## 说明
- 如果你的合约没有 `Grabbed(address,uint256)` 事件，前端会在交易前后对比 `totalAmount` 自动算出领取金额作为降级方案。
- 如果你添加了该事件，前端会自动从日志中解析出领取金额。
