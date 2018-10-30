cc.Class({
    extends: cc.Component,

    properties: {
        preHead: {
            default: null,
            type: cc.Sprite,
        },
        preName: {
            default: null,
            type: cc.Label,
        },
        preVal: {
            default: null,
            type: cc.Label,
        },
        allPre: {
            default: null,
            type: cc.Label,
        },
        //获取声望滚动界面
        gainView: {
            default: null,
            type: cc.Node,
        },
        //滚动体
        gainContent: {
            default: null,
            type: cc.Node,
        },
        //获取声望预制件
        gainItem: {
            default: null,
            type: cc.Node,
        },
        //获取声望UI存储列表
        gainList: {
            default: [],
            visible: false,
        },
        //使用声望滚动界面
        useView: {
            default: null,
            type: cc.Node,
        },
        //滚动体
        useContent: {
            default: null,
            type: cc.Node,
        },
        //使用声望预制件
        useItem: {
            default: null,
            type: cc.Node,
        },
        //使用声望UI存储列表
        useList: {
            default: [],
            visible: false,
        },
        //类型滚动界面
        selectView: {
            default: null,
            type: cc.ScrollView,
        },
        //滚动体
        selectContent: {
            default: null,
            type: cc.Node,
        },
        //预制件
        selectItem: {
            default: null,
            type: cc.Node,
        },
        //选项UI存储列表
        selectList: {
            default: [],
            visible: false,
        },
        //信息存储列表
        selectInfo: {
            default: {},
            visible: false,
        },
        prestigeInited: {
            default: false,
            visible: false,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        window.prestigeScript = this;
    },


    onEnable() {
        this.loadInfo(); this.refreashVal();
        this.schedule(this.refreashVal, 0.5);
    },
    onDisable() {
        this.unschedule(this.refreashVal);
    },

    start() {
        prestigeScript.initView();
    },

    //按钮点击事件
    menuClick(event, type) {
        soundManager.playSound("btnClick");
        if (type == "select") {
            this.initList(event.node.idx);
        } else if (type == "gain") {
            var idx = event.node.idx;
            var cost = this.selectInfo[0].infoList[idx].cost;
            var mType = this.selectInfo[0].infoList[idx].mType;
            var pristige = this.selectInfo[0].infoList[idx].pristige;
            var curTime = gameApplication.getCurTime();
            if (player.itemArrayGet("pCurrency", mType) >= cost) {
                if (mType == 0) {
                    var endTime = player.itemArrayGet("gainPre", 0);
                    //判断是否冷却
                    if (endTime < curTime || endTime == 0 || endTime == null || endTime == undefined) {
                        curTime = curTime + this.selectInfo[0].infoList[idx].cdTime;
                        //设置冷却时间
                        player.itemArraySet("gainPre", 0, curTime);
                    } else {
                        return;
                    }
                }
                player.itemArrayAdd("pCurrency", mType, -cost, function () {
                    player.itemArrayAdd("pCurrency", 3, pristige);
                }.bind(this))
            }
        } else if (type == "use") {
            var idx = event.node.idx;
            var cost = this.selectInfo[1].infoList[idx].cost;
            var curTime = gameApplication.getCurTime();
            if (player.itemArrayGet("pCurrency", 3) >= cost) {
                //判断冷却
                if (this.checkCDTime(idx)) {
                    player.itemArrayAdd("pCurrency", 3, -cost, function () {
                        //设置技能使用时间
                        var curTime = gameApplication.getCurTime();
                        player.itemArraySet("preSkill", idx, curTime);
                    }.bind(this))
                }
            }
        }
    },


    //加载个人信息-
    loadInfo() {
        //读取头像
        player.getAvatar(function (spriteFrame) {
            if (null != spriteFrame) {
                this.preHead.spriteFrame = spriteFrame;
            }
        }.bind(this))
        //名字
        this.preName.string = player.getName();
    },

    //刷新数据
    refreashVal() {
        if (!this.prestigeInited) {
            return;
        }
        //声望值
        this.preVal.string = player.itemArrayGet("pCurrency", 3);
        //累计声望值
        this.allPre.string = player.itemArrayGet("pScore", 6);

        var length = Math.max(this.gainList.length, this.useList.length);
        var curTime = gameApplication.getCurTime();
        for (var idx = 0; idx < length; idx = idx + 1) {
            if (idx < this.gainList.length) {
                if (idx == 0) {
                    var endTime = player.itemArrayGet("gainPre", 0);
                    if (endTime != 0) {
                        endTime = endTime - curTime;
                    }
                    this.gainList[idx].cdTime.string = gameApplication.countTime(endTime)[0]
                    if (this.gainList[idx].cdTime.string == "00:00") {
                        this.gainList[idx].cdTime.node.active = false;
                    } else {
                        this.gainList[idx].cdTime.node.active = true;
                    }
                }else{
                    this.gainList[idx].cdTime.node.active = false;
                }
                var cost = this.selectInfo[0].infoList[idx].cost;
                var mType = this.selectInfo[0].infoList[idx].mType;
                if (player.itemArrayGet("pCurrency", mType) >= cost && !this.gainList[idx].cdTime.node.active) {
                    this.gainList[idx].gainBtn.interactable = true;
                } else {
                    this.gainList[idx].gainBtn.interactable = false;
                }
            }
            if (idx < this.useList.length) {
                var useTime = player.itemArrayGet("preSkill", idx);
                var cdTime = this.selectInfo[1].infoList[idx].cdTime;
                var endTime =  (useTime + cdTime) - curTime;
                if (useTime == 0) {
                    endTime = 0;
                }
                this.useList[idx].cdTime.string = gameApplication.countTime(endTime)[0];
                if (this.useList[idx].cdTime.string == "00:00") {
                    this.useList[idx].cdTime.node.active = false;
                } else {
                    this.useList[idx].cdTime.node.active = true;
                }
                var cost = this.selectInfo[1].infoList[idx].cost;
                if (player.itemArrayGet("pCurrency", 3) >= cost && !this.useList[idx].cdTime.node.active) {
                    this.useList[idx].useBtn.interactable = true;
                } else {
                    this.useList[idx].useBtn.interactable = false;
                }
            }
        }
    },

    //刷新商品
    initView() {
        resManager.loadConfig("ResourceList", function (cof) {
            this.selectInfo = cof.prestigeList.typeList;
            for (var i = 0; i < this.selectInfo.length; i = i + 1) {
                this.initSelectList(i);
            }
            this.initList(0);
        }.bind(this));
    },

    //初始化类别选择列表
    initSelectList(idx) {
        var typeInfo = this.selectInfo[idx]; 
        var curItem = this.selectList[idx];
        if (curItem == null) {
            curItem = cc.instantiate(this.selectItem);
            this.selectList[idx] = curItem;
        }
        //绑定点击事件
        curItem.on("toggle", function (event) {
            this.menuClick(event, "select");
        }.bind(this), this)

        //初始化类型名称
        var name1 = cc.find("checkmark/Name", curItem).getComponent("LocalizedLabel");
        var name2 = cc.find("Background/Name", curItem).getComponent("LocalizedLabel");
        name1.dataID = this.selectInfo[0].type;
        name2.dataID = this.selectInfo[1].type;

        //放入列表并显示
        curItem.parent = this.selectContent;
        curItem.idx = idx;
        curItem.active = true;
    },

    //初始化商品列表
    initList(idx) {
        //获取列表信息并加载
        var infoList = this.selectInfo[idx].infoList;
        var curView;
        if (idx == 0) {
            curView = this.gainView;
        } else if (idx == 1) {
            curView = this.useView;
        }
        this.useView.active = false;
        this.gainView.active = false;
        for (var i = 0; i < infoList.length; i = i + 1) {
            if (idx == 0) {
                this.loadGainItem(i);
            } else if (idx == 1) {
                this.loadUseItem(i);
            }
        }
        curView.active = true;
        this.selectList[idx].getComponent(cc.Toggle).check();
        this.prestigeInited = true;
    },

    //初始化商品信息
    loadGainItem(idx) {
        var info = this.selectInfo[0].infoList[idx];
        if (this.gainList[idx] == null) {
            this.gainList[idx] = {};
        }
        var curItem = this.gainList[idx].curItem;
        if (curItem == null) {
            curItem = cc.instantiate(this.gainItem);
            this.gainList[idx].curItem = curItem;
            this.gainList[idx].name = cc.find("Name/Text", curItem).getComponent("LocalizedLabel");
            this.gainList[idx].desc = cc.find("Description/Text", curItem).getComponent("LocalizedLabel");
            this.gainList[idx].gainBtn = cc.find("Get", curItem).getComponent(cc.Button);
            this.gainList[idx].price = cc.find("Get/Text", curItem).getComponent(cc.Label);
            this.gainList[idx].sprite = cc.find("Get/Sprite", curItem).getComponent(cc.Sprite);
            this.gainList[idx].cdTime = cc.find("CdTime/Text", curItem).getComponent(cc.Label);
        }
        var name = this.gainList[idx].name
        var desc = this.gainList[idx].desc;
        var gainBtn = this.gainList[idx].gainBtn;
        var price = this.gainList[idx].price;
        var sprite = this.gainList[idx].sprite;

        //名字
        name.dataID = info.name;

        //商品描述
        desc.dataID = info.desc;

        //记录第几个按钮
        gainBtn.node.idx = idx;
        //购买按钮初始化
        gainBtn.node.off("click");
        gainBtn.node.on("click", function (event) {
            gameApplication.soundManager.playSound("btnClick");
            this.menuClick(event, "gain");
        }.bind(this), this)

        //价格
        price.string = gameApplication.countUnit(info.cost)[2];

        //读取图片信息
        resManager.loadSprite(info.pic, function (spriteFrame) {
            sprite.spriteFrame = spriteFrame;
        }.bind(this));

        curItem.active = true;
        curItem.parent = this.gainContent;
    },

    //初始化商品信息
    loadUseItem(idx) {
        var info = this.selectInfo[1].infoList[idx];
        if (this.useList[idx] == null) {
            this.useList[idx] = {};
        }
        var curItem = this.useList[idx].curItem;
        if (curItem == null) {
            curItem = cc.instantiate(this.useItem);
            this.useList[idx].curItem = curItem;
            this.useList[idx].showSprite = cc.find("Sprite", curItem).getComponent(cc.Sprite);
            this.useList[idx].name = cc.find("Name/Text", curItem).getComponent("LocalizedLabel");
            this.useList[idx].desc = cc.find("Description/Text", curItem).getComponent("LocalizedLabel");
            this.useList[idx].useBtn = cc.find("Use", curItem).getComponent(cc.Button);
            this.useList[idx].price = cc.find("Use/Text", curItem).getComponent(cc.Label);
            this.useList[idx].cdTime = cc.find("CdTime/Text", curItem).getComponent(cc.Label);
        }
        var showSprite = this.useList[idx].showSprite
        var name = this.useList[idx].name;
        var desc = this.useList[idx].desc;
        var useBtn = this.useList[idx].useBtn;
        var price = this.useList[idx].price;

        //读取图片信息
        resManager.loadSprite(info.pic, function (spriteFrame) {
            showSprite.spriteFrame = spriteFrame;
        }.bind(this));

        //名字
        name.dataID = info.name;

        //商品描述
        desc.dataID = info.desc;

        //记录第几个按钮
        useBtn.node.idx = idx;
        //购买按钮初始化
        useBtn.node.off("click");
        useBtn.node.on("click", function (event) {
            gameApplication.soundManager.playSound("btnClick");
            this.menuClick(event, "use");
        }.bind(this), this)

        //价格
        price.string = info.cost;

        curItem.parent = this.useContent;
        curItem.active = true;
    },

    //判断是否技能还在使用
    checkEndTime(idx) {
        var result = false;
        var useTime = player.itemArrayGet("preSkill", idx);
        var duringTime = this.selectInfo[1].infoList[idx].time;
        var curTime = gameApplication.getCurTime();
        if (useTime == 0 || (useTime + duringTime) < curTime) {
            result = true;
        } else {
            result = false;
        }
        return result;
    },

    //判断是否技能冷却下来
    checkCDTime(idx) {
        var result = false;
        var useTime = player.itemArrayGet("preSkill", idx);
        var cdTime = this.selectInfo[1].infoList[idx].cdTime;
        var curTime = gameApplication.getCurTime();

        if (useTime == 0 || (useTime + cdTime) < curTime) {
            result = true;
        } else {
            result = false;
        }
        return result;
    },

    // update (dt) {},
});
