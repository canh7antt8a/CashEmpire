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
        profit: {
            default: 0,
            visible: false,
        },
        money: {
            default: null,
            type: cc.Label,
        },
    },

    // LIFE-CYCLE CALLBACKS:
    //按钮点击事件
    menuClick(event, type) {
        soundManager.playSound("btnClick");
        if (type == "receive") {
            viewManager.popView("OfflineProfitView", false, function (view) {
                //可以播放特效
            }.bind(this));
        } else if (type == "double") {
            gameApplication.onVideoBtnClick(function (isComplited) {
                if (isComplited) {
                    player.itemArrayAdd("pCurrency", 0, this.profit);
                    viewManager.popView("OfflineProfitView", false, function (view) {
                        //可以播放特效
                    }.bind(this));
                }
            }.bind(this))
        }
    },

    //onLoad() {},

    //start() {},

    showView(profit) {
        this.profit = profit;
        this.money.string = gameApplication.countUnit(profit)[2];
        player.itemArrayAdd("pCurrency", 0, this.profit);
    },

    // update (dt) {},
});
