import { getContext } from '../../../extensions.js';

// 1. 定义样式 (CSS)
const zhaohua_css = `
/* 悬浮按钮样式 */
#zhaohua-btn {
    position: fixed;
    top: 10px;
    right: 160px; /* 根据你的界面布局调整 */
    z-index: 2000;
    background: linear-gradient(135deg, #F4D03F 0%, #F1C40F 100%);
    border: 2px solid #D4AC0D;
    border-radius: 25px;
    padding: 8px 15px;
    color: #795548;
    font-weight: bold;
    font-family: 'Microsoft YaHei', sans-serif;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 5px;
}
#zhaohua-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 10px rgba(0,0,0,0.2);
    background: #F7DC6F;
}

/* 政务殿弹窗遮罩 */
#zhaohua-modal-overlay {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.6);
    z-index: 2001;
    display: none; /* 默认隐藏 */
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(3px);
}

/* 政务殿主界面 */
#zhaohua-modal {
    background-color: #FFF9E6;
    border: 4px solid #F4D03F;
    border-radius: 20px;
    width: 90%;
    max-width: 700px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    font-family: 'Microsoft YaHei', sans-serif;
    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

/* 标题栏 */
.zh-header {
    background: #F4D03F;
    padding: 15px;
    text-align: center;
    color: #8D6E63;
    font-size: 1.4em;
    font-weight: bold;
    border-bottom: 2px dashed #D4AC0D;
    position: relative;
}

/* 关闭按钮 */
.zh-close {
    position: absolute;
    right: 15px;
    top: 15px;
    cursor: pointer;
    font-size: 1.2em;
    color: #fff;
}

/* 内容区 */
.zh-content {
    padding: 20px;
}

.zh-desc {
    font-size: 1.1em;
    line-height: 1.6;
    color: #5D4037;
    background: #fff;
    padding: 15px;
    border-radius: 10px;
    border: 1px solid #eee;
    margin-bottom: 20px;
}

/* 建议卡片容器 */
.zh-advices {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
}

.zh-card {
    flex: 1;
    min-width: 250px;
    padding: 15px;
    border-radius: 12px;
    cursor: pointer;
    transition: transform 0.2s;
    position: relative;
}
.zh-card:hover { transform: translateY(-5px); }

/* 林观砚卡片 */
.zh-card.lin {
    background-color: #E0F7FA;
    border: 2px solid #81D4FA;
}

/* 萧则燃卡片 */
.zh-card.xiao {
    background-color: #FFEBEE;
    border: 2px solid #FFAB91;
}

.zh-avatar { font-size: 2em; margin-bottom: 10px; display: block; text-align: center; }
.zh-name { font-weight: bold; display: block; margin-bottom: 5px; text-align: center;}
.zh-text { font-size: 0.9em; font-style: italic; color: #555; }

/* 底部按钮 */
.zh-footer {
    text-align: center;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 2px dashed #ccc;
}
.zh-btn-ignore {
    background: #ddd;
    border: none;
    padding: 8px 20px;
    border-radius: 20px;
    cursor: pointer;
    color: #666;
}
.zh-btn-ignore:hover { background: #ccc; }
`;

// 2. 案件数据
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
        xiao: { text: "那将领躲不开骆驼口水？平日训练都练到狗肚子里去了？臣申请去边境练兵，顺便把那骆驼烤了！", reply: "烤骆驼？亏你想得出来！不过那将领确实该练练了，准你去‘操练’他一番。" }
    },
    {
        title: "御花园翻修预算",
        desc: "工部申请拨银五千两翻修凉亭，但有人举报工部侍郎想借机给自家花园顺两块太湖石。",
        lin: { text: "五千两够边关战士半月粮草了。臣愿去‘监工’，定能让这五千两变成五百两。", reply: "林卿出马朕最放心，去查查那侍郎的底细，别让他把朕的银子贪了。" },
        xiao: { text: "修什么凉亭！直接拆了改成演武场！以后臣就能在宫里教您射箭了，多好！", reply: "演武场...朕倒是有些心动，不过太傅怕是要骂人。萧则燃，你先带朕去看看那凉亭破成啥样了。" }
    },
    {
        title: "进贡的食铁兽",
        desc: "南方进贡了一只黑白相间、以竹为食的‘食铁兽’。此兽极其懒惰，每日只知睡觉吃竹子。",
        lin: { text: "此兽憨态可掬，乃祥瑞之兆。可在御花园辟一处竹林饲养，莫要耽误陛下早朝。", reply: "祥瑞不祥瑞的朕不在乎，看着确实可爱。林卿，给它批最好的竹子！" },
        xiao: { text: "哇！看着软乎乎的！陛下，能不能养在您的寝宫里？臣想去摸...啊不，臣是怕它伤到陛下！", reply: "养在寝宫？太傅会气晕过去吧？不过...朕准你每日随朕去喂它。" }
    }
];

// 3. 核心逻辑类
class ZhaohuaGovernance {
    constructor() {
        this.injectStyles();
        this.createUI();
        console.log("[Zhaohua] UI Loaded");
    }

    // 注入CSS
    injectStyles() {
        const style = document.createElement('style');
        style.innerHTML = zhaohua_css;
        document.head.appendChild(style);
    }

    // 创建DOM元素
    createUI() {
        // 创建悬浮按钮
        const btn = document.createElement('div');
        btn.id = 'zhaohua-btn';
        btn.innerHTML = '<span>📜</span> 批阅奏折';
        btn.onclick = () => this.openModal();
        document.body.appendChild(btn);

        // 创建弹窗结构
        const overlay = document.createElement('div');
        overlay.id = 'zhaohua-modal-overlay';
        overlay.innerHTML = `
            <div id="zhaohua-modal">
                <div class="zh-header">
                    👑 昭华政务殿
                    <span class="zh-close" onclick="document.getElementById('zhaohua-modal-overlay').style.display='none'">✖</span>
                </div>
                <div class="zh-content" id="zh-dynamic-content">
                    <!-- 动态内容在这里加载 -->
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    // 打开弹窗并生成随机案件
    openModal() {
        const overlay = document.getElementById('zhaohua-modal-overlay');
        const contentDiv = document.getElementById('zh-dynamic-content');
        
        // 随机抽取案件
        const affair = affairs[Math.floor(Math.random() * affairs.length)];
        
        // 渲染内容
        contentDiv.innerHTML = `
            <div class="zh-desc">
                <h3 style="margin-top:0; color:#D35400;">${affair.title}</h3>
                <p>${affair.desc}</p>
            </div>
            
            <div style="text-align:center; margin-bottom:10px; color:#999; font-size:0.9em;">👇 请陛下采纳一位爱卿的建议 👇</div>

            <div class="zh-advices">
                <!-- 林观砚选项 -->
                <div class="zh-card lin" id="zh-choice-lin">
                    <span class="zh-avatar">🎋</span>
                    <span class="zh-name" style="color:#0277BD">林观砚</span>
                    <div class="zh-text">${affair.lin.text}</div>
                </div>

                <!-- 萧则燃选项 -->
                <div class="zh-card xiao" id="zh-choice-xiao">
                    <span class="zh-avatar">🔥</span>
                    <span class="zh-name" style="color:#D84315">萧则燃</span>
                    <div class="zh-text">${affair.xiao.text}</div>
                </div>
            </div>

            <div class="zh-footer">
                <button class="zh-btn-ignore" id="zh-choice-ignore">朕自有决断 (自定义)</button>
            </div>
        `;

        overlay.style.display = 'flex';

        // 绑定点击事件 (使用箭头函数保留this上下文)
        document.getElementById('zh-choice-lin').onclick = () => this.handleDecision(affair.lin.reply);
        document.getElementById('zh-choice-xiao').onclick = () => this.handleDecision(affair.xiao.reply);
        document.getElementById('zh-choice-ignore').onclick = () => this.handleDecision("");
    }

    // 处理决定
    handleDecision(replyText) {
        // 关闭弹窗
        document.getElementById('zhaohua-modal-overlay').style.display = 'none';

        const context = getContext();
        
        if (replyText) {
            // 如果有预设回复，直接发送给AI
            // 模拟用户输入并发送
            // 注意：不同ST版本API略有不同，这里使用通用的输入框填充+发送逻辑
            const textarea = document.getElementById('send_textarea');
            if (textarea) {
                textarea.value = replyText;
                // 触发发送按钮点击 (模拟用户手动发送)
                document.getElementById('send_but').click();
            }
        } else {
            // 自定义，只关闭弹窗，让用户自己写
            // 也可以选择弹出一个提示
        }
    }
}

// 初始化扩展
// 等待页面加载完成后执行
setTimeout(() => {
    new ZhaohuaGovernance();
}, 2000); // 延迟2秒确保DOM就绪