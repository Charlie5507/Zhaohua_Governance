// SillyTavern 扩展 - 昭华政务生成器 v1.3 (绝对防御 & 诊断版)

(function () {
    console.log("[Zhaohua] Script execution started.");

    // 案件数据库
    const affairs = [
        {
            title: "醉酒诗人闹事案",
            desc: "一名狂生在朱雀大街醉酒，并在户部尚书的轿子上题了一首打油诗，引发围观，阻碍了交通。",
            lin: { text: "此人虽狂，但若因言获罪恐失人心。罚他在国子监扫地三日，既惩戒其行，又全了陛下爱才之名。", reply: "林卿思虑周全，便依你所言，罚他去国子监扫地，磨磨性子。" },
            xiao: { text: "敢在尚书轿子上乱画？有点胆色！陛下，不如把他抓来给您讲笑话，讲不好笑再打板子！", reply: "萧则燃你尽出馊主意！不过...讲笑话倒是不错，先带进来给朕瞧瞧。" }
        },
        {
            title: "边境互市骆驼争议",
            desc: "西域互市时，一只藩国的骆驼吐了守城将领一脸口水，双方士兵差点打起来，将领请求严惩。",
            lin: { text: "两国交好，不宜因畜生伤了和气。建议修书一封给藩王，让他赔偿将领些许安抚费即可。", reply: "太傅教导过要以和为贵，林卿所言甚是，赔点银两安抚一下便是。" },
            xiao: { text: "那将领躲不开骆-驼口水？平日训练都练到狗肚子里去了？臣申请去边境练兵，顺便把那骆-驼烤了！", reply: "烤骆-驼？亏你想得出来！不过那将领确实该练练了，准你去‘操练’他一番。" }
        }
    ];

    // 核心逻辑类
    class ZhaohuaGovernance {
        constructor() {
            this.init();
        }

        init() {
            console.log("[Zhaohua] Initializing UI...");
            this.injectStyles();
            this.createModal();
            this.createButton();
            console.log("[Zhaohua] UI Initialization complete.");
        }

        injectStyles() {
            const styleId = 'zhaohua-styles';
            if (document.getElementById(styleId)) return; // 防止重复注入
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = this.getStyles();
            document.head.appendChild(style);
            console.log("[Zhaohua] Styles injected.");
        }

        createModal() {
            if (document.getElementById('zhaohua-modal-overlay')) return;
            const overlay = document.createElement('div');
            overlay.id = 'zhaohua-modal-overlay';
            overlay.innerHTML = `<div id="zhaohua-modal"><div class="zh-header">👑 昭华政务殿<span class="zh-close">✖</span></div><div class="zh-content" id="zh-dynamic-content"></div></div>`;
            document.body.appendChild(overlay);
            overlay.querySelector('.zh-close').addEventListener('click', () => {
                overlay.style.display = 'none';
            });
            console.log("[Zhaohua] Modal created.");
        }

        createButton() {
            if (document.getElementById('zhaohua-btn')) return;

            // 持续检查目标容器是否存在，最多等待10秒
            let attempts = 0;
            const interval = setInterval(() => {
                const targetContainer = document.querySelector('#extensions_button_container');
                if (targetContainer) {
                    clearInterval(interval);
                    const btn = document.createElement('div');
                    btn.id = 'zhaohua-btn';
                    btn.className = 'list-group-item';
                    btn.innerHTML = '<span>📜</span><span>批阅奏折</span>';
                    btn.addEventListener('click', () => this.openModal());
                    targetContainer.appendChild(btn);
                    console.log("[Zhaohua] Button successfully attached to target container.");
                } else {
                    attempts++;
                    if (attempts > 50) { // 等待10秒 (50 * 200ms)
                        clearInterval(interval);
                        console.error("[Zhaohua] Error: Could not find target container '#extensions_button_container' after 10 seconds.");
                    }
                }
            }, 200); // 每200毫秒检查一次
        }

        openModal() {
            const overlay = document.getElementById('zhaohua-modal-overlay');
            const contentDiv = document.getElementById('zh-dynamic-content');
            const affair = affairs[Math.floor(Math.random() * affairs.length)];
            contentDiv.innerHTML = `<div class="zh-desc"><h3 style="margin-top:0; color:#D35400;">${affair.title}</h3><p>${affair.desc}</p></div><div style="text-align:center; margin-bottom:10px; color:#999; font-size:0.9em;">👇 请陛下采纳一位爱卿的建议 👇</div><div class="zh-advices"><div class="zh-card lin" data-reply="${affair.lin.reply}"><span class="zh-avatar">🎋</span><span class="zh-name" style="color:#0277BD">林观砚</span><div class="zh-text">${affair.lin.text}</div></div><div class="zh-card xiao" data-reply="${affair.xiao.reply}"><span class="zh-avatar">🔥</span><span class="zh-name" style="color:#D84315">萧则燃</span><div class="zh-text">${affair.xiao.text}</div></div></div><div class="zh-footer"><button class="zh-btn-ignore">朕自有决断 (关闭)</button></div>`;
            overlay.style.display = 'flex';
            contentDiv.onclick = (event) => {
                const card = event.target.closest('.zh-card');
                if (card) this.handleDecision(card.dataset.reply);
                if (event.target.classList.contains('zh-btn-ignore')) this.handleDecision("");
            };
        }

        handleDecision(replyText) {
            document.getElementById('zhaohua-modal-overlay').style.display = 'none';
            if (replyText) {
                const textarea = document.getElementById('send_textarea');
                const sendButton = document.getElementById('send_but');
                if (textarea && sendButton) {
                    textarea.value = replyText;
                    sendButton.click();
                } else {
                    console.error("[Zhaohua] Could not find textarea or send button.");
                }
            }
        }

        getStyles() {
            return `
                #zhaohua-btn { cursor: pointer; display: flex; align-items: center; gap: 5px; } #zhaohua-btn span:first-child { font-size: 1.2em; }
                #zhaohua-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 9999; display: none; justify-content: center; align-items: center; backdrop-filter: blur(3px); }
                #zhaohua-modal { background-color: #FFF9E6; border: 4px solid #F4D03F; border-radius: 20px; width: 90%; max-width: 700px; max-height: 90vh; overflow-y: auto; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.3); font-family: 'Microsoft YaHei', sans-serif; animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .zh-header { background: #F4D03F; padding: 15px; text-align: center; color: #8D6E63; font-size: 1.4em; font-weight: bold; border-bottom: 2px dashed #D4AC0D; position: relative; }
                .zh-close { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); cursor: pointer; font-size: 1.2em; color: #fff; }
                .zh-content { padding: 20px; } .zh-desc { font-size: 1.1em; line-height: 1.6; color: #5D4037; background: #fff; padding: 15px; border-radius: 10px; border: 1px solid #eee; margin-bottom: 20px; }
                .zh-advices { display: flex; gap: 15px; flex-wrap: wrap; }
                .zh-card { flex: 1; min-width: 250px; padding: 15px; border-radius: 12px; cursor: pointer; transition: transform 0.2s; position: relative; } .zh-card:hover { transform: translateY(-5px); }
                .zh-card.lin { background-color: #E0F7FA; border: 2px solid #81D4FA; } .zh-card.xiao { background-color: #FFEBEE; border: 2px solid #FFAB91; }
                .zh-avatar { font-size: 2em; margin-bottom: 10px; display: block; text-align: center; } .zh-name { font-weight: bold; display: block; margin-bottom: 5px; text-align: center;}
                .zh-text { font-size: 0.9em; font-style: italic; color: #555; }
                .zh-footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 2px dashed #ccc; } .zh-btn-ignore { background: #ddd; border: none; padding: 8px 20px; border-radius: 20px; cursor: pointer; color: #666; } .zh-btn-ignore:hover { background: #ccc; }
            `;
        }
    }

    // ⭐ 关键修正：确保在DOM加载完成后再执行
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        new ZhaohuaGovernance();
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            new ZhaohuaGovernance();
        });
    }
})();
