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
        //星球
        earth: {
            default: null,
            type: cc.PageView,
        },
        earthContent: {
            default: null,
            type: cc.Node,
        },
        //大楼外观的组件
        buildingItem: {
            default: null,
            type: cc.Node,
        },
        //大楼外观的组件
        getInBtn: {
            default: null,
            type: cc.Node,
        },
        //大楼外观的组件
        getInText: {
            default: null,
            type: cc.Node,
        },
        buildingUIList: {
            default: [],
            visible: false,
        },
        unlockList: {
            default: [],
            visible: false,
        },
        unlockTimeList: {
            default: [],
            visible: false,
        },
        unlockCost: {
            default: null,
            visible: false,
        },
        //点击遮罩
        buildingMask: {
            default: null,
            type: cc.Node,
        },
        //当前世界Id
        curId: {
            default: 0,
            visible: false,
        },
        //箭头
        arrow: {
            default: [],
            type: [cc.Node],
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        window.worldScript = this;
        this.unlockList = [];
        this.unlockTimeList = [];
    },

    onEnable() {
        this.schedule(this.refreashVal, 1);
        this.scheduleOnce(function () {
            this.getInText.getComponent("LocalizedLabel").dataID = "lang.selectWorld";
        }.bind(this), 1)
    },
    onDisable() {
        this.unschedule(this.refreashVal);
    },

    start() {
    },

    //手动点击移动页面
    movePage(event, type) {
        if (type == "0") {
            if (this.curId > 0) {
                this.earth.scrollToPage(this.curId - 1);
                this.worldIdChange();
            }
        } else if (type == "1") {
            if (this.curId < 4) {
                this.earth.scrollToPage(this.curId + 1);
                this.worldIdChange();
            }
        }
    },

    //移动
    worldIdChange() {
        this.getInBtn.active = false;
        var idx = this.earth._curPageIdx;
        this.curId = idx;
        /* var start = cc.winSize.width * -0.5;
        var moveVal = (gameApplication.gameBg.node.width - cc.winSize.width) / 4;
        var final = start - (moveVal * idx);
        gameApplication.gameBg.node.stopAllActions();
        gameApplication.gameBg.node.runAction(cc.moveTo(0.2, cc.v2(final, gameApplication.gameBg.node.y))); */
        if (this.curId == 0) {
            this.arrow[0].active = false;
            this.arrow[1].active = true;
        } else if (this.curId == 4) {
            this.arrow[0].active = true;
            this.arrow[1].active = false;
        } else {
            this.arrow[0].active = true;
            this.arrow[1].active = true;
        }
    },

    refreashVal() {
        for (var i = 0; i < 5; i = i + 1) {
            if (this.buildingUIList[i] != null && this.buildingUIList[i] != undefined) {
                //是否解锁中的
                if (this.buildingUIList[i].unLocking.active) {
                    if (this.curId == i) {
                        this.getInBtn.active = false;
                    }
                    var finishTime = this.buildingUIList[i].finishTime;
                    var now = gameApplication.getCurTime();
                    //console.log(now,this.unlockTimeList[i],this.unlockTimeList[i] <= now)
                    //判断是否解锁
                    if (this.unlockTimeList[i] <= now) {
                        this.loadBuilding(i);
                    } else {
                        finishTime.string = gameApplication.countTime(this.unlockTimeList[i] - now)[0];
                    }
                } else if (this.buildingUIList[i].goUnlock.active) {
                    if (this.curId == i) {
                        this.getInBtn.active = false;
                    }

                    //计算解锁所需要的声望
                    /* var unlockPrestigeNum = this.countUnlockPrestige(i)
                    this.buildingUIList[i].unlockPrestige.string = gameApplication.countUnit(unlockPrestigeNum)[3]; */
                    //计算解锁所需要的钱
                    var unlockMoneyNum = this.countUnlockMoney(i);
                    this.buildingUIList[i].unlockMoney.string = gameApplication.countUnit(unlockMoneyNum)[2];
                    if (player.itemArrayGet("pCurrency", 0) >= unlockMoneyNum /* && player.itemArrayGet("pCurrency", 3) >= unlockPrestigeNum */) {// 添加声望限制
                        this.buildingUIList[i].unlockBtn.getComponent(cc.Button).interactable = true;
                    } else {
                        this.buildingUIList[i].unlockBtn.getComponent(cc.Button).interactable = false;
                    }
                } else {
                    if (this.curId == i) {
                        this.getInBtn.active = true;
                    }
                }
            }
        }
    },

    initBuilding() {
        this.checkRes(function () {
            //读取玩家的商品技能列表
            for (var i = 0; i < 5; i = i + 1) {
                this.loadBuilding(i);
            }
        }.bind(this))
    },


    //加载大楼按钮
    loadBuilding(idx) {
        this.unlockList[idx] = player.itemArrayGet("pBuilding", idx);
        this.unlockTimeList[idx] = player.itemArrayGet("buildingUnlockTime", idx);
        if (this.buildingUIList[idx] == null || this.buildingUIList[idx] == undefined) {
            this.buildingUIList[idx] = {};
            this.buildingUIList[idx].building = cc.instantiate(this.buildingItem);
            this.buildingUIList[idx].building.name = "building" + idx;
            //主体结构
            this.buildingUIList[idx].bName = cc.find("Name", this.buildingUIList[idx].building).getComponent("LocalizedLabel");
            this.buildingUIList[idx].top = cc.find("Top", this.buildingUIList[idx].building).getComponent(cc.Sprite);
            this.buildingUIList[idx].floor = cc.find("Floor", this.buildingUIList[idx].building).getComponent(cc.Sprite);
            this.buildingUIList[idx].content = cc.find("Floor/Content", this.buildingUIList[idx].building).getComponent(cc.Sprite);
            this.buildingUIList[idx].main = cc.find("Main", this.buildingUIList[idx].building).getComponent(cc.Sprite);
            //阴影
            this.buildingUIList[idx].shadow = cc.find("Shadow", this.buildingUIList[idx].building);
            this.buildingUIList[idx].topShadow = cc.find("Shadow/Top", this.buildingUIList[idx].building).getComponent(cc.Sprite);
            this.buildingUIList[idx].floorShadow = cc.find("Shadow/Floor", this.buildingUIList[idx].building).getComponent(cc.Sprite);
            this.buildingUIList[idx].mainShadow = cc.find("Shadow/Main", this.buildingUIList[idx].building).getComponent(cc.Sprite);

            //未解锁
            this.buildingUIList[idx].goUnlock = cc.find("Shadow/GoUnlock", this.buildingUIList[idx].building);
            this.buildingUIList[idx].unlockBtn = cc.find("Shadow/GoUnlock/Unlock", this.buildingUIList[idx].building);
            this.buildingUIList[idx].unlockMoney = cc.find("Shadow/GoUnlock/Unlock/Money", this.buildingUIList[idx].building).getComponent(cc.Label);
            this.buildingUIList[idx].unlockPrestige = cc.find("Shadow/GoUnlock/Unlock/Prestige/Num", this.buildingUIList[idx].building).getComponent(cc.Label);

            //解锁中
            this.buildingUIList[idx].unLocking = cc.find("Shadow/Unlocking", this.buildingUIList[idx].building);
            this.buildingUIList[idx].finishTime = cc.find("Shadow/Unlocking/UnlockTime/Text", this.buildingUIList[idx].building).getComponent(cc.Label);
            this.buildingUIList[idx].diamondFinish = cc.find("Shadow/Unlocking/DiamondFast", this.buildingUIList[idx].building);
            this.buildingUIList[idx].videoFinish = cc.find("Shadow/Unlocking/VideoFast", this.buildingUIList[idx].building);
        }

        var building = this.buildingUIList[idx].building
        var bName = this.buildingUIList[idx].bName;
        //主体
        var top = this.buildingUIList[idx].top
        var floor = this.buildingUIList[idx].floor
        var content = this.buildingUIList[idx].content
        var main = this.buildingUIList[idx].main
        //阴影
        var shadow = this.buildingUIList[idx].shadow;
        var topShadow = this.buildingUIList[idx].topShadow;
        var floorShadow = this.buildingUIList[idx].floorShadow;
        var mainShadow = this.buildingUIList[idx].mainShadow;

        bName.dataID = "lang.countryName" + idx;

        resManager.loadSprite("UIBuilding.buildingTop" + idx, function (spriteFrame) {
            top.spriteFrame = spriteFrame;
            topShadow.spriteFrame = spriteFrame;
        }.bind(this))
        resManager.loadSprite("UIBuilding.buildingFloorBg" + idx, function (spriteFrame) {
            floor.spriteFrame = spriteFrame;
            floorShadow.spriteFrame = spriteFrame;
        }.bind(this))
        resManager.loadSprite("UIBuilding1.buildContent" + idx, function (spriteFrame) {
            content.spriteFrame = spriteFrame;
        }.bind(this))
        resManager.loadSprite("UIBuilding.zeroSprite" + idx, function (spriteFrame) {
            main.spriteFrame = spriteFrame;
            mainShadow.spriteFrame = spriteFrame;
        }.bind(this))

        var goUnlock = this.buildingUIList[idx].goUnlock;
        var unlockBtn = this.buildingUIList[idx].unlockBtn;
        var unlockMoney = this.buildingUIList[idx].unlockMoney;
        var unlockPrestige = this.buildingUIList[idx].unlockPrestige
        var unLocking = this.buildingUIList[idx].unLocking;
        var diamondFinish = this.buildingUIList[idx].diamondFinish;
        var videoFinish = this.buildingUIList[idx].videoFinish;

        unlockPrestige.node.active = false;

        //判断是否解锁
        if (this.unlockList[idx] == 1) {
            //已解锁完成
            if (this.unlockTimeList[idx] <= gameApplication.getCurTime()) {
                shadow.active = false;
                unLocking.active = false;
                goUnlock.active = false;
            } else {
                unLocking.active = true;
                goUnlock.active = false;
                var diamondNeed = 200;
                //绑定钻石加速按钮
                diamondFinish.off("click")
                diamondFinish.on("click", function () {
                    this.checkRes(function () {
                        if (player.itemArrayGet("pCurrency", 1) >= diamondNeed) {
                            //扣200钻石
                            player.itemArrayAdd("pCurrency", 1, -diamondNeed, function () {
                                //直接解锁大楼
                                player.itemArraySet("buildingUnlockTime", idx, 0, function () {
                                    //重新加载该大楼配置
                                    this.loadBuilding(idx);
                                }.bind(this));
                            }.bind(this))
                        }else{
                            console.log(1)
                            gameApplication.popBuyDiamond();
                        }
                    }.bind(this))
                }.bind(this), this);

                //绑定钻石加速按钮
                videoFinish.off("click")
                videoFinish.on("click", function () {
                    this.checkRes(function () {
                        //看视频
                        gameApplication.onVideoBtnClick(function (isOk) {
                            if (isOk) {
                                gameApplication.DataAnalytics.doEvent("fastBuildingVideo");
                                //解锁时间加快一小时（解锁时间提前一个小时）
                                this.unlockTimeList[idx] = this.unlockTimeList[idx] - 3600;
                                player.itemArraySet("buildingUnlockTime", idx, this.unlockTimeList[idx], function () {
                                    //重新加载该大楼配置
                                    this.loadBuilding(idx);
                                }.bind(this));
                            }
                        }.bind(this), 0)
                    }.bind(this))
                }.bind(this), this)
            }
            //处理地图红点显示
            var unlockNum = 0;
            if (idx >= 4) {
                unlockNum = -1;
            } else {
                unlockNum = this.countUnlockMoney(idx + 1);
            }
            cc.sys.localStorage.setItem("unlockWorld", unlockNum);
        } else {
            shadow.active = true;
            unLocking.active = false;
            goUnlock.active = true;
            /* //计算解锁所需要的声望
            var unlockPrestigeNum = this.countUnlockPrestige(idx)
            unlockPrestige.string = gameApplication.countUnit(unlockPrestigeNum)[3]; */
            //计算解锁所需要的钱
            var unlockMoneyNum = this.countUnlockMoney(idx);
            unlockMoney.string = gameApplication.countUnit(unlockMoneyNum)[2];
            //绑定解锁按钮
            unlockBtn.off("click")
            unlockBtn.on("click", function () {
                this.checkRes(function () {
                    if (player.itemArrayGet("pCurrency", 0) >= unlockMoneyNum/* && player.itemArrayGet("pCurrency", 3) >= unlockPrestigeNum */) {// 添加声望限制
                        //扣钱
                        player.itemArrayAdd("pCurrency", 0, -unlockMoneyNum, function () {
                            //解锁
                            player.itemArraySet("pBuilding", idx, 1, function () {
                                //解锁时间设置
                                var time = this.countUnlockTime(idx);
                                player.itemArraySet("buildingUnlockTime", idx, time, function () {
                                    //重新加载该大楼配置
                                    this.loadBuilding(idx);
                                }.bind(this));
                            }.bind(this));
                        }.bind(this))
                    }
                }.bind(this))
            }.bind(this), this)
        }

        building.active = true;
        this.earth.addPage(building);
        /* building.off("click")
        building.on("click", function () {
            this.buildingMask.active = true;
            this.checkRes(function () {
                this.selectWorld(idx);
            }.bind(this))
        }.bind(this), this) */
    },

    //进入游戏
    comeWorld() {
        this.buildingMask.active = true;
        this.checkRes(function () {
            this.selectWorld(this.curId);
        }.bind(this))
    },

    //回到世界
    backWorld() {
        this.buildingMask.active = true;
        this.checkRes(function () {
            this.selectWorld(player.worldId);
        }.bind(this))
    },

    //选择世界
    selectWorld(id) {
        //设置世界Id
        player.worldId = id;
        //显示加载界面
        cc.find("Canvas/LoadingView").active = true;
        this.buildingMask.active = false;
        loadView.goLoading();
        var isReload = null;

        if (loadView.isLoad) {
            isReload = true;
        }
        SDK().getItem("isFirst-W" + player.worldId, function (val) {
            if (val == 0 || val == null) {
                player.firstData(function () {
                    this.goBuilding(isReload);
                    var param = {};
                    param["isFirst-W" + player.worldId] = 1;
                    SDK().setItem(param);
                }.bind(this));
            } else {
                this.goBuilding(isReload);
            }
        }.bind(this))
        this.node.active = false;
    },

    //判断是否初始化了用户数据
    checkRes(cb) {
        this.scheduleOnce(function () {
            if (player.isLoadRes) {
                if (cb != null) {
                    cb();
                }
            } else {
                this.checkRes(cb);
            }
        }.bind(this), 0.5);
    },

    //进入大楼界面
    goBuilding(isReload) {
        //如果是第二次加载则在数据加载完之后进入
        player.initInfo(isReload,
            function () {
                loadView.goMain();
            }.bind(this)
        );
    },

    //计算解锁所需要的金钱
    countUnlockMoney(idx) {
        var money = 0;
        if (idx == 1) {
            money = 1000000000;
        } else if (idx == 2) {
            money = 100000000000000;
        } else if (idx == 3) {
            money = 100000000000000000;
        } else if (idx == 4) {
            money = 100000000000000000000;
        }
        return money;
    },

    //计算解锁所需声望
    countUnlockPrestige(idx) {
        var prestige = 0;
        if (idx == 1) {
            prestige = 500;
        } else if (idx == 2) {
            prestige = 1500;
        } else if (idx == 3) {
            prestige = 5000;
        } else if (idx == 4) {
            prestige = 8000;
        }
        return prestige;
    },

    //计算解锁时间
    countUnlockTime(idx) {
        var time = gameApplication.getCurTime();
        time = time + (1 + (idx - 1) * 2) * 3600;
        return time;
    },

    // update (dt) {},
});
