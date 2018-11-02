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
        //成就描述
        achieveDesc: {
            default: null,
            visible: false,
        },
        //成就进度
        achievePro: {
            default: null,
            visible: false,
        },
        //奖励数量
        reward: {
            default: null,
            visible: false,
        },
        //成就奖励数量
        rewardNum: {
            default: null,
            visible: false,
        },
        //成就配置存储列表
        achieveInfoList: {
            default: [],
            visible: false,
        },
        //成就完成情况
        achieveFinishPro: {
            default: 0,
            visible: false,
        },
    },

    onLoad() {
        this.achieveDesc = cc.find("Desc", this.node).getComponent("LocalizedLabel");
        this.achievePro = cc.find("Desc/Num", this.node).getComponent(cc.Label);
        this.reward = cc.find("Sprite", this.node);
        this.rewardNum = cc.find("Num", this.node).getComponent(cc.Label);
        resManager.loadConfig("AchieveList", function (cof) {
            //成就的信息
            this.achieveInfoList = cof.achieveList;
            this.initView();
        }.bind(this));
    },

    onEnable() {
        this.schedule(this.refreashVal, 2);
    },
    onDisable() {
        this.unschedule(this.refreashVal);
    },
    //刷新日期
    initView(cb) {
        if (cb != null) {
            cb();
        }
    },

    //刷新数据
    refreashVal() {
        this.checkProsVal();
    },

    //处理成就
    checkProsVal() {
        var lv = player.itemArrayGet("pAchievement", 6);
        if (lv >= 39) {
            this.node.active = false;
        } else {
            this.node.active = true;
        }
        //当前成就的信息
        var info = this.achieveInfoList[lv];
        //描述
        this.achieveDesc.dataID = info.desc;
        //奖励数量
        this.rewardNum.string = info.rNum;
        //当前成就的完成数量
        var finishVal = player.itemArrayGet("pAchievement", info.target);
        //当前成就的进度
        var curPro = finishVal / info.num;
        this.achievePro.string = ((curPro > 1 ? 1 : curPro) * 100).toFixed(2) + "%"
        this.achieveFinishPro = curPro;
        //可领取状态
        if (curPro >= 1) {
            //可领取
            this.node.off("click");
            this.node.on("click", function () {
                this.achieveFinishClick(lv);
            }.bind(this), this)
            //钻石抖动
            this.reward.rotation = 10;
            this.reward.runAction(
                cc.sequence(
                    cc.rotateTo(0.1, -10),
                    cc.rotateTo(0.1, 10),
                    cc.rotateTo(0.1, -10),
                    cc.rotateTo(0.1, 10),
                    cc.callFunc(function(){
                        this.reward.rotation = 0;
                    }.bind(this),this)
                )
            )
        } else {
            //不可领取
            this.node.off("click");
        }
    },

    //领取按钮事件
    achieveFinishClick(idx) {
        soundManager.playSound("btnClick");
        if (this.achieveFinishPro >= 1) {
            this.node.off("click");
            this.getReward(idx);
            this.node.runAction(
                cc.sequence(
                    cc.moveTo(0.5, cc.v2(((cc.winSize.width * 0.5) + this.node.width), this.node.y)),
                    cc.delayTime(1),
                    cc.moveTo(0.5, cc.v2((cc.winSize.width * 0.5), this.node.y)),
                )
            )
        }
    },

    //获取奖品
    getReward(idx) {
        var info = this.achieveInfoList[idx];
        var rNum = info.rNum;
        //成就进度向前一步
        player.itemArraySet("pAchievement", 6, idx + 1, function () {
            //获取钻石
            effectManager.flyReward(10, 1, mainScript.diamonds.node, this.node, null, true);
            player.itemArrayAdd("pCurrency", 1, rNum);
        }.bind(this));
    },

    //start() {},

    // update (dt) {},
});
