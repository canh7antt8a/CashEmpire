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
        //储存UI的组件的列表
        workerItemList: {
            default: [],
            visible: false,
        },
        content: {
            default: null,
            type: cc.Node,
        },
        //预制件
        workerItem: {
            default: null,
            type: cc.Node,
        },
        //是否加载过
        isInited: {
            default: false,
            visible: false,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        window.workerScript = this;
    },

    onEnable() {
        this.schedule(this.refreashVal, 0.5);
    },

    onDisable() {
        this.unschedule(this.refreashVal);
    },

    //刷新数据
    refreashVal() {
        if (!this.isInited) {
            return;
        }
        var isMark = 0;
        for (var i = 0; i < 10; i = i + 1) {
            //if (mainScript.floorInfoList[i] != null && mainScript.floorInfoList[i] != "undefined" && mainScript.floorInfoList[i] != undefined) {
            var managerInfo = managerScript.managerInfoList[i];
            if (this.workerItemList[i] != null) {
                //判断是否拥有管家
                if (managerInfo != null && managerInfo != undefined && managerInfo != "undefined") {
                    //刷新管家的收益描述
                    this.workerItemList[i].mName.string = managerScript.managerInfoList[i][2] + " LV." + managerScript.judgeLevel(managerScript.managerInfoList[i]);
                    this.workerItemList[i].power.string = mainScript.storeInfoList[i].name + " profit X" + (1 + managerScript.judgeLevel(managerInfo) * 0.1);
                    this.workerItemList[i].trainBtn.interactable = true;
                    this.workerItemList[i].mark.active = false;

                    //判断能否升级该楼层管家
                    var canUpgrade = false;
                    var maxLevel = 9;
                    for (var j = 0; j < 3; j = j + 1) {
                        if (managerScript.managerInfoList[i][5 + j] < maxLevel) {
                            var cost = this.countCost(5 + j, i);
                            if (cost <= player.itemArrayGet("pCurrency", 0)) {
                                //可以升级管家
                                canUpgrade = true;
                            }
                        }
                    }
                    if (canUpgrade) {
                        mainScript.floorList[i].mTips.active = true;
                    } else {
                        mainScript.floorList[i].mTips.active = false;
                    }
                } else {
                    //是否可以购买管家
                    if (player.itemArrayGet("pCurrency", 0) < managerScript.priceList[i]) {
                        this.workerItemList[i].trainBtn.interactable = false;
                        this.workerItemList[i].mark.active = false;
                    } else {
                        this.workerItemList[i].trainBtn.interactable = true;
                        this.workerItemList[i].mark.active = true;
                        isMark++;
                    }
                }
            }
            //}
        }
        if (isMark > 0) {
            mainScript.managerMark.active = true;
        } else {
            mainScript.managerMark.active = false;
        }
    },

    start() { },

    //加载界面数据
    initView(cb) {
        for (var i = 0; i < 10/* mainScript.floorInfoList.length */; i = i + 1) {
            //if (mainScript.floorInfoList[i] != null && mainScript.floorInfoList[i] != "undefined" && mainScript.floorInfoList[i] != undefined) {
            this.loadWorkerItem(i);
            //}
        }
        this.isInited = true;

        if (cb != null) {
            cb();
        }
    },

    //加载第IDX个管家
    loadWorkerItem(idx) {
        //缓存的数组获取，否则创建
        var curItem = this.workerItemList[idx];
        if (curItem == null) {
            curItem = cc.instantiate(this.workerItem);
            this.workerItemList[idx] = curItem;
            curItem.name = "Worker" + idx;
            //管家头像
            this.workerItemList[idx].head = cc.find("Head", curItem).getComponent(cc.Sprite);

            //管家姓名
            this.workerItemList[idx].mName = cc.find("Name", curItem).getComponent(cc.Label);

            //管家能力
            this.workerItemList[idx].power = cc.find("Power/Val", curItem).getComponent(cc.Label);

            //培训按钮
            this.workerItemList[idx].trainBtn = cc.find("Train", curItem).getComponent(cc.Button);
            this.workerItemList[idx].trainBtnText = cc.find("Train/Val", curItem).getComponent("LocalizedLabel");
            this.workerItemList[idx].mark = cc.find("Train/Mark", curItem);
        }
        var head = this.workerItemList[idx].head;
        var mName = this.workerItemList[idx].mName;
        var power = this.workerItemList[idx].power;
        var trainBtn = this.workerItemList[idx].trainBtn;
        var trainBtnText = this.workerItemList[idx].trainBtnText;

        var managerInfo = managerScript.managerInfoList[idx];
        if (managerInfo != null && managerInfo != undefined && managerInfo != "undefined") {
            //设置管家头像
            var pic = managerScript.managerCof[idx].pic;
            if (player.worldId == 0 || player.worldId == 1 || player.worldId == 2) {
                if (idx == 0 || idx == 2 || idx == 4) {
                    pic = pic + "-" + player.worldId;
                }
            }
            resManager.loadSprite(pic, function (spriteFrame) {
                head.spriteFrame = spriteFrame;
            }.bind(this));

            mName.string = managerInfo[2] + " LV." + managerScript.judgeLevel(managerInfo);
            power.string = mainScript.storeInfoList[idx].name + " profit X" + (1 + managerScript.judgeLevel(managerInfo) * 0.1);
            trainBtnText.dataID = "lang.managerTrain";


            trainBtn.node.off('click');
            trainBtn.node.on('click', function (event) {
                gameApplication.soundManager.playSound("btnClick");
                managerScript.trainManager(idx);
            }.bind(this), this)
        } else {
            //设置管家头像
            var pic = managerScript.managerCof[idx].pic;
            if (player.worldId == 0 || player.worldId == 1 || player.worldId == 2) {
                if (idx == 0 || idx == 2 || idx == 4) {
                    pic = pic + "-" + player.worldId;
                }
            }
            resManager.loadSprite(pic, function (spriteFrame) {
                head.spriteFrame = spriteFrame;
            }.bind(this));

            mName.string = "????? LV.X";
            power.string = mainScript.storeInfoList[idx].name + " ???\n???";
            trainBtnText.dataID = gameApplication.countUnit(managerScript.priceList[idx])[2];

            trainBtn.node.off('click');
            trainBtn.node.on('click', function (event) {
                gameApplication.soundManager.playSound("btnClick");
                managerScript.eventDeal({ idx: idx }, "getManager");
            }.bind(this), this)
        }

        curItem.parent = this.content;
        curItem.active = true;
    },


    //计算训练价格
    countCost(type, idx) {
        var manager = managerScript.managerInfoList[idx];
        if (manager[type] == 0 && idx == 0) {
            return 10;
        }
        return 10 * Math.pow(10, Math.floor(manager[type]) * 3);
    },

    // update (dt) {},
});
