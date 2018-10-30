import { isNull } from "util";

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
        //预览图
        proView: {
            default: null,
            type: cc.Sprite,
        },
        //仓储滚动界面
        stockView: {
            default: null,
            type: cc.ScrollView,
        },
        //滚动体
        stockContent: {
            default: null,
            type: cc.Node,
        },
        //仓储预制件
        stockItem: {
            default: null,
            type: cc.Node,
        },
        //仓储UI存储列表
        stockList: {
            default: [],
            visible: false,
        },
        //信息存储列表
        typeInfoList: {
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
        //商品信息
        selectInfo: {
            default: [],
            visible: false,
        },
        //仓储信息
        storeInfo: {
            default: [],
            visible: false,
        },
        homeInit: {
            default: false,
            visible: false,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        window.honeScript = this;
    },

    onEnable() {
        if (this.homeInit) {
            this.initStockList(this.curIdx);
        }
    },

    //按钮点击事件
    menuClick(event, type) {
        soundManager.playSound("btnClick");
        if (type == "recharge") {
            viewManager.popView("RechargeView", true, function (view) {
                //初始化
            }.bind(this));
        } else if (type == "nextType") {
            this.curIdx++;
            this.typeBtns[0].active = true;
            this.initStockList(this.curIdx);
        } else if (type == "proType") {
            this.curIdx--;
            this.typeBtns[1].active = true;
            this.initStockList(this.curIdx);
        } else if (type == "use") {
            var node = event.node;//node.gid,node.idx,node.kind,node.effect
            //使用一次性的道具
            if (node.gId == 1) {
                //改名卡
                if (node.kind == 2) {
                    return;
                }
                //判断第几类道具的第几类的状态是否大于零
                if (buildManager.goodSkills[node.gId][node.kind] < 0) {
                    //道具数量减少一个
                    this.storeInfo[node.gId][node.idx] = this.storeInfo[node.gId][node.idx] - 1;
                    player.itemArraySet("homeStore", node.gId, this.storeInfo[node.gId], function () {
                        //获取该道具的信息time,per
                        var effect = buildManager.goodSkillsEffect[node.gId][node.kind][node.effect];

                        //记录道具使用最后结束的时间
                        buildManager.goodSkillsTime[node.gId][node.kind] = gameApplication.getCurTime() + effect.time;
                        player.itemArraySet("goodSkillsTime", node.gId, buildManager.goodSkillsTime[node.gId]);

                        //并设置一次性道具此类型的使用状态
                        buildManager.goodSkills[node.gId][node.kind] = node.effect;
                        player.itemArraySet("goodSkills", 1, buildManager.goodSkills[node.gId]);

                        //乐透
                        if (node.kind == 1) {
                            //随机倍数
                            var randomMul = effect.time + Math.random() * (effect.per - effect.time);

                            //计算总钱数并保存
                            var cash = player.itemArrayGet("pCurrency", 0) * randomMul;
                            player.itemArraySet("pCurrency", 0, cash, function () {
                                //将该类道具的状态重置为-1
                                buildManager.goodSkills[node.gId][node.kind] = -1;
                                player.itemArraySet("goodSkills", 1, buildManager.goodSkills[node.gId]);
                            }.bind(this))
                        }
                        //刷新
                        this.initStockList(this.curIdx);
                    }.bind(this))
                } else {
                    console.log("all ready use same type");
                }
            }
        }
    },

    start() {
        //处理item之间的间距来适应分辨率
        var width = cc.winSize.width - 130;
        var count = 2;
        width = width - (this.stockItem.width * count);
        this.stockContent.getComponent(cc.Layout).spacingX = width / (count - 1);
    },

    //加载仓库
    initView() {
        if (this.homeInit) {
            return;
        }
        resManager.loadConfig("ResourceList", function (cof) {
            //储存信息
            this.selectInfo = cof.shopInfoList.typeList;
            this.initStockList(0);
            this.homeInit = true;
        }.bind(this));
    },

    //初始化商品列表
    initStockList(idx) {
        this.storeInfo = player.getArrayAll("homeStore");
        this.curIdx = idx;
        //按钮的隐藏
        if (this.curIdx == 0) {
            this.typeBtns[0].active = false;
            this.typeBtns[1].active = true;
        }
        if (this.curIdx == this.selectInfo.length - 1) {
            this.typeBtns[0].active = true;
            this.typeBtns[1].active = false;
        }
        //当前类型名字改变
        this.typeName.getComponent("LocalizedLabel").dataID = this.selectInfo[idx].type;
        this.stockContent.active = false;
        for (var i = 0; i < this.storeInfo[idx].length || i < this.stockList.length; i = i + 1) {
            if (i < this.storeInfo[idx].length) {
                this.loadStockItem(idx, i)
            } else {
                if (this.stockList[i].curItem != null) {
                    this.stockList[i].curItem.active = false;
                }
            }
        }
        this.stockContent.active = true;

    },

    //初始化商品信息
    loadStockItem(gId, idx) {
        var info = this.selectInfo[gId].infoList[idx];
        var storeInfo = this.storeInfo[gId][idx];
        if (this.stockList[idx] == null) {
            this.stockList[idx] = {};
        }
        var curItem = this.stockList[idx].curItem;
        if (storeInfo <= 0) {
            if (curItem != null) {
                curItem.active = false;
            }
            return;
        }
        if (curItem == null) {
            curItem = cc.instantiate(this.stockItem);
            this.stockList[idx].curItem = curItem;
            this.stockList[idx].showSprite = cc.find("Proview/Sprite", curItem).getComponent(cc.Sprite);
            this.stockList[idx].desc = cc.find("Desc/Text", curItem).getComponent("LocalizedLabel");
            this.stockList[idx].useBtn = cc.find("Use", curItem);
            this.stockList[idx].useText = cc.find("Use/Text", curItem).getComponent("LocalizedLabel");
        }
        var showSprite = this.stockList[idx].showSprite
        var desc = this.stockList[idx].desc;
        var useBtn = this.stockList[idx].useBtn;
        var useText = this.stockList[idx].useText;

        //读取图片信息
        resManager.loadSprite(info.pic, function (spriteFrame) {
            showSprite.spriteFrame = spriteFrame;
        }.bind(this));

        //库存描述
        desc.dataID = info.desc;

        useBtn.gId = gId;
        useBtn.idx = idx;
        useBtn.kind = info.kind;
        useBtn.effect = info.effect;
        //购买按钮初始化
        useBtn.off("click");
        useBtn.on("click", function (event) {
            gameApplication.soundManager.playSound("btnClick");
            this.menuClick(event, "use");
        }.bind(this), this)

        if (gId == 0) {
            var effectIdx = buildManager.goodSkills[0][info.kind]
            if (effectIdx == info.effect) {
                useBtn.active = true;
                useText.dataID = "lang.propUsing";
            } else {
                useBtn.active = false;
            }
        } else {
            //价格
            useText.dataID = ""+storeInfo;
            useBtn.active = true;
        }


        curItem.active = true;
        curItem.parent = this.stockContent;
    },

    //start() {},

    // update (dt) {},
});
