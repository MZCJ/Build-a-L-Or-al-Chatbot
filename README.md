# L'Oréal Chatbot

A simple branded chatbot that uses OpenAI's Chat Completions API via a secured Cloudflare Worker.

## Setup

1. **Logo**  
   Place `loreal-logo.png` in the project root.

2. **Secrets**  
   Rename/edit `secrets.js` and set your Cloudflare Worker endpoint URL:
   ```js
   const WORKER_ENDPOINT = 'https://<YOUR_WORKER_SUBDOMAIN>.workers.dev';
   ```

3. **Deploy Cloudflare Worker**  
   - Upload `worker.js` to Cloudflare Workers.  
   - In Worker settings, add a secret binding:
     ```
     Name: OPENAI_API_KEY
     Value: <Your OpenAI API key>
     ```  
   - Deploy the Worker.

4. **Host the Frontend**  
   Host `index.html`, `style.css`, `script.js`, and `secrets.js` on a static server (e.g., GitHub Pages).

5. **Chat!**  
   Open `index.html` in your browser and start asking about L'Oréal products.
