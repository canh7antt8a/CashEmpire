import { SSL_OP_LEGACY_SERVER_CONNECT } from "constants";

// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        //滚动体
        currencyContent: {
            default: null,
            type: cc.Node,
        },
        //库存UI存储列表
        currencyList: {
            default: [],
            visible: false,
        },
        //滚动体
        giftContent: {
            default: null,
            type: cc.Node,
        },
        //礼包UI存储列表
        giftList: {
            default: [],
            visible: false,
        },
        //商品预制件
        goodItem: {
            default: null,
            type: cc.Node,
        },
        goodInfoList: {
            default: null,
            visible: false,
        },
        //分享礼包
        shareGiftUI: {
            default: {},
            visible: false,
        },
        //视频礼包
        videoGiftUI: {
            default: {},
            visible: false,
        },
        isInit: {
            default: false,
            visible: false,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.goodItem.active = false;
        this.shareGiftUI.btn = cc.find("Bg/ScrollView/view/content/CurrencyRecharge/view/content/ShareGift/Buy", this.node).getComponent(cc.Button);
        this.shareGiftUI.tips = cc.find("Bg/ScrollView/view/content/CurrencyRecharge/view/content/ShareGift/!Text", this.node)
        this.shareGiftUI.cd = cc.find("Bg/ScrollView/view/content/CurrencyRecharge/view/content/ShareGift/CdTime", this.node).getComponent(cc.Label);

        this.videoGiftUI.btn = cc.find("Bg/ScrollView/view/content/CurrencyRecharge/view/content/VideoGift/Buy", this.node).getComponent(cc.Button);
        this.videoGiftUI.tips = cc.find("Bg/ScrollView/view/content/CurrencyRecharge/view/content/VideoGift/!Text", this.node)
        this.videoGiftUI.cd = cc.find("Bg/ScrollView/view/content/CurrencyRecharge/view/content/VideoGift/CdTime", this.node).getComponent(cc.Label);
    },


    //按钮点击事件
    menuClick(event, type) {
        soundManager.playSound("btnClick");
        if (type == "recharge") {
            var node = event.target;
            SDK().purchaseAsync(node.proId, node.proId, function (purchase) {
                if (purchase != false && purchase != null) {
                    SDK().consumePurchaseAsync(purchase.purchaseToken, function (isOk) {
                        if (isOk) {
                            var info = this.goodInfoList[node.gId].infoList[node.idx];
                            if (node.gId == 0) {
                                var diaNum = info.num;
                                player.itemArrayAdd("pCurrency", 1, diaNum);
                                player.itemArrayAdd("pCurrency", 2, info.price);
                            } else {
                                console.log(info);
                            }
                        }
                    }.bind(this))
                }
            }.bind(this))
        } else if ("videoFree" == type) {
            gameApplication.checkDailyCount("videoFree", false, function (val) {
                if (val < 1) {
                    gameApplication.onVideoBtnClick(function (isOk) {
                        if (isOk) {
                            gameApplication.DataAnalytics.doEvent("rechargeFreeVideo");
                            player.itemArrayAdd("pCurrency", 1, 25);
                            effectManager.flyReward(10, 1, mainScript.diamonds.node, event.target, null, true);
                            gameApplication.checkDailyCount("videoFree", true);
                        }
                    }.bind(this), 1)
                } else {
                    gameApplication.warnTips("lang.rechargeFreeLimit");
                }
            }.bind(this))
        } else if ("shareFree" == type) {
            gameApplication.checkDailyCount("shareFree", false, function (val) {
                if (val < 1) {
                    gameApplication.onShareBtnClick(function (isOk) {
                        if (isOk) {
                            gameApplication.DataAnalytics.doEvent("rechargeFreeShare");
                            player.itemArrayAdd("pCurrency", 1, 25);
                            effectManager.flyReward(10, 1, mainScript.diamonds.node, event.target, null, true);
                            gameApplication.checkDailyCount("shareFree", true);
                        }
                    }.bind(this))
                } else {
                    gameApplication.warnTips("lang.rechargeFreeLimit");
                }
            }.bind(this))
        }
    },

    onEnable() {
        this.schedule(this.refreashVal, 0.5);
    },
    onDisable() {
        this.unschedule(this.refreashVal);
    },

    refreashVal() {
        if (this.isInit) {
            let num = 0;
            let mark = function () {
                num = num + 1;
                if(num == 2){
                    mainScript.rechargeMark.active = false;
                }else{
                    mainScript.rechargeMark.active = true;
                }
            }.bind(this)
            gameApplication.checkDailyCount("videoFree", false, function (val) {
                if (val < 1) {
                    this.videoGiftUI.btn.interactable = true;
                    this.videoGiftUI.tips.active = true;
                    this.videoGiftUI.cd.string = "";
                } else {
                    mark();
                    this.videoGiftUI.btn.interactable = false;
                    this.videoGiftUI.tips.active = false;
                    var dtEnd = new Date();
                    dtEnd = new Date(dtEnd.getFullYear(), dtEnd.getMonth(), dtEnd.getDate() + 1);
                    dtEnd = dtEnd.getTime() / 1000;
                    var curTime = gameApplication.getCurTime();
                    this.videoGiftUI.cd.string = gameApplication.countTime(dtEnd - curTime)[0];
                }
            }.bind(this))
            gameApplication.checkDailyCount("shareFree", false, function (val) {
                if (val < 1) {
                    this.shareGiftUI.btn.interactable = true;
                    this.shareGiftUI.tips.active = true;
                    this.shareGiftUI.cd.string = "";
                    mark();
                } else {
                    mark();
                    this.shareGiftUI.btn.interactable = false;
                    this.shareGiftUI.tips.active = false;
                    var dtEnd = new Date();
                    dtEnd = new Date(dtEnd.getFullYear(), dtEnd.getMonth(), dtEnd.getDate() + 1);
                    dtEnd = dtEnd.getTime() / 1000;
                    var curTime = gameApplication.getCurTime();
                    this.shareGiftUI.cd.string = gameApplication.countTime(dtEnd - curTime)[0];
                }
            }.bind(this))
        }
    },

    start() {
        //处理item之间的间距来适应分辨率
        var width = cc.winSize.width - 85;
        var count = 3;
        width = width - (this.goodItem.width * count);
        this.currencyContent.getComponent(cc.Layout).spacingX = (width / count);
        this.giftContent.getComponent(cc.Layout).spacingX = (width / count);
        //苹果不可付费
        if (cc.sys.os != cc.sys.OS_IOS) {
            this.initView();
        } else {
            this.isInit = true;
        }
    },


    //刷新商品
    initView(cb) {
        resManager.loadConfig("RechargeList", function (cof) {
            this.goodInfoList = cof.rechargeList.typeList;
            var currencyList = cof.rechargeList.typeList[0].infoList;
            var giftList = cof.rechargeList.typeList[1].infoList;
            for (var i = 0; i < currencyList.length || i < giftList.length; i = i + 1) {
                if (i < currencyList.length) {
                    this.loadGoodList(i, 0);
                }
                if (i < giftList.length) {
                    this.loadGoodList(i, 1);
                }
            }
            this.isInit = true;
        }.bind(this));

        if (cb != null) {
            cb();
        }
    },

    //加载货币选择列表
    loadGoodList(idx, gId) {
        var info = this.goodInfoList[gId].infoList[idx];
        var curList;
        var curContent;
        if (gId == 0) {
            curList = this.currencyList;
            curContent = this.currencyContent;
        } else if (gId == 1) {
            curList = this.giftList;
            curContent = this.giftContent;
        } else {
            console.log("wrong type");
            return;
        }

        //缓存的数组获取，否则创建
        var curItem = curList[idx];
        if (curItem == null) {
            curItem = cc.instantiate(this.goodItem);
            curList[idx] = curItem;
        }

        //初始化类型名称
        var name = cc.find("Name", curItem).getComponent("LocalizedLabel");
        var proview = cc.find("Proview/Sprite", curItem).getComponent(cc.Sprite);
        var desc = cc.find("Desc", curItem).getComponent("LocalizedLabel");
        var buy = cc.find("Buy", curItem);
        var price = cc.find("Val", buy).getComponent(cc.Label);

        name.dataID = info.name;

        //加载图片信息
        resManager.loadSprite(info.pic, function (spriteFrame) {
            proview.spriteFrame = spriteFrame;
        }.bind(this));

        //描述（）
        desc.dataID = "USD" + info.price;

        //价格初始化（改成显示获得多少钻石）
        price.string = info.num;

        //购买按钮初始化
        buy.gId = gId;
        buy.idx = idx;
        buy.proId = info.proId;
        //购买按钮初始化
        buy.off("click");
        buy.on("click", function (event) {
            gameApplication.soundManager.playSound("btnClick");
            this.menuClick(event, "recharge");
        }.bind(this), this)

        //放入列表并显示
        curItem.idx = info.id;
        this.scheduleOnce(function () {
            curItem.active = true;
        }.bind(this), idx * 0.1);

        curItem.parent = curContent;
    },

    //免费获得钻石
    freeRecharge(event, type) {
        console.log(event)
    }
    // update (dt) {},
});
