# L'Oréal Product-Aware Routine Builder Chatbot

## 文件说明
- `index.html`：主页面，包含产品选择区和聊天区
- `style.css`：样式
- `products.json`：示例产品数据
- `secrets.js`：Cloudflare Worker 地址配置
- `script.js`：前端逻辑：产品管理与 AI 对话
- `worker.js`：Cloudflare Worker 脚本，代理 OpenAI API

## 快速上手

1. **配置 Worker 地址**  
   编辑 `secrets.js`，将 `WORKER_ENDPOINT` 改为你的 Worker URL。

2. **部署 Cloudflare Worker**  
   - 登录 Cloudflare → Workers → 新建或更新 Worker  
   - 粘贴 `worker.js`  
   - 在 Variables & Secrets 添加 `OPENAI_API_KEY`  

3. **部署前端**  
   - 将所有文件（含 `loreal-logo.png`）上传到静态托管。  
   - 确保 `products.json` 在相对路径可访问。

4. **使用**  
   - 选中产品  
   - 点击“生成 Routine”  
   - 在对话框追问，AI 会记住上下文继续回答。  

