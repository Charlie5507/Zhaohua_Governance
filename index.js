// SillyTavern 扩展 - 昭华政务生成器 v2.1 (事件绑定修正版)
import { getContext } from '../../../extensions.js';

// 案件数据库 (保持不变)
const affairs = [
    {
        title: "醉酒诗人闹事案",
        desc: "一名狂生在朱雀大街醉酒，并在户部尚书的轿子上题了一首打油诗，引发围观，阻碍了交通。",
        lin: { text: "此人虽狂，但若因言获罪恐失人心。罚他在国子监扫地三日，既惩戒其行，又全了陛下爱才之名。", reply: "林卿思虑周全，便依你所言，罚他去国子监扫地，磨磨性子。" },
        xiao: { text: "敢在尚书轿子上乱画？有点胆色！陛下，不如把他抓来给您讲笑話，讲不好笑再打板子！", reply: "萧则燃你尽出馊主意！不过...讲笑话倒是不错，先带进来给朕瞧瞧。" }
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
        lin: { text: "臣愿去‘监工’，定能让这五千两变成五百两。", reply: "林卿出马朕最放心，去查查那侍郎的底细，别让他把朕的银子贪了。" },
        xiao: { text: "修什么凉亭！直接拆了改成演武场！以后臣就能在宫里教您射箭了，多好！", reply: "演武场...朕倒是有些心动，不过太傅怕是要骂人。萧则燃，你先带朕去看看那凉亭破成啥样了。" }
    },
    {
        title: "进贡的食铁兽",
        desc: "南方进贡了一只黑白相间、以竹为食的‘食铁兽’。此兽极其懒惰，每日只知睡觉吃竹子。",
        lin: { text: "此兽憨态可掬，乃祥瑞之兆。可在御花园辟一处竹林饲养。", reply: "祥瑞不祥瑞的朕不在乎，看着确实可爱。林卿，给它批最好的竹子！" },
        xiao: { text: "哇！软乎乎的！陛下，能不能养在您的寝宫里？臣想去摸...啊不，臣是怕它伤到陛下！", reply: "养在寝宫？太傅会气晕过去吧？不过...朕准你每日随朕去喂它。" }
    }
];

// 使用自执行函数来包裹我们的代码，避免污染全局
(function () {

    // 核心逻辑类
    class ZhaohuaGovernance {
        constructor() {
            // ⭐ 关键：构造函数只做最简单的事，真正的初始化在 ready 之后
        }

        // 初始化函数，负责所有设置
        init() {
            console.log("👑 [昭华政务] 插件正在初始化...");
            
            this.injectButton();
            this.bindEvents();
            
            console.log("✅ [昭华政务] 初始化成功，按钮和事件已绑定。");
        }

        // 注入悬浮按钮
        injectButton() {
            if (document.getElementById("zhaohua-governance-btn")) return;

            const btn = document.createElement("div");
            btn.id = "zhaohua-governance-btn";
            btn.innerHTML = "📜";
            btn.title = "批阅奏折";
            
            // 为按钮绑定打开弹窗的事件
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                this.openModal();
            });
            
            document.body.appendChild(btn);
        }

        // 绑定所有需要交互的元素的事件
        bindEvents() {
            const overlay = document.getElementById('zhaohua-modal-overlay');
            if (!overlay) {
                console.error("[昭华政务] 错误: 找不到弹窗HTML结构。");
                return;
            }

            // 为关闭按钮绑定关闭事件
            overlay.querySelector('.zh-close').addEventListener('click', () => {
                overlay.style.display = 'none';
            });

            // 为整个弹窗内容区绑定一个总的点击事件（事件委托）
            // 这样，即便是后来动态添加的卡片，点击也能被捕捉到
            const content = document.getElementById('zh-dynamic-content');
            content.addEventListener('click', (event) => {
                const card = event.target.closest('.zh-card');
                if (card && card.dataset.reply) {
                    this.handleDecision(card.dataset.reply);
                }
            });
        }

        // 打开弹窗并填充内容
        openModal() {
            const overlay = document.getElementById('zhaohua-modal-overlay');
            const contentDiv = document.getElementById('zh-dynamic-content');
            const affair = affairs[Math.floor(Math.random() * affairs.length)];

            contentDiv.innerHTML = `
                <div class="zh-desc">
                    <h3 style="margin-top:0; color:#D35400;">${affair.title}</h3>
                    <p>${affair.desc}</p>
                </div>
                <div style="text-align:center; margin-bottom:10px; color:#999; font-size:0.9em;">👇 请陛下采纳一位爱卿的建议 👇</div>
                <div class="zh-advices">
                    <div class="zh-card lin" data-reply="${affair.lin.reply}">
                        <span class="zh-avatar">🎋</span>
                        <span class="zh-name" style="color:#0277BD">林观砚</span>
                        <div class="zh-text">${affair.lin.text}</div>
                    </div>
                    <div class="zh-card xiao" data-reply="${affair.xiao.reply}">
                        <span class="zh-avatar">🔥</span>
                        <span class="zh-name" style="color:#D84315">萧则燃</span>
                        <div class="zh-text">${affair.xiao.text}</div>
                    </div>
                </div>
            `;
            
            overlay.style.display = 'flex';
        }

        // 处理最终决定
        handleDecision(replyText) {
            document.getElementById('zhaohua-modal-overlay').style.display = 'none';
            if (replyText) {
                const context = getContext();
                const textarea = document.getElementById('send_textarea');
                if (textarea) {
                    textarea.value = replyText;
                    textarea.dispatchEvent(new Event('input', {
