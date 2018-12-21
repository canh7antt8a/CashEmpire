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
        //每个类型的容器
        typeContent: {
            default: [],
            type: [cc.Node],
            visible: false,
        },
        //每个类型的容器
        typeContentItem: {
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
        usingUIList: {
            default: [],
            visible: false,
        },
        freeSpeedNode: {
            default: null,
            type: cc.Node,
        },
        freeSpeedBtn: {
            default: null,
            type: cc.Button,
        },
        freeSpeedMark: {
            default: null,
            type: cc.Node,
        },
        freeSpeedText: {
            default: null,
            visible: false,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        window.shopScript = this;
        this.freeSpeedText = cc.find("Bg/GoodView/ScrollView/view/content/Free/Buy/Price",this.node).getComponent("LocalizedLabel");
    },


    //按钮点击事件
    menuClick(event, type) {
        soundManager.playSound("btnClick");
        if (type == "recharge") {
            viewManager.popView("RechargeView", true, function (view) {
                //初始化
            }.bind(this));
        } else if (type == "buy") {
            var node = event.target;
            //仓储信息
            var oldStore = player.getArrayAll("pProp");
            //判断是否拥有该永久道具
            if (node.gId == 0 && oldStore[node.gId][node.idx] > 0) {
                gameApplication.warnTips("lang.shopExistWarm");
                return;
            }
            //商品信息
            var info = this.selectInfo[node.gId].infoList[node.idx];
            //货币类型
            var mType = info.type;
            //货币价格
            var price = info.price;
            //判断是否够钱
            if (player.itemArrayGet("pCurrency", mType) >= price) {
                player.itemArrayAdd("pCurrency", mType, -price, function () {
                    //记录购买
                    gameApplication.DataAnalytics.dealItem(0,
                        {
                            itemID: gameApplication.lang[info.name.replace("lang.", "")],
                            itemType: info.effect,
                            itemCount: 1,
                            VirtualCoin: info.price,
                            VirtualType: info.type,
                            consumePoint: "0"
                        }
                    )

                    soundManager.playSound("buyGood");
                    //仓储更新
                    var oldVal = oldStore[node.gId][node.idx];
                    oldStore[node.gId][node.idx] = oldVal + 1;
                    player.itemArraySet("pProp", node.gId, oldStore[node.gId]);

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
                    this.loadGoodItem(node.gId, node.idx);
                }.bind(this))
            } else {
                gameApplication.warnTips("lang.shopNoMoney", function () {
                    viewManager.popView("RechargeView", true)
                }.bind(this));
            }
        } else if (type == "use") {
            var node = event.target;//node.gid,node.idx,node.kind道具的类型,node.effect//类型中的等级
            //使用一次性的道具
            if (node.gId == 1) {
                //改名卡
                if (node.kind == 2) {
                    return;
                }
                //判断第几类道具的第几类的状态是否大于零
                if (buildManager.goodSkills[node.gId][node.kind] < 0 || node.kind == 1) {
                    //判断是否使用
                    this.surePop(node, function (isOk) {
                        if (isOk) {
                            //记录使用
                            gameApplication.DataAnalytics.dealItem(2,
                                {
                                    itemID: gameApplication.lang[shopScript.selectInfo[node.gId].infoList[node.idx].name.replace("lang.", "")],
                                    itemType: node.effect,
                                    itemCount: 1,
                                    reason: "",
                                }
                            )

                            //道具数量减少一个
                            this.storeInfo[node.gId][node.idx] = this.storeInfo[node.gId][node.idx] - 1;
                            player.itemArraySet("pProp", node.gId, this.storeInfo[node.gId], function () {
                                //获取该道具的信息time,per
                                var effect = buildManager.goodSkillsEffect[node.gId][node.kind][node.effect];
                                //记录道具使用最后结束的时间
                                buildManager.goodSkillsTime[node.gId][node.kind] = gameApplication.getCurTime() + effect.time;
                                player.itemArraySet("goodSkillsTime", node.gId, buildManager.goodSkillsTime[node.gId]);
                                //乐透
                                if (node.kind == 1) {
                                    //随机倍数
                                    var randomMul = effect.time;
                                    var totalProfit = 0;
                                    for (var idx = 0; idx < mainScript.floorInfoList.length; idx = idx + 1) {
                                        if (mainScript.floorInfoList[idx] != null && mainScript.floorInfoList[idx] != "undefined" && mainScript.floorInfoList[idx] != undefined) {
                                            totalProfit = totalProfit + (buildManager.countProfit(idx) / buildManager.countProfitTime(idx));
                                        }
                                    }
                                    //计算总钱数并保存
                                    var cash = totalProfit * randomMul;
                                    soundManager.playSound("getMoney");
                                    player.itemArrayAdd("pCurrency", 0, cash, function () {
                                        //将该类道具的状态重置为-1
                                        buildManager.goodSkills[node.gId][node.kind] = -1;
                                        player.itemArraySet("goodSkills", 1, buildManager.goodSkills[node.gId]);
                                    }.bind(this))
                                    effectManager.flyReward(10, 0, mainScript.coins.node, null, null, true);
                                } else {
                                    //并设置一次性道具此类型的使用状态
                                    buildManager.goodSkills[node.gId][node.kind] = node.effect;
                                    player.itemArraySet("goodSkills", 1, buildManager.goodSkills[node.gId]);
                                }
                                //刷新
                                this.loadGoodItem(node.gId, node.idx);
                            }.bind(this))
                        }
                    }.bind(this));
                } else {
                    gameApplication.warnTips("lang.storeUsing");
                }
            }
        }else if (type == "FreeSpeed") {
            //处理视频广告增益效果
            var adBuffTime = player.getData("AdBuffTime", null, false);
            var now = gameApplication.getCurTime();
            //是否还有增益时间
            if (adBuffTime+120 < now) {
                gameApplication.onVideoBtnClick(function (isOK) {
                    if (isOK) {
                        var buffTime = 180;
                        now = gameApplication.getCurTime();
                        player.setData("AdBuffTime", now + buffTime);
                    }
                }.bind(this), 0);
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

        var totalProfit = 0;
        for (var idx = 0; idx < mainScript.floorInfoList.length; idx = idx + 1) {
            if (mainScript.floorInfoList[idx] != null && mainScript.floorInfoList[idx] != "undefined" && mainScript.floorInfoList[idx] != undefined) {
                totalProfit = totalProfit + (buildManager.countProfit(idx) / buildManager.countProfitTime(idx));
            }
        }
        this.goodList[1][3].coinNum.string = gameApplication.countUnit(totalProfit * 1800)[2];
        this.goodList[1][3].coinNum.node.active = true;
        this.goodList[1][4].coinNum.string = gameApplication.countUnit(totalProfit * 15000)[2];
        this.goodList[1][4].coinNum.node.active = true;

        var adBuffTime = player.getData("AdBuffTime", null, false);
        var now = gameApplication.getCurTime();
        if(adBuffTime + 120 < now){
            this.freeSpeedText.dataID = "lang.rechargeFree";
            this.freeSpeedBtn.interactable = true;
            this.freeSpeedMark.active = true;
            mainScript.shopMark.active = true;
        }else{
            var cd = adBuffTime + 120 - now;
            this.freeSpeedText.dataID = gameApplication.countTime(cd)[0];
            this.freeSpeedBtn.interactable = false;
            this.freeSpeedMark.active = false;
            mainScript.shopMark.active = false;
        }
    },

    start() {
        this.storeInfo = player.getArrayAll("pProp");
    },

    //加载商品
    initView(cb) {
        resManager.loadConfig("ShopInfoList", function (cof) {
            //商品储存信息
            shopScript.selectInfo = cof.shopInfoList.typeList;
            for (i = 0; i < this.selectInfo.length; i = i + 1) {
                this.initGoodList(i);
            }
            this.shopInit = true;
            if (cb != null) {
                cb();
            }
        }.bind(this));
    },

    //初始化商品列表
    initGoodList(idx) {
        //初始化UI储存
        if (this.goodList[idx] == null) {
            this.goodList[idx] = [];
        }

        //获取当前类型列表信息并加载
        var infoList = this.selectInfo[idx].infoList
        for (var i = 0; i < infoList.length; i = i + 1) {
            this.loadGoodItem(idx, i);
        }
    },

    //初始化商品信息
    loadGoodItem(gId, idx) {
        if (gId == 1 && idx != 0 && idx != 1 && idx != 2 && idx != 7 && idx != 8 && idx != 11 && idx != 12) {
           
        }else{
            return;
        }
        var info = this.selectInfo[gId].infoList[idx];
        if (this.goodList[gId][idx] == null) {
            this.goodList[gId][idx] = {};
        }
        var curItem = this.goodList[gId][idx].curItem;
        if (curItem == null) {
            curItem = cc.instantiate(this.goodItem);
            curItem.name = "Good" + idx;
            this.goodList[gId][idx].curItem = curItem;
            this.goodList[gId][idx].showSprite = cc.find("ShowBg/Sprite", curItem).getComponent(cc.Sprite);
            this.goodList[gId][idx].name = cc.find("Name", curItem).getComponent("LocalizedLabel");
            this.goodList[gId][idx].desc = cc.find("Desc", curItem).getComponent("LocalizedLabel");
            this.goodList[gId][idx].buyBtn = cc.find("Buy", curItem);
            this.goodList[gId][idx].price = cc.find("Buy/Price", curItem).getComponent("LocalizedLabel");
            this.goodList[gId][idx].costType = cc.find("Buy/Type", curItem).getComponent(cc.Sprite);
            this.goodList[gId][idx].numText = cc.find("Buy/Num/Text", curItem).getComponent(cc.Label);
            this.goodList[gId][idx].coinNum = cc.find("Num", curItem).getComponent(cc.Label);
        }
        var showSprite = this.goodList[gId][idx].showSprite;
        var name = this.goodList[gId][idx].name;
        var desc = this.goodList[gId][idx].desc;
        var buyBtn = this.goodList[gId][idx].buyBtn;
        var price = this.goodList[gId][idx].price;
        var costType = this.goodList[gId][idx].costType;
        var numText = this.goodList[gId][idx].numText;

        //名字
        name.dataID = info.name;

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
        buyBtn.kind = info.kind;
        buyBtn.effect = info.effect;

        var num = this.storeInfo[gId][idx];
        if (gId == 0) {
            numText.node.parent.active = false;
            if (num > 0) {
                buyBtn.off("click");
                costType.node.active = false;
                var effectIdx = buildManager.goodSkills[0][info.kind];
                if (effectIdx == info.effect) {
                    buyBtn.active = true;
                    price.dataID = "lang.propUsing";
                } else {
                    buyBtn.active = false;
                }
            } else {
                costType.node.active = true;
                buyBtn.active = true;
                //价格
                price.getComponent(cc.Label).string = info.price;
                buyBtn.off("click");
                buyBtn.on("click", function (event) {
                    gameApplication.soundManager.playSound("btnClick");
                    this.menuClick(event, "buy");
                }.bind(this), this)
            }
        } else {
            if (buildManager.goodSkills[gId][info.kind] == info.effect && info.kind != 1) {
                costType.node.active = false;
                numText.node.parent.active = true;
                numText.string = num;
                buyBtn.active = true;
                price.dataID = "lang.propUsing";
                buyBtn.off("click");
            } else {
                if (num > 0) {
                    costType.node.active = false;
                    numText.node.parent.active = true;
                    numText.string = num;
                    buyBtn.active = true;
                    price.dataID = "lang.homeUse";
                    buyBtn.off("click");
                    buyBtn.on("click", function (event) {
                        gameApplication.soundManager.playSound("btnClick");
                        this.menuClick(event, "use");
                    }.bind(this), this)
                } else {
                    costType.node.active = true;
                    numText.node.parent.active = false;
                    buyBtn.active = true;
                    //价格
                    price.getComponent(cc.Label).string = info.price;
                    buyBtn.off("click");
                    buyBtn.on("click", function (event) {
                        gameApplication.soundManager.playSound("btnClick");
                        this.menuClick(event, "buy");
                    }.bind(this), this)
                }
            }
        }

        //读取图片信息
        resManager.loadSprite(info.tPic, function (spriteFrame) {
            costType.spriteFrame = spriteFrame;
            costType.node.width = spriteFrame._rect.width;
            costType.node.height = spriteFrame._rect.height;
        }.bind(this));

        if (this.typeContent[gId] == null) {
            this.typeContent[gId] = cc.instantiate(this.typeContentItem);
            this.typeContent[gId].name = "Content" + gId;
            this.typeContent[gId].parent = this.goodContent;
            this.freeSpeedNode.parent = this.typeContent[gId];
            var titelName = cc.find("Titel/Bg/Text", this.typeContent[gId]).getComponent("LocalizedLabel");
            titelName.dataID = this.selectInfo[gId].type;
            titelName.node.parent.parent.active = false;
            //处理item之间的间距来适应分辨率
            var width = this.typeContent[gId].width;
            var count = 3;
            width = width - (this.goodItem.width * count);
            this.typeContent[gId].getComponent(cc.Layout).spacingX = width / (count - 1);
            if (gId != 0) {
                this.typeContent[gId].active = true;
            }
        }
        curItem.parent = this.typeContent[gId];
        curItem.active = true;
    },

    //确认弹窗
    surePop(node, cb) {
        var info = this.selectInfo[node.gId].infoList[node.idx];
        viewManager.popView("UsePopView", true, function (view) {
            var noBtn = cc.find("Bg/No", view);
            var okBtn = cc.find("Bg/Ok", view);
            //加载描述
            var desc = cc.find("Bg/Desc", view).getComponent("LocalizedLabel");
            desc.dataID = info.desc;
            //加载图片
            var sprite = cc.find("Bg/Sprite", view).getComponent(cc.Sprite);
            resManager.loadSprite(info.pic, function (spriteFrame) {
                sprite.spriteFrame = spriteFrame;
            }.bind(this))
            //按钮事件绑定
            noBtn.off("click");
            noBtn.on("click", function () {
                viewManager.popView("UsePopView", false);
                if (cb != null) {
                    cb(false);
                }
            }.bind(this))
            okBtn.off("click");
            okBtn.on("click", function () {
                viewManager.popView("UsePopView", false);
                if (cb != null) {
                    cb(true);
                }
            }.bind(this))
        }.bind(this))
    },

    // update (dt) {},
});
