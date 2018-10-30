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
        head: {
            default: null,
            type: cc.Sprite,
        },
        mName: {
            default: null,
            type: cc.Label,
        },
        mLevel: {
            default: null,
            type: cc.Label,
        },
        desc: {
            default: null,
            type: cc.Label,
        },
        sPic: {
            default: null,
            type: cc.Sprite,
        },
        sCd: {
            default: null,
            type: cc.Label,
        },
        sDesc: {
            default: null,
            type: cc.Label,
        },
        prosList: {
            default: [],
            type: [cc.ProgressBar],
        },
        levelList: {
            default: [],
            type: [cc.Label],
        },
        trainBtnList: {
            default: [],
            type: [cc.Button],
        },
        trainCostList: {
            default: [],
            type: [cc.Label],
        },
        curManagerIdx: {
            default: null,
            visible: false,
        },
        curInfo: {
            default: null,
            visible: false,
        },
        isDataInit: {
            default: false,
            visible: false,
        },
        maxLevel: {
            default: 99,
            visible: false,
        },
        isTrain: {
            default: false,
            visible: false,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    onEnable() {
        this.schedule(this.refreashData, 0.25);
    },
    onDisable() {
        this.unschedule(this.refreashData);
    },

    start() { },

    loadInfo(idx) {
        this.curManagerIdx = idx;
        this.curInfo = managerScript.managerInfoList[idx];

        resManager.loadSprite(this.curInfo[3], function (spriteFrame) {
            this.head.spriteFrame = spriteFrame;
        }.bind(this));

        this.mName.string = this.curInfo[2];

        this.desc.getComponent("LocalizedLabel").dataID = managerScript.managerCof[this.curInfo[1]][this.curInfo[10]].desc;

        this.sDesc.getComponent("LocalizedLabel").dataID = managerScript.managerCof[this.curInfo[1]][this.curInfo[10]].sDesc;

        for (var i = 0; i < 3; i = i + 1) {
            this.prosList[i].totalLength = this.prosList[i].node.width - 10.5;
        }

        this.refreashData()
        this.isDataInit = true;
    },

    refreashData() {
        if (!this.isDataInit) {
            return;
        }
        this.mLevel.string = "LV." + managerScript.judgeLevel(this.curInfo);

        this.sCd.string = managerScript.countSkillCd(this.curInfo[9]);

        for (var i = 0; i < 3; i = i + 1) {
            this.prosList[i].progress = this.curInfo[5 + i] / this.maxLevel;

            this.levelList[i].string = "LV." + (this.curInfo[5 + i] + 1);

            if (this.curInfo[5 + i] < this.maxLevel) {
                this.initTrainBtn(i);
                var cost = this.countCost(5 + i);
                this.trainCostList[i].string = gameApplication.countUnit(cost)[2];
                if (cost > player.itemArrayGet("pCurrency", 0)) {
                    this.trainBtnList[i].interactable = false;
                } else {
                    this.trainBtnList[i].interactable = true;
                }
            } else {
                this.trainBtnList[i].interactable = false;
                this.trainCostList[i].string = "MAX";
            }
        }
    },

    //初始化训练按钮
    initTrainBtn(idx) {
        this.trainBtnList[idx].node.off('click');
        this.trainBtnList[idx].node.on('click', function (event) {
            gameApplication.soundManager.playSound("btnClick");
            this.trainSkill(idx + 5);
        }.bind(this), this)
    },

    trainSkill(type) {
        if (this.isTrain) {
            return;
        }
        this.isTrain = true;
        var cost = this.countCost(type);
        if (cost < player.itemArrayGet("pCurrency", 0) && this.curInfo[type] < this.maxLevel) {
            player.itemArrayAdd("pCurrency", 0, -cost, function () {
                this.curInfo[type] = this.curInfo[type] + 1;
                managerScript.managerInfoList[this.curManagerIdx] = this.curInfo;
                player.itemArraySet("myManagers", this.curManagerIdx, this.curInfo, function () {
                    this.isTrain = false;
                    managerScript.initManagerList();
                }.bind(this));
            }.bind(this));
        } else {
            this.isTrain = false;
        }
    },

    //计算训练价格
    countCost(type) {
        return 1000 * Math.pow(10, Math.floor(this.curInfo[type] / 3));
    },

    // update (dt) {},
});
