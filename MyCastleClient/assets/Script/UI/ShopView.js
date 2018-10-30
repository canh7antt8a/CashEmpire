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
        //商品滚动界面
        goodView: {
            default: null,
            type: cc.ScrollView,
        },
        //滚动体
        goodContent: {
            default: null,
            type: cc.Node,
        },
        //预制件
        goodItem: {
            default: null,
            type: cc.Node,
        },
        //商品UI存储列表
        goodList: {
            default: [],
            visible: false,
        },
        //信息存储列表
        selectInfo: {
            default: {},
            visible: false,
        },
        typeBtns: {
            default: [],
            type: [cc.Node],
        },
        typeName: {
            default: null,
            type: cc.Label,
        },
        curIdx: {
            default: 0,
            type: cc.Integer,
            visible: false,
        },
        //金币数量
        coins: {
            default: null,
            type: cc.Label,
        },
        //钻石数量
        diamonds: {
            default: null,
            type: cc.Label,
        },
        shopInit: {
            default: false,
            visible: false,
        },
        usingUIList:{
            default: [],
            visible: false,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        window.shopScript = this;
    },


    //按钮点击事件
    menuClick(event, type) {
        soundManager.playSound("btnClick");
        if (type == "recharge") {
            viewManager.popView("RechargeView", true, function (view) {
                //初始化
            }.bind(this));
        } else if (type == "nextType") {
            this.typeBtns[0].active = true;
            this.initGoodList(this.curIdx + 1);
        } else if (type == "proType") {
            this.typeBtns[1].active = true;
            this.initGoodList(this.curIdx - 1);
        } else if (type == "buy") {
            var node = event.node;
            var info = this.selectInfo[node.gId].infoList[node.idx];
            var mType = info.type;//货币类型
            var price = info.price;//货币价格
            if (player.itemArrayGet("pCurrency", mType) >= price) {
                player.itemArrayAdd("pCurrency", mType, -price, function () {
                    //仓储更新
                    var oldStore = player.getArrayAll("homeStore");
                    var oldVal = oldStore[node.gId][node.idx];
                    oldStore[node.gId][node.idx] = oldVal + 1;
                    player.itemArraySet("homeStore", node.gId, oldStore[node.gId]);

                    //永久性道具
                    if (node.gId == 0) {
                        //技能效果的更替
                        var goodSkills = buildManager.goodSkills;
                        var oldEffect = goodSkills[node.gId][info.kind];
                        if (info.effect >= oldEffect) {
                            goodSkills[node.gId][info.kind] = info.effect;
                        }
                        buildManager.goodSkills[node.gId] = goodSkills[node.gId];
                        player.itemArraySet("goodSkills", node.gId, goodSkills[node.gId]);
                    }

                    //如果是购买了执照则增加数量
                    if (node.gId == 2) {
                        player.itemArrayAdd("myLicense", info.idx, 1);
                    }
                }.bind(this))
            }
        }
    },

    onEnable() {
        this.schedule(this.refreshData, 0.1);
    },
    onDisable() {
        this.unschedule(this.refreshData);
    },

    //刷新数据
    refreshData() {
        if (!this.shopInit) {
            return;
        }
        this.coins.string = gameApplication.countUnit(player.itemArrayGet("pCurrency", 0))[2];
        this.diamonds.string = gameApplication.countUnit(player.itemArrayGet("pCurrency", 1))[3];
    },

    start() {
        //处理item之间的间距来适应分辨率
        var width = cc.winSize.width - 150;
        var count = 2;
        width = width - (this.goodItem.width * count);
        this.goodContent.getComponent(cc.Layout).spacingX = width / (count - 1);
    },

    //加载商品
    initView() {
        this.initGoodList(0);
        this.shopInit = true;
    },

    //初始化商品列表
    initGoodList(idx) {
        //初始化UI储存
        if (this.goodList[idx] == null) {
            this.goodList[idx] = [];
        }
        //隐藏上一个类型的UI
        for (var i = 0; i < this.goodList[this.curIdx].length; i = i + 1) {
            this.goodList[this.curIdx][i].curItem.active = false;
        }
        //改变当前的类型标示
        this.curIdx = idx;
        //当前类型名字改变
        this.typeName.getComponent("LocalizedLabel").dataID = this.selectInfo[idx].type;
        //按钮的隐藏
        if (this.curIdx == 0) {
            this.typeBtns[0].active = false;
            this.typeBtns[1].active = true;
        }
        if (this.curIdx == this.selectInfo.length - 1) {
            this.typeBtns[0].active = true;
            this.typeBtns[1].active = false;
        }

        //获取当前类型列表信息并加载
        var infoList = this.selectInfo[idx].infoList
        this.goodContent.active = false;
        for (var i = 0; i < infoList.length; i = i + 1) {
            this.loadGoodItem(idx, i);
        }
        this.goodContent.active = true;
    },

    //初始化商品信息
    loadGoodItem(gId, idx) {
        var info = this.selectInfo[gId].infoList[idx];
        if (this.goodList[gId][idx] == null) {
            this.goodList[gId][idx] = {};
        }
        var curItem = this.goodList[gId][idx].curItem;
        if (curItem == null) {
            curItem = cc.instantiate(this.goodItem);
            this.goodList[gId][idx].curItem = curItem;
            this.goodList[gId][idx].showSprite = cc.find("ShowBg/Sprite", curItem).getComponent(cc.Sprite);
            this.goodList[gId][idx].desc = cc.find("Desc", curItem).getComponent("LocalizedLabel");
            this.goodList[gId][idx].buyBtn = cc.find("Buy", curItem);
            this.goodList[gId][idx].price = cc.find("Buy/Price", curItem).getComponent(cc.Label);
            this.goodList[gId][idx].costType = cc.find("Buy/Type", curItem).getComponent(cc.Sprite);
        }
        var showSprite = this.goodList[gId][idx].showSprite
        var desc = this.goodList[gId][idx].desc;
        var buyBtn = this.goodList[gId][idx].buyBtn;
        var price = this.goodList[gId][idx].price;
        var costType = this.goodList[gId][idx].costType;

        var picName = info.pic;
        if (gId == 2) {
            picName = info.pic + 0;
        }
        //读取图片信息
        resManager.loadSprite(picName, function (spriteFrame) {
            showSprite.spriteFrame = spriteFrame;
            showSprite.node.width = spriteFrame._rect.width;
            showSprite.node.height = spriteFrame._rect.height;
            if (gId == 2) {
                showSprite.node.width = 121.4;
                showSprite.node.height = 74.2;
            }
        }.bind(this));

        //商品描述
        desc.dataID = info.desc;

        //购买按钮初始化
        buyBtn.gId = gId
        buyBtn.idx = idx;
        buyBtn.off("click");
        buyBtn.on("click", function (event) {
            gameApplication.soundManager.playSound("btnClick");
            this.menuClick(event, "buy");
        }.bind(this), this)

        //读取图片信息
        resManager.loadSprite(info.tPic, function (spriteFrame) {
            costType.spriteFrame = spriteFrame;
            costType.node.width = spriteFrame._rect.width;
            costType.node.height = spriteFrame._rect.height;
        }.bind(this));

        //价格
        price.string = info.price;

        curItem.active = true;
        curItem.parent = this.goodContent;
    },

    // update (dt) {},
});
