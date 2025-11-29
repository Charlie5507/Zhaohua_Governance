// --- 昭华政务生成器 v2.0 (AI实时生成版) ---
import { getContext } from '../../../extensions.js';

const ZhaohuaGov = {
    panelLoaded: false,
    currentCases: [], // 存储生成的案件列表
    activeCase: null, // 当前选中的案件

    async init() {
        console.log("👑 [Zhaohua v2] 启动中...");
        this.injectToggleButton();
        await this.loadHTML();
        if (this.panelLoaded) {
            this.bindEvents();
            console.log("✅ [Zhaohua v2] 就绪。");
        }
    },

    injectToggleButton() {
        if (document.getElementById("zhaohua-toggle-btn")) return;
        const btn = document.createElement("div");
        btn.id = "zhaohua-toggle-btn";
        btn.innerHTML = "📜";
        btn.title = "生成今日政务";
        btn.onclick = (e) => { e.stopPropagation(); this.generateDailyCases(); };
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

    // --- 核心功能：调用AI生成案件 ---
    async generateDailyCases() {
        const overlay = document.getElementById("zhaohua-overlay");
        const loading = document.getElementById("zh-loading");
        const grid = document.getElementById("zh-selection-grid");
        const btn = document.getElementById("zhaohua-toggle-btn");

        // 切换到选择视图
        this.switchView('selection');
        overlay.style.display = "flex";
        grid.innerHTML = "";
        loading.style.display = "block";
        btn.classList.add("loading");

        // 构造 Prompt
        const prompt = `
        Roleplay as a dynamic event generator for a game set in ancient China (Song/Yuan dynasty style).
        Characters:
        1. User (Young Emperor)
        2. Lin Guanyan (Advisor, serious, scheming, elegant, gentle but strict)
        3. Xiao Zeran (General's son, energetic, hot-blooded, reckless, funny)

        Task: Generate 2 funny, lighthearted, daily-life court cases or problems for the User to solve.
        Format: Strictly JSON array. No markdown, no explanation.
        Structure per case:
        {
            "title": "Case Title",
            "desc": "Description of the funny problem",
            "lin_advice": "Lin's advice (in character, slightly sarcastic or overly proper)",
            "xiao_advice": "Xiao's advice (in character, reckless or chaotic)"
        }
        
        Make the cases funny and related to the setting (e.g., a camel spitting on a guard, a poet writing graffiti, a cat stealing the royal seal).
        Language: Simplified Chinese.
        `;

        try {
            // 调用 ST 的生成接口
            // 注意：这里使用 generateRaw 是假设想获取纯文本，但在扩展中通常通过 context.generate 
            // 为了不污染聊天记录，我们手动构造请求
            const context = getContext();
            
            // 发送系统指令（隐藏）
            // 这里的实现技巧：使用 fetch 直接请求 API 或者利用 context 
            // 简单起见，我们模拟一次生成，但在此之前，建议用户在设置里把 Response Length 调高一点
            
            // ⚠️ 关键：为了确保能拿到 JSON，我们使用 'Quiet' 模式或手动处理
            // 这里使用一个简单的 fetch 包装器来调用 ST 的 completion API
            const result = await this.fetchLLM(prompt);
            
            // 解析 JSON
            let jsonStr = result.replace(/```json|```/g, '').trim();
            // 尝试提取数组部分
            const firstBracket = jsonStr.indexOf('[');
            const lastBracket = jsonStr.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket !== -1) {
                jsonStr = jsonStr.substring(firstBracket, lastBracket + 1);
            }

            this.currentCases = JSON.parse(jsonStr);
            this.renderSelectionGrid();

        } catch (e) {
            console.error("生成失败", e);
            grid.innerHTML = `<div style="color:red; text-align:center;">生成失败，请重试。<br>错误信息: ${e.message}</div>`;
        } finally {
            loading.style.display = "none";
            btn.classList.remove("loading");
        }
    },

    // 模拟调用 LLM (适配 ST API)
    async fetchLLM(promptText) {
        const context = getContext();
        // 获取当前设置
        const url = '/api/generate'; // ST 标准 API 端点
        
        // 简单的请求体构造
        const body = {
            prompt: promptText,
            max_length: 600,
            temperature: 0.7,
            top_p: 0.9,
            top_k: 0,
            rep_pen: 1.1
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error('API Request Failed');
        const data = await response.json();
        // 处理不同后端返回格式
        return data.results ? data.results[0].text : data.text; 
    },

    // --- 渲染逻辑 ---

    renderSelectionGrid() {
        const grid = document.getElementById("zh-selection-grid");
        grid.innerHTML = "";

        this.currentCases.forEach((affair, index) => {
            const card = document.createElement("div");
            card.className = "zh-select-card";
            card.innerHTML = `
                <div class="zh-card-title">${affair.title}</div>
                <div class="zh-card-preview">${affair.desc.substring(0, 50)}...</div>
            `;
            card.onclick = () => this.selectCase(index);
            grid.appendChild(card);
        });
    },

    selectCase(index) {
        this.activeCase = this.currentCases[index];
        this.switchView('detail');

        // 填充详情
        document.getElementById("zh-detail-title").innerText = this.activeCase.title;
        document.getElementById("zh-detail-desc").innerText = this.activeCase.desc;
        document.getElementById("zh-detail-lin").innerText = this.activeCase.lin_advice;
        document.getElementById("zh-detail-xiao").innerText = this.activeCase.xiao_advice;
        
        // 清空聊天记录
        document.getElementById("zh-chat-log").innerHTML = `
            <div style="color:#999; text-align:center; font-style:italic; padding-top:20px;">
                在此处与他们商议，或直接做出决断...
            </div>
        `;
    },

    async sendChat() {
        const input = document.getElementById("zh-chat-input");
        const text = input.value.trim();
        if (!text) return;

        const log = document.getElementById("zh-chat-log");
        
        // 1. 添加用户消息
        const userMsg = document.createElement("div");
        userMsg.className = "zh-msg user";
        userMsg.innerText = text;
        log.appendChild(userMsg);
        input.value = "";
        log.scrollTop = log.scrollHeight;

        // 2. 构造 Prompt 获取 NPC 回复
        const prompt = `
        Context: Ancient China setting.
        Case: ${this.activeCase.title} - ${this.activeCase.desc}
        Characters: Lin Guanyan (Serious advisor), Xiao Zeran (Reckless general's son).
        User says: "${text}"
        Task: Provide a short dialogue response from BOTH Lin Guanyan and Xiao Zeran reacting to the user.
        Format: 
        Lin: [Response]
        Xiao: [Response]
        Language: Simplified Chinese. Keep it short and funny.
        `;

        // 显示正在输入...
        const loadingMsg = document.createElement("div");
        loadingMsg.innerText = "Thinking...";
        loadingMsg.style.fontSize = "0.8em";
        loadingMsg.style.color = "#999";
        log.appendChild(loadingMsg);

        try {
            const result = await this.fetchLLM(prompt);
            log.removeChild(loadingMsg);

            // 简单解析回复
            const lines = result.split('\n');
            lines.forEach(line => {
                if (line.includes("Lin:") || line.includes("林")) {
                    const d = document.createElement("div");
                    d.className = "zh-msg lin";
                    d.innerText = line.replace(/Lin:|林:|Lin Guanyan:/i, "🎋 林:").trim();
                    log.appendChild(d);
                }
                else if (line.includes("Xiao:") || line.includes("萧")) {
                    const d = document.createElement("div");
                    d.className = "zh-msg xiao";
                    d.innerText = line.replace(/Xiao:|萧:|Xiao Zeran:/i, "🔥 萧:").trim();
                    log.appendChild(d);
                }
            });
            log.scrollTop = log.scrollHeight;

        } catch (e) {
            loadingMsg.innerText = "回复失败";
        }
    },

    // --- 决策逻辑 ---

    makeDecision(type) {
        let text = "";
        const caseInfo = `【处理政务：${this.activeCase.title}】\n案情：${this.activeCase.desc}\n`;

        if (type === 'lin') {
            text = `${caseInfo}朕决定采纳林观砚的建议：${this.activeCase.lin_advice}\n（转头对林观砚说）“林卿所言极是，就按你说的办。”`;
        } else if (type === 'xiao') {
            text = `${caseInfo}朕决定采纳萧则燃的建议：${this.activeCase.xiao_advice}\n（拍拍萧则燃的肩膀）“这次就听你的，别给朕搞砸了！”`;
        } else if (type === 'custom') {
            const customText = document.getElementById("zh-custom-text").value;
            if (!customText) return;
            text = `${caseInfo}朕决定：${customText}`;
            document.getElementById("zh-custom-modal").style.display = "none";
        }

        // 填入 ST 输入框并发送
        const textarea = document.getElementById('send_textarea');
        if (textarea) {
            textarea.value = text;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            document.getElementById('zhaohua-overlay').style.display = "none"; // 关闭弹窗
            // document.getElementById('send_but').click(); // 自动发送（可选）
        }
    },

    // --- 辅助功能 ---
    switchView(viewName) {
        document.querySelectorAll('.zh-view').forEach(v => v.classList.remove('active'));
        if (viewName === 'selection') document.getElementById('zh-view-selection').classList.add('active');
        if (viewName === 'detail') document.getElementById('zh-view-detail').classList.add('active');
    },

    bindEvents() {
        document.getElementById("zh-btn-global-exit").onclick = () => {
            document.getElementById("zhaohua-overlay").style.display = "none";
        };
        
        document.getElementById("zh-btn-chat-send").onclick = () => this.sendChat();
        
        // 决策按钮
        document.getElementById("zh-adopt-lin").onclick = () => this.makeDecision('lin');
        document.getElementById("zh-adopt-xiao").onclick = () => this.makeDecision('xiao');
        
        // 自定义弹窗
        document.getElementById("zh-adopt-custom").onclick = () => {
            document.getElementById("zh-custom-modal").style.display = "flex";
        };
        document.getElementById("zh-custom-cancel").onclick = () => {
            document.getElementById("zh-custom-modal").style.display = "none";
        };
        document.getElementById("zh-custom-confirm").onclick = () => this.makeDecision('custom');
    }
};

(function() {
    ZhaohuaGov.init();
})();
