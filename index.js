// --- 昭华政务生成器 v2.1 (独立API配置版) ---
import { getContext } from '../../../extensions.js';

const ZhaohuaGov = {
    panelLoaded: false,
    currentCases: [],
    activeCase: null,
    // 默认配置
    settings: {
        endpoint: "",
        key: "",
        model: ""
    },

    async init() {
        console.log("👑 [Zhaohua v2.1] 启动中...");
        this.loadSettings(); // 加载本地配置
        this.injectToggleButton();
        await this.loadHTML();
        if (this.panelLoaded) {
            this.bindEvents();
            console.log("✅ [Zhaohua v2.1] 就绪。");
        }
    },

    // --- 存储管理 ---
    loadSettings() {
        const saved = localStorage.getItem("zhaohua_settings");
        if (saved) {
            try {
                this.settings = JSON.parse(saved);
            } catch (e) { console.error("配置加载失败", e); }
        }
    },

    saveSettings() {
        const ep = document.getElementById("zh-cfg-endpoint").value.trim();
        const key = document.getElementById("zh-cfg-key").value.trim();
        const model = document.getElementById("zh-cfg-model").value;

        this.settings = { endpoint: ep, key: key, model: model };
        localStorage.setItem("zhaohua_settings", JSON.stringify(this.settings));
        
        if (typeof toastr !== "undefined") toastr.success("昭华政务配置已保存");
        this.closeModal("zh-modal-config");
    },

    // --- API 交互 ---
    // 拉取模型列表
    async fetchModels() {
        const ep = document.getElementById("zh-cfg-endpoint").value.trim();
        const key = document.getElementById("zh-cfg-key").value.trim();
        const select = document.getElementById("zh-cfg-model");

        if (!ep) { alert("请先输入API Endpoint"); return; }

        select.innerHTML = '<option>加载中...</option>';
        
        try {
            // 尝试适配 /v1/models
            let url = ep.endsWith('/') ? `${ep}models` : `${ep}/models`;
            // 有些后端 endpoint 写得不规范，做个兼容
            if (ep.endsWith('/v1')) url = `${ep}/models`;
            
            const res = await fetch(url, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${key}` }
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            
            select.innerHTML = '';
            const models = data.data || data.models || []; // 兼容不同格式
            
            models.forEach(m => {
                const opt = document.createElement("option");
                opt.value = m.id;
                opt.text = m.id;
                select.appendChild(opt);
            });

            if (models.length > 0 && this.settings.model) {
                select.value = this.settings.model;
            }

            if (typeof toastr !== "undefined") toastr.success(`成功获取 ${models.length} 个模型`);

        } catch (e) {
            console.error(e);
            select.innerHTML = '<option value="">获取失败</option>';
            alert("获取模型列表失败，请检查Endpoint和Key。\n" + e.message);
        }
    },

    // 通用 LLM 调用 (优先使用自定义配置)
    async fetchLLM(promptText) {
        // 1. 如果有自定义配置，使用自定义配置
        if (this.settings.endpoint && this.settings.key) {
            let url = this.settings.endpoint;
            if (!url.endsWith('/chat/completions')) {
                url = url.endsWith('/') ? `${url}chat/completions` : `${url}/chat/completions`;
            }

            const body = {
                model: this.settings.model || "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a creative writing assistant." },
                    { role: "user", content: promptText }
                ],
                temperature: 0.7
            };

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.settings.key}`
                },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error(`Custom API Error: ${res.status}`);
            const data = await res.json();
            return data.choices[0].message.content;
        } 
        // 2. 否则回退到 ST 内部 API (Context)
        else {
            // 这里为了简化，如果没有配置，提示用户配置
            // 或者你可以保留原来的 ST context 代码作为 fallback
            throw new Error("请先点击左上角⚙️配置API信息！");
        }
    },

    // --- 逻辑控制 ---

    injectToggleButton() {
        if (document.getElementById("zhaohua-toggle-btn")) return;
        const btn = document.createElement("div");
        btn.id = "zhaohua-toggle-btn";
        btn.innerHTML = "📜";
        btn.title = "打开昭华政务";
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
        } catch (e) { console.error("HTML加载失败", e); }
    },

    openPanel() {
        const overlay = document.getElementById("zhaohua-overlay");
        overlay.style.display = "flex";
        this.renderSelectionGrid(); // 刷新列表显示
    },

    // 点击“生成案件”按钮
    handleGenerateClick() {
        if (this.currentCases.length > 0) {
            // 弹出确认框
            document.getElementById("zh-modal-confirm").style.display = "flex";
        } else {
            this.generateDailyCases();
        }
    },

    async generateDailyCases() {
        // 关闭确认弹窗
        document.getElementById("zh-modal-confirm").style.display = "none";
        
        const loading = document.getElementById("zh-loading");
        const emptyTip = document.getElementById("zh-empty-tip");
        const grid = document.getElementById("zh-selection-grid");
        
        this.switchView('selection');
        grid.innerHTML = "";
        emptyTip.style.display = "none";
        loading.style.display = "block";

        const prompt = `
        Roleplay as a dynamic event generator for a game set in ancient China (Song/Yuan dynasty style).
        Characters: User (Young Emperor), Lin Guanyan (Advisor, scheming), Xiao Zeran (General's son, reckless).
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
            if (firstBracket !== -1 && lastBracket !== -1) {
                jsonStr = jsonStr.substring(firstBracket, lastBracket + 1);
            }
            this.currentCases = JSON.parse(jsonStr);
            this.renderSelectionGrid();
        } catch (e) {
            console.error(e);
            grid.innerHTML = `<div style="color:red; text-align:center;">生成失败: ${e.message}</div>`;
        } finally {
            loading.style.display = "none";
        }
    },

    renderSelectionGrid() {
        const grid = document.getElementById("zh-selection-grid");
        const emptyTip = document.getElementById("zh-empty-tip");
        grid.innerHTML = "";

        if (this.currentCases.length === 0) {
            emptyTip.style.display = "block";
            return;
        }
        emptyTip.style.display = "none";

        this.currentCases.forEach((affair, index) => {
            const card = document.createElement("div");
            card.className = "zh-select-card";
            card.innerHTML = `<div class="zh-card-title">${affair.title}</div><div class="zh-card-preview">${affair.desc.substring(0, 50)}...</div>`;
            card.onclick = () => this.selectCase(index);
            grid.appendChild(card);
        });
    },

    selectCase(index) {
        this.activeCase = this.currentCases[index];
        this.switchView('detail');
        document.getElementById("zh-detail-title").innerText = this.activeCase.title;
        document.getElementById("zh-detail-desc").innerText = this.activeCase.desc;
        document.getElementById("zh-detail-lin").innerText = this.activeCase.lin_advice;
        document.getElementById("zh-detail-xiao").innerText = this.activeCase.xiao_advice;
        document.getElementById("zh-chat-log").innerHTML = `<div style="color:#999; text-align:center; font-style:italic; padding-top:20px;">在此处与他们商议...</div>`;
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
        loadingMsg.innerText = "Thinking...";
        log.appendChild(loadingMsg);
        log.scrollTop = log.scrollHeight;

        const prompt = `
        Context: Ancient China. Case: ${this.activeCase.title}.
        Characters: Lin Guanyan (Advisor), Xiao Zeran (General).
        User says: "${text}"
        Task: Provide short dialogue response from Lin and Xiao.
        Format: Lin: ... \n Xiao: ...
        Language: Simplified Chinese.
        `;

        try {
            const result = await this.fetchLLM(prompt);
            log.removeChild(loadingMsg);
            const lines = result.split('\n');
            lines.forEach(line => {
                if (line.includes("Lin:") || line.includes("林")) {
                    const d = document.createElement("div"); d.className = "zh-msg lin"; d.innerText = line.replace(/Lin:|林:|Lin Guanyan:/i, "🎋 林:").trim(); log.appendChild(d);
                } else if (line.includes("Xiao:") || line.includes("萧")) {
                    const d = document.createElement("div"); d.className = "zh-msg xiao"; d.innerText = line.replace(/Xiao:|萧:|Xiao Zeran:/i, "🔥 萧:").trim(); log.appendChild(d);
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

    // UI 辅助
    switchView(name) {
        document.querySelectorAll('.zh-view').forEach(v => v.classList.remove('active'));
        document.getElementById(`zh-view-${name}`).classList.add('active');
    },
    showConfigModal() {
        document.getElementById("zh-modal-config").style.display = "flex";
        // 填充当前值
        document.getElementById("zh-cfg-endpoint").value = this.settings.endpoint || "";
        document.getElementById("zh-cfg-key").value = this.settings.key || "";
        
        // 如果有模型，尝试恢复选中（需要先拉取列表，这里简化处理，只填值）
        const select = document.getElementById("zh-cfg-model");
        if (this.settings.model && select.options.length === 0) {
            const opt = document.createElement("option");
            opt.value = this.settings.model;
            opt.text = this.settings.model;
            select.appendChild(opt);
            select.value = this.settings.model;
        }
    },
    closeModal(id) { document.getElementById(id).style.display = "none"; },

    bindEvents() {
        // 全局退出
        document.getElementById("zh-btn-global-exit").onclick = () => document.getElementById("zhaohua-overlay").style.display = "none";
        
        // 配置相关
        document.getElementById("zh-btn-config").onclick = () => this.showConfigModal();
        document.getElementById("zh-cfg-cancel").onclick = () => this.closeModal("zh-modal-config");
        document.getElementById("zh-cfg-save").onclick = () => this.saveSettings();
        document.getElementById("zh-btn-fetch-models").onclick = () => this.fetchModels();

        // 生成相关
        document.getElementById("zh-btn-generate").onclick = () => this.handleGenerateClick();
        document.getElementById("zh-confirm-cancel").onclick = () => this.closeModal("zh-modal-confirm");
        document.getElementById("zh-confirm-ok").onclick = () => this.generateDailyCases();

        // 聊天与决策
        document.getElementById("zh-btn-chat-send").onclick = () => this.sendChat();
        document.getElementById("zh-adopt-lin").onclick = () => this.makeDecision('lin');
        document.getElementById("zh-adopt-xiao").onclick = () => this.makeDecision('xiao');
        document.getElementById("zh-adopt-custom").onclick = () => document.getElementById("zh-modal-custom").style.display = "flex";
        document.getElementById("zh-custom-cancel").onclick = () => this.closeModal("zh-modal-custom");
        document.getElementById("zh-custom-confirm").onclick = () => this.makeDecision('custom');
    }
};

(function() { ZhaohuaGov.init(); })();
