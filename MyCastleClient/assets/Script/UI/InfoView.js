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
        pHead: {
            default: null,
            type: cc.Sprite,
        },
        nameReverse:{
            default: "",
            visible: false,
        },
        pNameInput: {
            default: null,
            type: cc.EditBox,
        },
        curMoney: {
            default: null,
            type: cc.Label,
        },
        totalMoney: {
            default: null,
            type: cc.Label,
        },
        bestMoney: {
            default: null,
            type: cc.Label,
        },
        gameTime: {
            default: null,
            type: cc.Label,
        },
        prestige: {
            default: null,
            type: cc.Label,
        },
        prestigeBuf: {
            default: null,
            type: cc.Label,
        },
        achievement: {
            default: null,
            type: cc.Label,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    //onLoad() {},

    onEnable() {
        this.updateInfo();
        this.schedule(this.updateInfo, 3);
        this.pNameInput.string = player.getName();
    },

    onDisable() {
        this.unschedule(this.updateInfo);
    },

    menuClick(event, type) {
        soundManager.playSound("btnClick");
        if (type == "reName") {
            var storeInfo = player.getArrayAll("homeStore");
            if (storeInfo[1][5] > 0) {
                player.setName(this.pNameInput.string);
                player.itemArraySet("homeStore", 1, storeInfo[1], function () {
                    storeInfo[1][5] =storeInfo[1][5] - 1;
                }.bind(this))
            }else{
                this.pNameInput.string = this.nameReverse;
            }
        }else if("reverseName"){
            this.nameReverse = this.pNameInput.string;
        }
    },

    //更新用户数据
    updateInfo() {
        this.pHead.spriteFrame = player.fbPlayer.head;
        this.curMoney.string = gameApplication.countUnit(player.itemArrayGet("pCurrency", 0))[2];
        this.totalMoney.string = gameApplication.countUnit(player.itemArrayGet("pScore", 3))[2];
        this.bestMoney.string = gameApplication.countUnit(player.itemArrayGet("pScore", 4))[2];
        var time = player.itemArrayGet("pScore", 5);
        this.gameTime.string = this.dealTime(time);
        this.prestige.string = player.itemArrayGet("pScore", 6);
        this.prestigeBuf.string = (Math.floor(player.itemArrayGet("pScore", 6) / 100) * 0.05) + "%";
        this.achievement.string = player.itemArrayGet("pScore", 7);
    },

    dealTime(temp) {
        var tempMin = temp / 60;
        var hor = 0;
        if (tempMin >= 60) {
            var count = Math.floor(tempMin / 60);
            hor = count;
            tempMin = (tempMin % 60) * 60;
        }
        var min = tempMin < 10 ? "0" + Math.floor(tempMin) : "" + Math.floor(tempMin);
        var sec = temp % 60 < 10 ? "0" + Math.floor(temp % 60) : "" + Math.floor(temp % 60);
        if (temp <= 0) {
            min = "00";
            sec = "00"
        }
        var string = "";
        if (hor > 0) {
            string = hor + ":" + min + ":" + sec;
        } else {
            string = min + ":" + sec;
        }
        return string;
    },

    //start() {},

    // update (dt) {},
});
