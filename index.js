// --- 昭华政务生成器 (v1.2 悬浮按钮版) ---

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
    },
    {
        title: "小王爷的“新生意”",
        desc: "小王爷（你表弟）在西市开了家‘盲盒店’，专卖用布包着的石头，据说有百姓为了买石头倾家荡产，御史台参了一本。",
        lin: { text: "此风涉嫌赌博，且扰乱市井。应勒令关停，并让小王爷将所得银两退还百姓。陛下不可姑息。", reply: "这混小子又惹事。林卿说得对，让他关门退钱！朕还要罚他抄书！" },
        xiao: { text: "盲盒？听着挺有意思啊！陛下，要不咱们微服出宫去看看？若是骗人，我当场砸了他的店！", reply: "走！朕倒要看看他葫芦里卖的什么药。要是敢骗人，萧则燃你帮朕按住他！" }
    }
];

const ZhaohuaGov = {
    panelLoaded: false,
    currentAffair: null,

    // 初始化
    async init() {
        console.log("👑 [Zhaohua] 插件正在启动...");
        this.injectToggleButton();
        await this.loadHTML();

        if (this.panelLoaded) {
            this.bindEvents();
            console.log("✅ [Zhaohua] 初始化成功。");
        }
    },

    // 1. 注入悬浮按钮 
    injectToggleButton() {
        if (document.getElementById("zhaohua-toggle-btn")) return;

        const btn = document.createElement("div");
        btn.id = "zhaohua-toggle-btn";
        btn.innerHTML = "📜"; // 按钮图标
        btn.title = "批阅奏折";
        
        // 点击事件
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.openModal();
        });
        
        document.body.appendChild(btn);
    },

    // 2. 加载 HTML 文件
    async loadHTML() {
        try {
            // 使用 import.meta.url 获取当前脚本路径，从而定位 ui.html
            const panelUrl = new URL('./ui.html', import.meta.url).href;
            const response = await fetch(panelUrl);
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const html = await response.text();
            const container = document.createElement("div");
            container.innerHTML = html;
            document.body.appendChild(container.firstElementChild); // 将 #zhaohua-root 添加到 body
            
            this.panelLoaded = true;
        } catch (e) {
            console.error("❌ [Zhaohua] HTML 加载失败:", e);
        }
    },

    // 3. 打开弹窗并随机生成案件
    openModal() {
        const overlay = document.getElementById("zhaohua-overlay");
        if (!overlay) return;

        // 随机抽取
        this.currentAffair = affairs[Math.floor(Math.random() * affairs.length)];
        const affair = this.currentAffair;

        // 填充数据
        document.getElementById("zh-affair-title").innerText = affair.title;
        document.getElementById("zh-affair-desc").innerText = affair.desc;
        document.getElementById("zh-text-lin").innerText = affair.lin.text;
        document.getElementById("zh-text-xiao").innerText = affair.xiao.text;

        // 显示
        overlay.style.display = "flex";
    },

    // 4. 绑定点击事件
    bindEvents() {
        // 关闭按钮
        const closeBtn = document.getElementById("zh-btn-close");
        if (closeBtn) closeBtn.onclick = () => this.closeModal();
        
        const ignoreBtn = document.getElementById("zh-btn-ignore");
        if (ignoreBtn) ignoreBtn.onclick = () => this.closeModal();

        // 林观砚卡片点击
        const cardLin = document.getElementById("zh-card-lin");
        if (cardLin) {
            cardLin.onclick = () => {
                if (this.currentAffair) this.handleDecision(this.currentAffair.lin.reply);
            };
        }

        // 萧则燃卡片点击
        const cardXiao = document.getElementById("zh-card-xiao");
        if (cardXiao) {
            cardXiao.onclick = () => {
                if (this.currentAffair) this.handleDecision(this.currentAffair.xiao.reply);
            };
        }
    },

    closeModal() {
        const overlay = document.getElementById("zhaohua-overlay");
        if (overlay) overlay.style.display = "none";
    },

    // 5. 执行决定 (发送消息)
    handleDecision(replyText) {
        this.closeModal();

        // 模仿 CTE 的发送逻辑：填充输入框并触发 input 事件
        const textarea = document.getElementById('send_textarea');
        if (textarea && replyText) {
            textarea.value = replyText;
            // 触发 input 事件让 ST 知道有内容
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.focus();
            
            // 可选：自动点击发送 (如果想让用户确认，可以注释掉下面这行)
            // document.getElementById('send_but').click(); 
        }
    }
};

// 启动
(function() {
    ZhaohuaGov.init();
})();
