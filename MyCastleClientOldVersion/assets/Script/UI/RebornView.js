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
        curPrestige: {
            default: null,
            type: cc.Label,
        },
        nexPrestige: {
            default: null,
            type: cc.Label,
        },
        curProfit: {
            default: null,
            type: cc.Label,
        },
        nexProfit: {
            default: null,
            type: cc.Label,
        },
        canGet: {
            default: null,
            type: cc.Label,
        },
        needMoney: {
            default: null,
            type: cc.Label,
        },
        famousBtn: {
            default: null,
            type: cc.Button,
        },
        isReborning: {
            default: false,
            visible: false,
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    onEnable() {
        this.refreashVal();
        this.schedule(this.refreashVal, 0.5);
    },
    onDisable() {
        this.unschedule(this.refreashVal);
    },

    start() {
        this.famousBtn.node.off("click");
        this.famousBtn.node.on("click", function () {
            viewManager.popView("RebornBuffView", true, function (view) {
                var rebornBtn = cc.find("Bg/Reborn", view);
                var videoRebornBtn = cc.find("Bg/VideoReborn", view);
                //直接重生
                rebornBtn.off("click");
                rebornBtn.on("click", function () {
                    viewManager.popView("RebornBuffView", false);
                    this.reborn(false);
                }.bind(this), this)
                //看视频重生
                videoRebornBtn.off("click");
                videoRebornBtn.on("click", function () {
                    gameApplication.onVideoBtnClick(function (isOk) {
                        if (isOk) {
                            viewManager.popView("RebornBuffView", false);
                            this.reborn(true);
                        }
                    }.bind(this), 1)
                }.bind(this), this)
            }.bind(this))
        }.bind(this), this)
        cc.find("Guide", this.node).active = true;
    },

    //刷新数据
    refreashVal() {
        var getVal = this.countGet();
        this.curPrestige.string = gameApplication.countUnit(player.itemArrayGet("pCurrency", 3))[3]
        this.nexPrestige.string = gameApplication.countUnit(player.itemArrayGet("pCurrency", 3) + getVal)[3];
        this.curProfit.string = "X " + (1 + player.itemArrayGet("pCurrency", 3) / 100).toFixed(2)
        this.nexProfit.string = "X " + (1 + (player.itemArrayGet("pCurrency", 3) + getVal) / 100).toFixed(2);
        this.canGet.string = getVal;
        var bornTimes = player.getData("BornTimes", null, false);
        var needMoney = Math.pow(10, (3 * (bornTimes + 1)) + 3);
        if (bornTimes == 0) {
            needMoney = 180000000;
        }
        this.needMoney.string = gameApplication.countUnit(needMoney)[2];
        //检查是否可以重生
        if (this.checkLimit()) {
            this.famousBtn.interactable = true;
        } else {
            this.famousBtn.interactable = false;
        }

    },

    //重生
    reborn(isAD) {
        if (this.isReborning) {
            return;
        }
        this.isReborning = true;
        var bornTimes = player.getData("BornTimes", null, false);
        //记录重生次数
        var b = (bornTimes > 99 ? bornTimes : (bornTimes > 9 ? "0" + bornTimes : "00" + bornTimes));
        gameApplication.DataAnalytics.doEvent(b + "_reborn");

        let reward = this.countGet();
        if (isAD) {
            reward = parseFloat((reward * 1.1).toFixed(2));
        }
        mainScript.node.active = false;

        //重生成就
        player.itemArrayAdd("pAchievement", 5, 1);

        //重置该世界的数据
        player.firstData(function () {
            player.initInfo(true, function () {
                //停止所有的操作
                gameApplication.stopAllAction();

                //记录重生次数
                player.setData("BornTimes", (bornTimes + 1));

                //关闭界面
                viewManager.popView("RebornView", false);
                this.isReborning = false;
                mainScript.node.active = true;
                this.refreashVal();

                //扣除所需要的钱
                var needMoney = Math.pow(10, (3 * (bornTimes + 1)) + 3);
                if (bornTimes == 0) {
                    needMoney = 180000000;
                }
                player.itemArrayAdd("pCurrency", 0, -needMoney);
                player.itemArrayAdd("pCurrency", 3, reward);
            }.bind(this));
        }.bind(this));
    },

    //计算收益
    countGet() {
        var bornTimes = player.getData("BornTimes", null, false);
        var canGet = 0;
        if (bornTimes == 0) {
            canGet = 200;
        } else if (bornTimes == 1) {
            canGet = 300;
        } else if (bornTimes == 2) {
            canGet = 500;
        } else {
            var count = bornTimes + 2;
            var TIncome = player.getData("TotalIncome", null, false);
            canGet = TIncome / Math.pow(10, 3 * count - 2);
        }
        return parseInt(canGet.toFixed(0));
    },

    //限制判断
    checkLimit() {
        var bornTimes = player.getData("BornTimes", null, false);
        var limit = Math.pow(10, (3 * (bornTimes + 1)) + 3);
        var TIncome = player.getData("TotalIncome", null, false);
        var needMoney = Math.pow(10, (3 * (bornTimes + 1)) + 3);
        if (bornTimes == 0) {
            needMoney = 180000000;
        }
        if (TIncome >= limit && player.itemArrayGet("pCurrency", 0) >= needMoney) {
            //mainScript.rebornMark.active = true;
            return true;
        } else {
            //mainScript.rebornMark.active = false;
            return false;
        }
    },

    // update (dt) {},
});
