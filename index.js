// --- 昭华政务生成器 v2.2 (少女心三人修罗场版) ---
import { getContext } from '../../../extensions.js';

const ZhaohuaGov = {
    panelLoaded: false,
    currentCases: [],
    activeCase: null,
    settings: { endpoint: "", key: "", model: "" },

    async init() {
        console.log("👑 [Zhaohua v2.2] 启动中...");
        this.loadSettings();
        this.injectToggleButton();
        await this.loadHTML();
        if (this.panelLoaded) {
            this.bindEvents();
            console.log("✅ [Zhaohua v2.2] 就绪。");
        }
    },

    // --- 存储与API (保持不变) ---
    loadSettings() {
        const saved = localStorage.getItem("zhaohua_settings");
        if (saved) try { this.settings = JSON.parse(saved); } catch (e) {}
    },
    saveSettings() {
        const ep = document.getElementById("zh-cfg-endpoint").value.trim();
        const key = document.getElementById("zh-cfg-key").value.trim();
        const model = document.getElementById("zh-cfg-model").value;
        this.settings = { endpoint: ep, key: key, model: model };
        localStorage.setItem("zhaohua_settings", JSON.stringify(this.settings));
        if (typeof toastr !== "undefined") toastr.success("配置已保存 ✨");
        this.closeModal("zh-modal-config");
    },
    async fetchModels() {
        const ep = document.getElementById("zh-cfg-endpoint").value.trim();
        const key = document.getElementById("zh-cfg-key").value.trim();
        const select = document.getElementById("zh-cfg-model");
        if (!ep) { alert("请先输入API地址哦~"); return; }
        select.innerHTML = '<option>加载中...</option>';
        try {
            let url = ep.endsWith('/') ? `${ep}models` : `${ep}/models`;
            if (ep.endsWith('/v1')) url = `${ep}/models`;
            const res = await fetch(url, { method: 'GET', headers: { 'Authorization': `Bearer ${key}` } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            select.innerHTML = '';
            const models = data.data || data.models || [];
            models.forEach(m => { const opt = document.createElement("option"); opt.value = m.id; opt.text = m.id; select.appendChild(opt); });
            if (models.length > 0 && this.settings.model) select.value = this.settings.model;
            if (typeof toastr !== "undefined") toastr.success(`获取了 ${models.length} 个模型 🌸`);
        } catch (e) { select.innerHTML = '<option value="">获取失败</option>'; alert("获取失败: " + e.message); }
    },
    async fetchLLM(promptText) {
        if (this.settings.endpoint && this.settings.key) {
            let url = this.settings.endpoint;
            if (!url.endsWith('/chat/completions')) url = url.endsWith('/') ? `${url}chat/completions` : `${url}/chat/completions`;
            const body = {
                model: this.settings.model || "gpt-3.5-turbo",
                messages: [{ role: "user", content: promptText }],
                temperature: 0.7
            };
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.settings.key}` },
                body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            const data = await res.json();
            return data.choices[0].message.content;
        } else { throw new Error("请先点击左上角⚙️配置API信息哦！"); }
    },

    // --- 核心逻辑 ---
    injectToggleButton() {
        if (document.getElementById("zhaohua-toggle-btn")) return;
        const btn = document.createElement("div");
        btn.id = "zhaohua-toggle-btn";
        btn.innerHTML = "📜";
        btn.title = "批阅奏折";
        btn.onclick = (e) => { e.stopPropagation(); this.openPanel(); };
        document.body.appendChild(btn);
    },
    async loadHTML() {
        try {
            const panelUrl = new URL('./ui.html', import.meta.url).href;
            const response = await fetch(panelUrl);
            const html = await response.text();
            const container = document.createElement("div");
            container.innerHTML = html;
            document.body.appendChild(container.firstElementChild);
            this.panelLoaded = true;
        } catch (e) {}
    },
    openPanel() {
        document.getElementById("zhaohua-overlay").style.display = "flex";
        this.renderSelectionGrid();
    },

    // --- 视图切换 (控制返回按钮) ---
    switchView(name) {
        document.querySelectorAll('.zh-view').forEach(v => v.classList.remove('active'));
        document.getElementById(`zh-view-${name}`).classList.add('active');
        
        // 控制返回按钮显示
        const backBtn = document.getElementById("zh-btn-back");
        if (name === 'detail') {
            backBtn.style.display = "block";
        } else {
            backBtn.style.display = "none";
        }
    },

    // --- 生成案件 ---
    handleGenerateClick() {
        if (this.currentCases.length > 0) document.getElementById("zh-modal-confirm").style.display = "flex";
        else this.generateDailyCases();
    },
    async generateDailyCases() {
        this.closeModal("zh-modal-confirm");
        const loading = document.getElementById("zh-loading");
        const emptyTip = document.getElementById("zh-empty-tip");
        const grid = document.getElementById("zh-selection-grid");
        
        this.switchView('selection');
        grid.innerHTML = "";
        emptyTip.style.display = "none";
        loading.style.display = "block";

        const prompt = `
        Roleplay as a scenario generator for a game set in ancient China.
        Characters: User (Young Emperor), Lin Guanyan (Scheming Advisor), Xiao Zeran (Reckless General).
        Task: Generate 2 funny, lighthearted court cases.
        Format: Strictly JSON array. No markdown.
        Structure: [{"title": "...", "desc": "...", "lin_advice": "...", "xiao_advice": "..."}]
        Language: Simplified Chinese.
        `;

        try {
            const result = await this.fetchLLM(prompt);
            let jsonStr = result.replace(/```json|```/g, '').trim();
            const firstBracket = jsonStr.indexOf('[');
            const lastBracket = jsonStr.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket !== -1) jsonStr = jsonStr.substring(firstBracket, lastBracket + 1);
            this.currentCases = JSON.parse(jsonStr);
            this.renderSelectionGrid();
        } catch (e) {
            grid.innerHTML = `<div style="color:red; text-align:center;">生成失败 QAQ: ${e.message}</div>`;
        } finally { loading.style.display = "none"; }
    },
    renderSelectionGrid() {
        const grid = document.getElementById("zh-selection-grid");
        const emptyTip = document.getElementById("zh-empty-tip");
        grid.innerHTML = "";
        if (this.currentCases.length === 0) { emptyTip.style.display = "block"; return; }
        emptyTip.style.display = "none";
        this.currentCases.forEach((affair, index) => {
            const card = document.createElement("div");
            card.className = "zh-select-card";
            card.innerHTML = `<div class="zh-card-title">${affair.title}</div><div class="zh-card-preview">${affair.desc.substring(0, 50)}...</div>`;
            card.onclick = () => this.selectCase(index);
            grid.appendChild(card);
        });
    },

    // --- 案件详情与聊天 ---
    selectCase(index) {
        this.activeCase = this.currentCases[index];
        this.switchView('detail'); // 切换视图，会自动显示返回按钮
        document.getElementById("zh-detail-title").innerText = this.activeCase.title;
        document.getElementById("zh-detail-desc").innerText = this.activeCase.desc;
        document.getElementById("zh-detail-lin").innerText = this.activeCase.lin_advice;
        document.getElementById("zh-detail-xiao").innerText = this.activeCase.xiao_advice;
        document.getElementById("zh-chat-log").innerHTML = `<div style="color:#FFB7B2; text-align:center; font-style:italic; padding-top:20px;">✨ 在此处与他们商议，或直接做出决断... ✨</div>`;
    },

    async sendChat() {
        const input = document.getElementById("zh-chat-input");
        const text = input.value.trim();
        if (!text) return;

        const log = document.getElementById("zh-chat-log");
        const userMsg = document.createElement("div");
        userMsg.className = "zh-msg user";
        userMsg.innerText = text;
        log.appendChild(userMsg);
        input.value = "";
        
        const loadingMsg = document.createElement("div");
        loadingMsg.innerText = "💖 正在思考...";
        loadingMsg.style.color = "#FFB7B2"; loadingMsg.style.textAlign = "center";
        log.appendChild(loadingMsg);
        log.scrollTop = log.scrollHeight;

        // ⚠️ 严格的三人对话 Prompt
        const prompt = `
        Task: Simulate a conversation in ancient China.
        Characters: 
        1. Lin Guanyan (Advisor, gentle but scheming, speaks elegantly).
        2. Xiao Zeran (General, energetic, reckless, speaks directly).
        3. User (The Emperor).
        
        Scenario: Exploring the case "${this.activeCase.title}".
        User says: "${text}"
        
        Rules:
        1. ONLY Lin Guanyan and Xiao Zeran can speak. No other characters.
        2. They must address the User directly (as "Your Majesty" or "陛下").
        3. Keep it short, funny, and in character.
        
        Format:
        Lin: [Response]
        Xiao: [Response]
        
        Language: Simplified Chinese.
        `;

        try {
            const result = await this.fetchLLM(prompt);
            log.removeChild(loadingMsg);
            const lines = result.split('\n');
            lines.forEach(line => {
                if (line.includes("Lin:") || line.includes("林")) {
                    const d = document.createElement("div"); d.className = "zh-msg lin"; d.innerText = line.replace(/Lin:|林:|Lin Guanyan:/i, "").trim(); log.appendChild(d);
                } else if (line.includes("Xiao:") || line.includes("萧")) {
                    const d = document.createElement("div"); d.className = "zh-msg xiao"; d.innerText = line.replace(/Xiao:|萧:|Xiao Zeran:/i, "").trim(); log.appendChild(d);
                }
            });
            log.scrollTop = log.scrollHeight;
        } catch (e) { loadingMsg.innerText = "Error: " + e.message; }
    },

    makeDecision(type) {
        let text = "";
        const info = `【处理政务：${this.activeCase.title}】\n案情：${this.activeCase.desc}\n`;
        if (type === 'lin') text = `${info}朕决定采纳林观砚建议：${this.activeCase.lin_advice}`;
        else if (type === 'xiao') text = `${info}朕决定采纳萧则燃建议：${this.activeCase.xiao_advice}`;
        else if (type === 'custom') {
            text = `${info}朕决定：${document.getElementById("zh-custom-text").value}`;
            this.closeModal("zh-modal-custom");
        }
        const ta = document.getElementById('send_textarea');
        if (ta) { ta.value = text; ta.dispatchEvent(new Event('input', { bubbles: true })); }
        document.getElementById("zhaohua-overlay").style.display = "none";
    },

    // --- 事件绑定 ---
    closeModal(id) { document.getElementById(id).style.display = "none"; },
    showConfigModal() {
        document.getElementById("zh-modal-config").style.display = "flex";
        document.getElementById("zh-cfg-endpoint").value = this.settings.endpoint || "";
        document.getElementById("zh-cfg-key").value = this.settings.key || "";
    },
    bindEvents() {
        document.getElementById("zh-btn-global-exit").onclick = () => document.getElementById("zhaohua-overlay").style.display = "none";
        
        // 返回按钮逻辑
        document.getElementById("zh-btn-back").onclick = () => this.switchView('selection');

        document.getElementById("zh-btn-config").onclick = () => this.showConfigModal();
        document.getElementById("zh-cfg-cancel").onclick = () => this.closeModal("zh-modal-config");
        document.getElementById("zh-cfg-save").onclick = () => this.saveSettings();
        document.getElementById("zh-btn-fetch-models").onclick = () => this.fetchModels();
        document.getElementById("zh-btn-generate").onclick = () => this.handleGenerateClick();
        document.getElementById("zh-confirm-cancel").onclick = () => this.closeModal("zh-modal-confirm");
        document.getElementById("zh-confirm-ok").onclick = () => this.generateDailyCases();
        document.getElementById("zh-btn-chat-send").onclick = () => this.sendChat();
        document.getElementById("zh-adopt-lin").onclick = () => this.makeDecision('lin');
        document.getElementById("zh-adopt-xiao").onclick = () => this.makeDecision('xiao');
        document.getElementById("zh-adopt-custom").onclick = () => document.getElementById("zh-modal-custom").style.display = "flex";
        document.getElementById("zh-custom-cancel").onclick = () => this.closeModal("zh-modal-custom");
        document.getElementById("zh-custom-confirm").onclick = () => this.makeDecision('custom');
    }
};

(function() { ZhaohuaGov.init(); })();
