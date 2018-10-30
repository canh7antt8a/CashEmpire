import { isContext } from "vm";
import { isString } from "util";

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
        openNode: {
            default: null,
            type: cc.Node,
        },
        lockBtn: {
            default: null,
            type: cc.Node,
        },
        openCost: {
            default: null,
            type: cc.Label,
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
        reviveBtn: {
            default: null,
            type: cc.Button,
        },
        reviveTime: {
            default: null,
            type: cc.Label,
        },
        reviveNum: {
            default: null,
            type: cc.Label,
        },
        buildingInited: {
            default: false,
            visible: false,
        },
    },

    reData() {
        SDK().setItem({ isFirst: 0 }, function () {
            console.log("reset ok")
        }.bind(this));
    },

    onLoad: function () {
        window.mainScript = this;
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
    },

    onEnable() {
        this.schedule(this.refreashVal, 0.5);
        this.schedule(this.countGameTime, 3);
    },
    onDisable() {
        this.unschedule(this.refreashVal);
    },

    start() {
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

    //计算游戏时长
    countGameTime() {
        player.itemArrayAdd("pScore", 5, 3);
        player.itemArraySet("pScore", 8, (new Date().getTime() / 1000));
    },

    //刷新数据
    refreashVal() {
        if (!this.buildingInited) {
            return;
        }
        this.head.spriteFrame = player.fbPlayer.head;
        this.coins.string = gameApplication.countUnit(player.itemArrayGet("pCurrency", 0))[2];
        this.diamonds.string = gameApplication.countUnit(player.itemArrayGet("pCurrency", 1))[3];
        var cost = buildManager.countFloorCost(this.floorInfoList.length);
        if (player.itemArrayGet("pCurrency", 0) >= cost) {
            this.lockBtn.active = false;
        } else {
            this.lockBtn.active = true;
        }
        this.openCost.string = gameApplication.countUnit(cost)[2];
        var count = parseInt(this.buyCount.string == "MAX" ? -1 : this.buyCount.string.replace("X", ""));
        for (var i = 0; i < this.floorList.length; i = i + 1) {

            //计算每次收益的金额
            this.floorList[i].prosMoney.string = gameApplication.countUnit(buildManager.countProfit(i))[2] + "/" + buildManager.countProfitTime(i) + "s";

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
        }
    },

    //初始化大楼
    initBuilding() {
        for (var i = 0; i < this.floorInfoList.length; i = i + 1) {
            this.loadFloor(i);
        }
        this.buildingInited = true;
    },

    //加载楼层
    loadFloor(idx, isFirst) {
        var floorInfo = {};
        floorInfo.idx = this.floorInfoList[idx][0];
        floorInfo.type = this.floorInfoList[idx][1];
        floorInfo.level = this.floorInfoList[idx][2];
        floorInfo.exp = this.floorInfoList[idx][3];
        if (this.floorList[idx] == null) {
            this.floorList[idx] = {};
        }
        var curItem = this.floorList[idx].curItem;
        if (curItem == null) {
            curItem = cc.instantiate(this.floorItem);
            curItem.parent = this.content;
            this.floorList[idx].curItem = curItem;
            //店面
            this.floorList[idx].shopSprite = cc.find("Bg/ShopSprite", curItem).getComponent(cc.Sprite);

            //关店图
            this.floorList[idx].closeSprite = cc.find("CloseSprite", curItem).getComponent(cc.Sprite);
            //开店按钮初始化
            this.initOpen(idx);

            //管家按钮
            this.floorList[idx].manager = cc.find("Manager", curItem);
            this.floorList[idx].manager.getComponent(dragonBones.ArmatureDisplay).dragonAsset = null;
            this.floorList[idx].mSprite = cc.find("Manager/Sprite", curItem).getComponent(cc.Sprite);
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
            this.floorList[idx].bar = cc.find("bar",this.floorList[idx].earnPros.node);
            this.floorList[idx].maxBar = cc.find("maxBar",this.floorList[idx].earnPros.node);
            this.floorList[idx].prosMoney = cc.find("FloorEarn/EarnPros/Money", this.floorList[idx].bottom).getComponent(cc.Label);
            this.floorList[idx].earnPros.totalLength = this.floorList[idx].earnPros.node.width - 10;

            //升级按钮
            this.floorList[idx].upShopUI = cc.find("UpShop", this.floorList[idx].bottom);
            this.floorList[idx].upBtn = cc.find("Buy", this.floorList[idx].upShopUI).getComponent(cc.Button);
            this.initUpBtn(idx);
            this.floorList[idx].upCost = cc.find("Cost", this.floorList[idx].upBtn.node).getComponent(cc.Label);
            this.floorList[idx].upNum = cc.find("Num/Val", this.floorList[idx].upBtn.node).getComponent(cc.Label);
        }
        //店面的背景
        var shopSprite = this.floorList[idx].shopSprite;
        //管理按钮
        var manager = this.floorList[idx].manager;
        //数据板
        var bottom = this.floorList[idx].bottom;
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
        var upShopUI = this.floorList[idx].upShopUI;
        var upBtn = this.floorList[idx].upBtn;
        var upCost = this.floorList[idx].upCost;
        var upNum = this.floorList[idx].upNum;

        var pic = this.storeInfoList[floorInfo.type].pic + (floorInfo.level >= 5 ? 4 : floorInfo.level);

        //设置店面图片
        resManager.loadSprite(pic, function (spriteFrame) {
            this.floorList[idx].shopSprite.spriteFrame = spriteFrame;
        }.bind(this));

        //店名设置
        floorName.string = this.storeInfoList[floorInfo.type].name;

        //等级设置
        floorLevel.string = "LV " + (floorInfo.level + 1);
        levelPros.progress = floorInfo.exp / buildManager.levelConfig[floorInfo.level];
        prosExt.string = "" + floorInfo.exp + "/" + buildManager.levelConfig[floorInfo.level];
        if (floorInfo.level == 5) {
            prosExt.string = "Max";
        }


        //利润设置
        earnPros.progress = 0;
        prosMoney.string = gameApplication.countUnit(buildManager.countProfit(idx))[2] + "/" + buildManager.countProfitTime(idx) + "s";

        //最大购买值设置
        var count = parseInt(this.buyCount.string == "MAX" ? -1 : this.buyCount.string.replace("X", ""));
        var maxNum = buildManager.countBatTrain(idx, count);
        upCost.string = gameApplication.countUnit(maxNum.cost)[2];
        upNum.string = maxNum.num;
        this.floorList[idx].curCost = maxNum.cost;

        curItem.active = true;
        this.openNode.zIndex = this.content.childrenCount;
        if (isFirst) {
            //开店效果
            var boom = cc.find("Boom", curItem);
            this.scheduleOnce(function () {
                boom.active = true;
            }.bind(this), 0.5)
        }
    },

    //初始化开店函数
    initOpen(idx) {
        var node = this.floorList[idx].closeSprite.node;
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            gameApplication.soundManager.playSound("btnClick");
            node.active = false;
            buildManager.openShop(idx);
        }.bind(this), this)
    },

    //初始化管理按钮
    initManager(idx) {
        var node = this.floorList[idx].manager;
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, function (event) {
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
    },

    reviveDiamondCount() {
        if (this.reTime <= 0) {
            this.reTime = 300;
            SDK().getItem("reDiamond", function (count) {
                count = count + 1;
                this.reviveNum.string = count;
                SDK().setItem({ reDiamond: count });
            }.bind(this));
        } else {
            var temp = this.reTime;
            var tempMin = temp / 60;
            var min = temp / 60 < 10 ? "0" + Math.floor(temp / 60) : "" + Math.floor(temp / 60);
            var sec = temp % 60 < 10 ? "0" + Math.floor(temp % 60) : "" + Math.floor(temp % 60);
            if (temp <= 0) {
                min = "00";
                sec = "00"
            }
            this.reviveTime.string = min + ":" + sec;
        }
        this.scheduleOnce(function () {
            this.reviveDiamondCount();
        }.bind(this), 1)
    },

    //点击事件处理
    menuClick(event, type) {
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
                //初始化
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
        else if (type == "more") {
            var btn = event.target;
            let btns = cc.find("Btns", btn.parent);
            //获取高度
            let height = btns.childrenCount * 100;
            let targetPos = null;
            //获取目标位置
            if (Math.abs(btns.y - 0) < 5) {
                targetPos = -height;
            } else if (Math.abs(btns.y + height) < 5) {
                targetPos = 0;
            }
            //可以移动重置状态并移动
            if (targetPos != null) {
                btns.stopAllActions();
                btns.y = Math.abs(targetPos) - height;
                btns.runAction(cc.moveTo(0.2, cc.v2(0, targetPos)).easing(cc.easeBackInOut(2)));
            }
        }
        else if (type == "setting") {
            viewManager.popView("SettingView", true, function (view) {
                //初始化
            }.bind(this));
        }
        else if (type == "message") {
            console.log(type);
        }
        else if (type == "share") {
            console.log(type);
        }
        else if (type == "reDiamond") {
            /* if (parseInt(this.reviveNum.string) == 0) {
                return;
            }
            this.reviveNum.string = 0;
            SDK().getItem("reDiamond", function (count) {
                //将可获得的体力置零
                SDK().setItem({ reDiamond: 0 }, function () {
                    //增加体力
                    SDK().getItem("diamonds", function (diamond) {
                        diamond = parseInt(diamond);
                        diamond = diamond + count;
                        if (Math.abs(this.node.y - 0) < 10) {
                            viewManager.flyReward(count, "diamondSprite", window.mainScript.diamonds, this.reviveBtn.node, function () {
                                if (null != window.mainScript.diamonds) {
                                    window.mainScript.diamonds.getComponent(cc.Label).string = diamond.toString();
                                }
                            }.bind(this));
                        }
                        SDK().setItem({ diamonds: diamond }, null);
                    }.bind(this));

                }.bind(this));

            }.bind(this)); */
        }
        else if (type == "openShop") {
            //开店
            viewManager.popView("StoreSelectView", true, function (view) {
                view.getComponent("StoreSelectView").initView(this.floorInfoList.length);
            }.bind(this));
        }
    },


    update(dt) {
        this.reTime = this.reTime - dt;
    },
});
