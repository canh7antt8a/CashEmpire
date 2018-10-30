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
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.goodItem.active = false;
    },


    //按钮点击事件
    menuClick(event, type) {
        soundManager.playSound("btnClick");
        if (type == "recharge") {
            var node = event.node;
            SDK().purchaseAsync(node.proId, node.proId, function (purchase) {
                console.log(purchase)
                if (purchase != false && purchase != null) {
                    SDK().consumePurchaseAsync(purchase.purchaseToken, function (isOk) {
                        if (isOk) {
                            console.log(node.gId, node.idx);
                            var info = this.goodInfoList[node.gId].infoList[node.idx];
                            if (node.gId == 0) {
                                console.log(info)
                                var diaNum = info.num;
                                player.itemArrayAdd("pCurrency", 1, diaNum);
                            } else {
                                console.log(info);
                            }
                        }
                    }.bind(this))
                }
            }.bind(this))
        }
    },

    onEnable() { },

    start() {
        //处理item之间的间距来适应分辨率
        var width = cc.winSize.width - 120;
        var count = 3;
        width = width - this.goodItem.width * count;
        this.currencyContent.getComponent(cc.Layout).spacingX = width / count;
        this.giftContent.getComponent(cc.Layout).spacingX = width / count;
        this.initView();
    },


    //刷新商品
    initView() {
        resManager.loadConfig("ResourceList", function (cof) {
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
        }.bind(this));
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
        var proview = cc.find("Proview/Sprite", curItem).getComponent(cc.Sprite);
        var desc = cc.find("Desc", curItem).getComponent(cc.Label);
        var buy = cc.find("Buy", curItem);
        var price = cc.find("Val", buy).getComponent(cc.Label);

        //加载图片信息
        resManager.loadSprite(info.pic, function (spriteFrame) {
            proview.spriteFrame = spriteFrame;
        }.bind(this));

        //描述
        desc.getComponent("LocalizedLabel").dataID = info.name;

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

        //价格初始化
        price.string = info.price;

        //放入列表并显示
        curItem.idx = info.id;
        this.scheduleOnce(function () {
            curItem.active = true;
        }.bind(this), idx * 0.1);

        curItem.parent = curContent;

    },

    // update (dt) {},
});
