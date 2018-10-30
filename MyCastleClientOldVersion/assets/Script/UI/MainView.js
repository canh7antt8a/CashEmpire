cc.Class({
    extends: cc.Component,

    properties: {
        head: {
            default: null,
            type: cc.Sprite,
        },
        diamonds: {
            default: null,
            type: cc.Label,
        },
        coins: {
            default: null,
            type: cc.Label,
        },
        content: {
            default: null,
            type: cc.Node,
        },
        //滑动球
        goSlider: {
            default: null,
            type: cc.Slider,
        },
        //大楼
        scrollView: {
            default: null,
            type: cc.ScrollView,
        },
        //滚动遮罩
        scrollMask: {
            default: null,
            type: cc.Node,
        },
        //楼层预制件
        floorItem: {
            default: null,
            type: cc.Node,
        },
        //楼层储存列表
        floorList: {
            default: [],
            visible: false,
        },
        floorInfoList: {
            default: [],
            visible: false,
        },
        storeInfoList: {
            default: [],
            visible: false,
        },
        //购买数量
        buyCount: {
            default: null,
            type: cc.Label,
        },
        topFloor: {
            default: null,
            type: cc.Node,
        },
        curIdx: {
            default: 0,
            type: cc.Integer,
            visible: false,
        },
        minIdx: {
            default: 0,
            type: cc.Integer,
            visible: false,
        },
        maxIdx: {
            default: 0,
            type: cc.Integer,
            visible: false,
        },
        reTime: {
            default: 0,
            type: cc.Float,
            visible: false,
        },
        //大楼是否初始化
        buildingInited: {
            default: false,
            visible: false,
        },
        zeroFloor: {
            default: null,
            type: cc.Sprite,
            visible: false,
        },
        zeroTop: {
            default: null,
            type: cc.Sprite,
            visible: false,
        },
        //最后一次飞行礼包的时间
        lastFlyTime: {
            default: 0,
            visible: false,
        },
        Weather: {
            default: null,
            type: cc.Node,
        },
        adBuff: {
            default: null,
            type: cc.Node,
        },
        adBuffNoBuffUI: {
            default: null,
            visible: false,
        },
        adBuffBuffingUI: {
            default: null,
            visible: false,
        },
        videoBtn: {
            default: null,
            type: cc.Node,
        },
        circleBtn: {
            default: null,
            type: cc.Node,
        },
        circleCd: {
            default: null,
            type: cc.Label,
        },
        rechargeMark: {
            default: null,
            type: cc.Node,
        },
        achieveMark: {
            default: null,
            type: cc.Node,
        },
        rebornMark: {
            default: null,
            type: cc.Node,
        },
        managerMark: {
            default: null,
            type: cc.Node,
        },
        maxFloor: {
            default: 0,
            type: cc.Integer,
            visible: false,
        },
    },

    reData() {
        SDK().setItem({ isFirst: 0 }, function () {
            var param = {};
            param["isFirst-W" + player.worldId] = 0;
            SDK().setItem(param, function () {
                console.log("reset ok")
            }.bind(this));
        }.bind(this));
    },

    onLoad: function () {
        window.mainScript = this;
        this.Weather.active = false;
        this.buyCount.string = "X" + 1;

        //控制上下的滑动球监听事件
        var handle = cc.find("Handle", this.goSlider.node)
        handle.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.menuClick(event, "goCur");
        }, this);
        handle.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            this.menuClick(event, "goCur");
        }, this);

        //大楼滑动事件监听
        this.scrollView.node.on("scroll-to-bottom", this.scorllToBottom, this);
        this.scrollView.node.on("scroll-to-top", this.scorllToTop, this);
        this.zeroTop = cc.find("Building/ScrollView/view/content/BuildingTop", this.node);
    },

    onEnable() {
        this.schedule(this.refreashVal, 0.5);
        this.schedule(this.flyGift, 90);
    },
    onDisable() {
        this.unschedule(this.refreashVal);
        this.unschedule(this.flyGift);
        this.Weather.active = false;
    },

    start() {
        this.adBuffNoBuffUI = {};
        this.adBuffNoBuffUI.main = cc.find("NoBuff", this.adBuff);
        this.adBuffBuffingUI = {};
        this.adBuffBuffingUI.main = cc.find("Buffing", this.adBuff);
        this.adBuffBuffingUI.time = cc.find("Buffing/Time", this.adBuff).getComponent(cc.Label);
    },

    //达成里程碑的提示
    showLevelTips(idx) {
        effectManager.achieveTips(idx);
    },

    //飞行礼包处理
    flyGift() {
        //引导时不进行飞行礼包处理
        if (guideScript.node.active && guideScript.isGuiding) {
            return;
        }
        gameApplication.checkDailyCount("flyGift", false, function (val) {
            if (val < 100) {
                var interval = 60 + Math.random() * 240;
                var time = this.lastFlyTime - gameApplication.getCurTime();
                if (time < 0 || time > interval) {
                    gameApplication.flyGift();
                    this.lastFlyTime = gameApplication.getCurTime();
                }
            }
        }.bind(this))
    },

    //滑动到最低端
    scorllToBottom(event) {
        if (this.minIdx > 0) {
        }
    },

    //滑动到最顶端
    scorllToTop(event) {
        if (this.maxIdx < 540) {
        }
    },

    //刷新数据
    refreashVal() {
        if (!this.buildingInited) {
            return;
        }

        //转盘显示
        var cCount = player.itemArrayGet("CircleCount", 0);
        if (cCount == -1) {
            this.circleBtn.active = false;
            this.videoBtn.active = false;
        } else {
            this.circleBtn.active = true;
            this.videoBtn.active = true;
            //冷却时间
            var circleTime = player.itemArrayGet("CircleTime", 0);
            var now = gameApplication.getCurTime();
            var leftTime = gameApplication.countTime(circleTime - now)[0];
            //是否冷却中
            if (circleTime > now) {
                this.circleCd.string = leftTime;
                this.circleCd.node.parent.active = true;
                cc.find("Light", this.circleBtn).active = false;
            } else {
                cc.find("Light", this.circleBtn).active = true;
                this.circleCd.node.parent.active = false;
            }
        }

        //处理视频广告增益效果
        var adBuffTime = player.getData("AdBuffTime");
        var now = gameApplication.getCurTime();
        var leftTime = gameApplication.countTime(adBuffTime - now)[0];
        //是否还有增益时间
        if (adBuffTime >= now) {
            this.adBuffNoBuffUI.main.active = false;
            this.adBuffBuffingUI.main.active = true;
            this.adBuffBuffingUI.time.string = leftTime;
            if (this.adViewInit) {
                this.buffingTime.string = leftTime;
            }
            cc.find("Light", this.videoBtn).active = false;
        } else {
            cc.find("Light", this.videoBtn).active = true;
            this.adBuffNoBuffUI.main.active = true;
            this.adBuffBuffingUI.main.active = false;
            player.setData("AdBuffTime", 0);
        }

        if (this.head.spriteFrame == null) {
            this.head.spriteFrame = SDK().getSelfInfo().head;
        }
        this.coins.string = gameApplication.countUnit(player.itemArrayGet("pCurrency", 0))[2];
        this.diamonds.string = gameApplication.countUnit(player.itemArrayGet("pCurrency", 1))[3];

        //计算开店费用
        for (var i = 0; i < 10; i = i + 1) {
            var cost = buildManager.countFloorCost(i);
            if (player.itemArrayGet("pCurrency", 0) >= cost) {
                this.floorList[i].openLock.active = false;
            } else {
                this.floorList[i].openLock.active = true;
            }
            this.floorList[i].openCost.string = gameApplication.countUnit(cost)[2];
        }

        var count = parseInt(this.buyCount.string == "MAX" ? -1 : this.buyCount.string.replace("X", ""));
        for (var i = 0; i < this.floorInfoList.length; i = i + 1) {
            if (this.floorInfoList[i] != null && this.floorInfoList[i] != "undefined" && this.floorInfoList[i] != undefined) {
                //计算每次收益的金额
                this.floorList[i].prosMoney.string = gameApplication.countUnit(buildManager.countProfit(i))[2] + "/" + (buildManager.countProfitTime(i) <= 1 ? 1 : buildManager.countProfitTime(i)) + "s";

                //每秒更新一次培训金额
                var maxNum = buildManager.countBatTrain(i, count);
                this.floorList[i].upCost.string = gameApplication.countUnit(maxNum.cost)[2];
                this.floorList[i].upNum.string = maxNum.num;
                this.floorList[i].curCost = maxNum.cost;

                if (this.floorList[i].curCost > player.itemArrayGet("pCurrency", 0) || this.floorList[i].curCost == 0) {
                    this.floorList[i].upBtn.interactable = false;
                } else {
                    this.floorList[i].upBtn.interactable = true;
                }
                var curManager = buildManager.judgeHasManager(i);
                if (curManager != null) {
                    var nowTime = new Date().getTime() / 1000;
                    //技能是否使用中
                    if (curManager[8] > nowTime) {
                        this.floorList[i].mSkillUsing.node.active = true;
                        //计算总时间
                        var sLV = curManager[7];
                        var totalTime = 60 * Math.pow(1.01, sLV);
                        //剩余时间除以总时间并赋值给CD的使用进度时 
                        this.floorList[i].mSkillUsing.fillRange = (curManager[8] - nowTime) / totalTime;
                    } else if (this.floorList[i].mSkillUsing.node.active) {
                        this.floorList[i].mSkillUsing.node.active = false;
                    }
                    //技能是否冷却中
                    if (curManager[9] > nowTime && !this.floorList[i].mSkillUsing.node.active) {
                        this.floorList[i].mSkillCd.node.active = true;
                        //计算总时间
                        var eLV = curManager[6];
                        var totalTime = 3600 * Math.pow(0.99, eLV);
                        //剩余时间除以总时间并赋值给CD的冷却进度时
                        this.floorList[i].mSkillCd.fillRange = (curManager[9] - nowTime) / totalTime;
                        this.floorList[i].mSkillCdTime.string = gameApplication.countTime(curManager[9] - nowTime)[0]
                    } else {
                        this.floorList[i].mSkillCd.node.active = false;
                    }
                }
            }
        }
    },

    //初始化大楼
    initBuilding() {
        for (var i = 0; i < 10; i = i + 1) {
            this.loadFloor(i);
        }
        resManager.loadSprite("UIBuilding.buildingTop" + player.worldId, function (spriteFrame) {
            this.zeroTop.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        }.bind(this))
        this.zeroFloor = cc.find("Building/ScrollView/view/content/ZeroFloor", this.node);
        resManager.loadSprite("UIBuilding.zeroSprite" + player.worldId, function (spriteFrame) {
            this.zeroFloor.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        }.bind(this))

        guideScript.checkGuide(0);

        //显示天气
        //this.Weather.active = true;

        //加载特效
        effectManager.registerTouch();

        //初始化员工界面
        workerScript.initView();

        if (!this.buildingInited) {
            //加载背景音乐
            soundManager.loadBg();
        }
        this.buildingInited = true;

        this.scheduleOnce(function () {
            this.scrollView.scrollToOffset(cc.v2(0, 480 + (9 - this.maxFloor) * 371), 2);
        }.bind(this), 1)


    },

    //加载楼层
    loadFloor(idx, isFirst) {
        //初始化楼层的UI
        if (this.floorList[idx] == null) {
            this.floorList[idx] = {};
        }
        var curItem = this.floorList[idx].curItem;
        if (curItem == null) {
            curItem = cc.instantiate(this.floorItem);
            curItem.name = "Floor" + idx;
            curItem.parent = this.content;
            this.floorList[idx].curItem = curItem;

            //楼层对应的店铺样式
            this.floorList[idx].bg = cc.find("Bg", curItem).getComponent(cc.Sprite);

            //店面
            this.floorList[idx].shopSprite = cc.find("Bg/ShopSprite", curItem).getComponent(cc.Sprite);

            //顾客
            this.floorList[idx].cus = cc.find("Customer/C0", curItem).getComponent(cc.Sprite);
            this.floorList[idx].cus.node.active = false;
            /* this.floorList[idx].cus = [];
            this.floorList[idx].cus[0] = cc.find("Customer/C0", curItem).getComponent(cc.Sprite);
            this.floorList[idx].cus[1] = cc.find("Customer/C1", curItem).getComponent(cc.Sprite);
            this.floorList[idx].cus[2] = cc.find("Customer/C2", curItem).getComponent(cc.Sprite); */

            //关店图
            this.floorList[idx].closeSprite = cc.find("CloseSprite", curItem).getComponent(cc.Sprite);
            //开店按钮初始化
            this.initOpen(idx);

            //管家按钮
            this.floorList[idx].manager = cc.find("Manager", curItem);
            this.floorList[idx].manager.getComponent(dragonBones.ArmatureDisplay).dragonAsset = null;
            this.floorList[idx].mSprite = cc.find("Manager/Sprite", curItem).getComponent(cc.Sprite);
            this.floorList[idx].mTips = cc.find("Manager/Sprite/CanUpgrade", curItem);
            this.floorList[idx].mSkillSprite = cc.find("Manager/Skill", curItem).getComponent(cc.Sprite);
            this.floorList[idx].mSkillCd = cc.find("Manager/Skill/Cd", curItem).getComponent(cc.Sprite);
            this.floorList[idx].mSkillCdTime = cc.find("Manager/Skill/Cd/CdTime", curItem).getComponent(cc.Label);
            this.floorList[idx].mSkillUsing = cc.find("Manager/Skill/Using", curItem).getComponent(cc.Sprite);
            this.floorList[idx].mSkillBg = cc.find("Manager/Skill/Desc", curItem);
            this.floorList[idx].mSkillDesc = cc.find("Manager/Skill/Desc/Text", curItem).getComponent("LocalizedLabel");
            this.floorList[idx].mSkillUse = cc.find("Manager/Skill/Desc/UseSkillBtn", curItem);
            this.floorList[idx].mClick = cc.find("Manager/Click", curItem);
            this.floorList[idx].mLevel = cc.find("Manager/Level", curItem).getComponent(cc.Label);
            this.initManager(idx);

            //数据板
            this.floorList[idx].bottom = cc.find("Bottom", curItem)

            //楼层的名字
            this.floorList[idx].floorName = cc.find("FloorName/Text", this.floorList[idx].bottom).getComponent(cc.Label);

            //升级的进度条
            this.floorList[idx].floorLevel = cc.find("FloorLevel/Text", this.floorList[idx].bottom).getComponent(cc.Label);
            this.floorList[idx].levelPros = cc.find("FloorLevel/UpPros", this.floorList[idx].bottom).getComponent(cc.ProgressBar);
            this.floorList[idx].prosExt = cc.find("FloorLevel/UpPros/Ext", this.floorList[idx].bottom).getComponent(cc.Label);
            this.floorList[idx].levelPros.totalLength = this.floorList[idx].levelPros.node.width - 4;

            //赚钱的进度条
            this.floorList[idx].earnPros = cc.find("FloorEarn/EarnPros", this.floorList[idx].bottom).getComponent(cc.ProgressBar);
            this.floorList[idx].bar = cc.find("bar", this.floorList[idx].earnPros.node);
            this.floorList[idx].maxBar = cc.find("maxBar", this.floorList[idx].earnPros.node);
            this.floorList[idx].prosMoney = cc.find("FloorEarn/EarnPros/Money", this.floorList[idx].bottom).getComponent(cc.Label);
            this.floorList[idx].earnPros.totalLength = this.floorList[idx].earnPros.node.width - 10;

            //道具特效
            this.floorList[idx].propEffect = cc.find("FloorEarn/PropEffect", this.floorList[idx].bottom);
            this.floorList[idx].propEffectText = cc.find("FloorEarn/PropEffect/Text", this.floorList[idx].bottom).getComponent(cc.Label);

            //升级按钮
            this.floorList[idx].upShopUI = cc.find("UpShop", this.floorList[idx].bottom);
            this.floorList[idx].upgrade = cc.find("Upgrade", curItem);
            this.floorList[idx].upBtn = cc.find("Buy", this.floorList[idx].upShopUI).getComponent(cc.Button);
            this.initUpBtn(idx);
            this.floorList[idx].upCost = cc.find("Cost", this.floorList[idx].upBtn.node).getComponent(cc.Label);
            this.floorList[idx].upNum = cc.find("Num/Val", this.floorList[idx].upBtn.node).getComponent(cc.Label);

            //开楼按钮
            this.floorList[idx].openNode = cc.find("OpenShop", curItem);
            this.floorList[idx].opBg = cc.find("OpenShop/Bg", curItem);
            this.floorList[idx].openLock = cc.find("OpenShop/AlgamSprite/LockBtn", curItem);
            this.floorList[idx].openBtn = cc.find("OpenShop/AlgamSprite/OpenBtn", curItem);
            this.initOpenFloor(idx);
            this.floorList[idx].openCost = cc.find("OpenShop/AlgamSprite/Cost", curItem).getComponent(cc.Label);
            this.floorList[idx].storeSprite = cc.find("OpenShop/AlgamSprite/Sprite", curItem).getComponent(cc.Sprite);
            resManager.loadSprite("SpAchievement.store" + idx, function (spriteFrame) {
                this.floorList[idx].storeSprite.spriteFrame = spriteFrame;
            }.bind(this))

            resManager.loadSprite("UIBuilding.buildingFloorBg" + player.worldId, function (spriteFrame) {
                this.floorList[idx].bg.spriteFrame = spriteFrame;
                this.floorList[idx].opBg.spriteFrame = spriteFrame;
            }.bind(this))
        }
        //楼层是否开启
        if (this.floorInfoList[idx] != null && this.floorInfoList[idx] != undefined && this.floorInfoList[idx] != "undefined") {
            //数据获取
            var floorInfo = {};
            floorInfo.idx = this.floorInfoList[idx][0];
            floorInfo.type = this.floorInfoList[idx][1];
            floorInfo.level = this.floorInfoList[idx][2];
            floorInfo.exp = this.floorInfoList[idx][3];

            //店面的背景
            var shopSprite = this.floorList[idx].shopSprite;
            //楼层的名字
            var floorName = this.floorList[idx].floorName;
            //升级的进度条
            var floorLevel = this.floorList[idx].floorLevel;
            var levelPros = this.floorList[idx].levelPros;
            var prosExt = this.floorList[idx].prosExt;
            //赚钱的进度条
            var earnPros = this.floorList[idx].earnPros;
            var prosMoney = this.floorList[idx].prosMoney;

            //升级按钮
            var upCost = this.floorList[idx].upCost;
            var upNum = this.floorList[idx].upNum;

            var pic = this.storeInfoList[idx].pic + 0 /* (floorInfo.level >= 5 ? 4 : floorInfo.level) */;

            //设置店面图片
            resManager.loadSprite(pic, function (spriteFrame) {
                shopSprite.spriteFrame = spriteFrame;
            }.bind(this));

            //店名设置
            floorName.string = this.storeInfoList[idx].name;

            //等级设置
            floorLevel.string = "LV " + (floorInfo.level + 1);
            var levelMax;
            if (floorInfo.level > 4) {
                levelMax = buildManager.levelConfig.level[4] + (floorInfo.level - 4) * 100;
            } else {
                levelMax = buildManager.levelConfig.level[floorInfo.level];
            }
            levelPros.progress = floorInfo.exp / levelMax;
            prosExt.string = "" + floorInfo.exp + "/" + levelMax;

            //利润设置
            earnPros.progress = 0;
            prosMoney.string = gameApplication.countUnit(buildManager.countProfit(idx))[2] + "/" + (buildManager.countProfitTime(idx) <= 1 ? 1 : buildManager.countProfitTime(idx)) + "s";

            //最大购买值设置
            var count = parseInt(this.buyCount.string == "MAX" ? -1 : this.buyCount.string.replace("X", ""));
            var maxNum = buildManager.countBatTrain(idx, count);
            upCost.string = gameApplication.countUnit(maxNum.cost)[2];
            upNum.string = maxNum.num;
            this.floorList[idx].curCost = maxNum.cost;

            //默认显示关店的黑幕
            if (!curItem.active) {
                this.floorList[idx].closeSprite.node.active = true;
            }

            //隐藏开楼的节点
            this.floorList[idx].openNode.active = false;
            this.floorList[idx].bottom.active = true;
            this.maxFloor = idx;
        } else {
            //去除管家idx
            this.floorList[idx].managerIdx = null;
            //显示开楼的节点
            this.floorList[idx].openNode.active = true;
            this.floorList[idx].maxBar.active = false;
            this.floorList[idx].bottom.active = false;
        }

        this.floorList[idx].bg = cc.find("Bg", curItem).getComponent(cc.Sprite);
        resManager.loadSprite("UIBuilding.buildingFloorBg" + player.worldId, function (spriteFrame) {
            this.floorList[idx].bg.spriteFrame = spriteFrame;
            this.floorList[idx].opBg.spriteFrame = spriteFrame;
        }.bind(this))

        curItem.active = true;
        //开店效果
        if (isFirst) {
            effectManager.particleShow(curItem, 1);
            this.scrollMask.active = true;
            this.floorList[idx].bottom.active = true;
            this.scheduleOnce(function () {
                this.scrollMask.active = false;
            }.bind(this), 1)
            //如果已经存在管家则直接经营否则显示关店
            if (managerScript.managerInfoList[i] != null && managerScript.managerInfoList[i] != undefined && managerScript.managerInfoList[i] != "undefined") {
                this.floorList[idx].closeSprite.node.active = false;
                buildManager.openShop(idx);
            } else {
                this.floorList[idx].closeSprite.node.active = true;
            }
        }
        this.topFloor.setSiblingIndex(this.content.childrenCount);
    },

    //初始化开楼函数
    initOpenFloor(idx) {
        var node = this.floorList[idx].openBtn;
        node.off("click");
        node.on("click", function (event) {
            gameApplication.soundManager.playSound("btnClick");
            buildManager.openFloor(idx);
        }.bind(this), this)
    },

    //初始化开店函数
    initOpen(idx) {
        var node = this.floorList[idx].closeSprite.node;
        node.off("click");
        node.on("click", function (event) {
            gameApplication.soundManager.playSound("btnClick");
            node.active = false;
            buildManager.openShop(idx);
        }.bind(this), this)
    },

    //初始化管理按钮
    initManager(idx) {
        var node = this.floorList[idx].mClick;
        node.off("click");
        node.on("click", function (event) {
            gameApplication.soundManager.playSound("btnClick");
            viewManager.popView("ManagerView", true, function (view) {
                //初始化
                view.getComponent("ManagerView").initManagerList(idx);
            }.bind(this));
        }.bind(this), this)
    },


    //初始化升级函数
    initUpBtn(idx) {
        var node = this.floorList[idx].upBtn.node;
        node.off("click");
        node.on("click", function (event) {
            gameApplication.soundManager.playSound("btnClick");
            buildManager.train(idx, parseInt(this.floorList[idx].upNum.string));
        }.bind(this), this)
    },

    //购买数量变化
    changeBuyCount(num) {
        for (var i = 0; i < this.floorList.length; i = i + 1) {
            if (this.floorInfoList[i] != null && this.floorInfoList[i] != undefined && this.floorInfoList[i] != "undefined") {
                //计算所需要的金钱和数量
                if (num > 0) {
                    var maxNum = buildManager.countBatTrain(i, num);
                } else {
                    var maxNum = buildManager.countBatTrain(i, -1);
                }
                //赋值
                this.floorList[i].upCost.string = gameApplication.countUnit(maxNum.cost)[2];
                this.floorList[i].upNum.string = maxNum.num;
                this.floorList[i].curCost = maxNum.cost;
            }
        }
    },


    //点击事件处理
    menuClick(event, type) {
        if (type == "more") {
            if (this.btn == null) {
                if (event != null) {
                    this.btn = event.target;
                } else {
                    return;
                }
            }
            let btns = cc.find("Btns", this.btn);
            //获取高度
            let height = (btns.childrenCount * 100) + 115;
            let targetPos = null;
            //获取目标位置
            if (Math.abs(btns.y - 0) < 5) {
                targetPos = -height;
            } else if (Math.abs(btns.y + height) < 5) {
                targetPos = 0;
                if (event == null) {
                    return;
                }
                soundManager.playSound("btnClick")
            }
            //可以移动重置状态并移动
            if (targetPos != null) {
                btns.stopAllActions();
                btns.y = Math.abs(targetPos) - height;
                btns.runAction(cc.moveTo(0.2, cc.v2(0, targetPos)).easing(cc.easeBackInOut(2)));
            }
            return;
        }
        soundManager.playSound("btnClick")
        if (type == "addDiamond") {
            viewManager.popView("RechargeView", true, function (view) {
                //初始化

            }.bind(this));
        } else if (type == "goCur") {
            if (this.goSlider.progress > 0.65) {
                this.scrollView.scrollToTop(0.5);
            } else if (this.goSlider.progress < 0.35) {
                this.scrollView.scrollToBottom(0.5);
            } else {
                this.scrollView.scrollToPercentVertical(0.5, 0.5);
            }
            this.goSlider.progress = 0.5;
        }
        else if (type == "info") {
            viewManager.popView("InfoView", true, function (view) {
                //初始化
            }.bind(this));
        }
        else if (type == "shop") {
            viewManager.popView("ShopView", true, function (view) {
                //初始化
                view.getComponent("ShopView").initView();
            }.bind(this));
        }
        else if (type == "rank") {
            viewManager.popView("RankView", true, function (view) {
                //初始化
            }.bind(this));
        }
        else if (type == "buyCount") {
            var num = parseInt(this.buyCount.string.replace("X", ""));
            var val = "";
            if (!isNaN(num)) {
                if (num == 100) {
                    val = "MAX"
                    num = -1;
                } else {
                    val = "X" + num * 10;
                    num = num * 10;
                }
            } else {
                val = "X" + 1;
                num = 1;
            }
            this.buyCount.string = val;
            this.changeBuyCount(num)
        }
        else if (type == "update") {
            viewManager.popView("WorkerView", true, function (view) {
            }.bind(this));
        }
        else if (type == "prestige") {
            viewManager.popView("PrestigeView", true, function (view) {
                //初始化
            }.bind(this));
        }
        else if (type == "home") {
            viewManager.popView("HomeView", true, function (view) {
                //初始化
                view.getComponent("HomeView").initView();
            }.bind(this));
        }
        else if (type == "achievement") {
            viewManager.popView("AchieveView", true, function (view) {
                //初始化
            }.bind(this));
        }
        else if (type == "reborn") {
            viewManager.popView("RebornView", true, function (view) {
                //初始化
            }.bind(this));
        }
        else if (type == "adBuff") {
            viewManager.popView("AdBuffView", true, function (view) {
                //初始化
                if (this.adViewInit == undefined || this.adViewInit == null) {
                    var buffTime = 300;
                    this.buffingView = cc.find("Bg/Buffing", view);
                    this.NoBuffView = cc.find("Bg/NoBuff", view);
                    this.buffingTime = cc.find("Bg/Buffing/Sprite/Time", view).getComponent(cc.Label);
                    this.diamond = cc.find("Bg/Diamond", view);
                    //绑定钻石翻倍按钮
                    this.diamond.on("click", function () {
                        //判断是否够钻石
                        if (player.itemArrayGet("pCurrency", 1) >= 200) {
                            player.itemArrayAdd("pCurrency", 1, -200, function () {
                                //处理视频广告增益效果
                                var adBuffTime = player.getData("AdBuffTime");
                                var now = gameApplication.getCurTime();
                                //是否还有增益时间
                                if (adBuffTime >= now) {
                                    player.setData("AdBuffTime", adBuffTime + buffTime);
                                } else {
                                    player.setData("AdBuffTime", now + buffTime);
                                }
                                this.buffingView.active = false;
                                this.NoBuffView.active = false;
                                viewManager.popView("AdBuffView", false);
                            }.bind(this))
                        } else {
                            gameApplication.warnTips("lang.shopNoMoney", function () {
                                viewManager.popView("RechargeView", true)
                            }.bind(this));
                        }
                    }.bind(this), this);
                    //绑定看视频翻倍按钮
                    this.video = cc.find("Bg/Video", view);
                    this.video.on("click", function () {
                        gameApplication.onVideoBtnClick(function (isOK) {
                            if (isOK) {
                                //处理视频广告增益效果
                                var adBuffTime = player.getData("AdBuffTime");
                                var now = gameApplication.getCurTime();
                                //是否还有增益时间
                                if (adBuffTime >= now) {
                                    player.setData("AdBuffTime", adBuffTime + buffTime);
                                } else {
                                    player.setData("AdBuffTime", now + buffTime);
                                }
                                this.buffingView.active = false;
                                this.NoBuffView.active = false;
                                viewManager.popView("AdBuffView", false);
                            }
                        }.bind(this), 0);
                    }.bind(this), this);
                    this.adViewInit = true;
                }

                //处理视频广告增益效果
                var adBuffTime = player.getData("AdBuffTime");
                var now = gameApplication.getCurTime();
                //是否还有增益时间
                if (adBuffTime >= now) {
                    this.buffingView.active = true;
                    this.NoBuffView.active = false;
                } else {
                    this.buffingView.active = false;
                    this.NoBuffView.active = true;
                }
            }.bind(this));
        } else if (type == "circle") {
            viewManager.popView("CircleView", true, function (view) {
                //初始化
                view.getComponent("CircleView").initView();
            }.bind(this));
        }
        else if (type == "setting") {
            SDK().plusPlayTimes();
            viewManager.popView("SettingView", true, function (view) {
                //初始化
            }.bind(this));
        }
        else if (type == "message") {
            console.log(type);
        }
        else if (type == "share") {
            gameApplication.onShareBtnClick();
        }
    },


    update(dt) { },
});
