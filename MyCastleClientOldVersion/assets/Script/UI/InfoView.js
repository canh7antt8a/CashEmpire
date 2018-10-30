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
        pNameText: {
            default: null,
            type: cc.Label,
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
        this.pNameText.string = player.getName();
    },

    onDisable() {
        this.unschedule(this.updateInfo);
    },

    menuClick(event, type) {
        soundManager.playSound("btnClick");
        if (type == "reName") {
            var storeInfo = player.getArrayAll("pProp");
            if (storeInfo[1][5] > 0) {
                this.pNameText.string = this.pNameInput.string;
                player.setName(this.pNameText.string);
                player.itemArraySet("pProp", 1, storeInfo[1], function () {
                    storeInfo[1][5] =storeInfo[1][5] - 1;
                }.bind(this))
            }else{
                this.pNameText.string = this.nameReverse;
                gameApplication.warnTips("lang.infoNoRenameCard");
            }
            this.pNameText.node.active = true;
            this.pNameInput.string = "";
        }else if("reverseName"){
            this.pNameInput.string = this.pNameText.string;
            this.nameReverse = this.pNameText.string;
            this.pNameText.node.active = false;
        }
    },

    //更新用户数据
    updateInfo() {
        this.pHead.spriteFrame = player.fbPlayer.head;
        this.curMoney.string = gameApplication.countUnit(player.itemArrayGet("pCurrency", 0))[2];
        this.totalMoney.string = gameApplication.countUnit(player.itemArrayGet("pScore", 3))[2];
        this.bestMoney.string = gameApplication.countUnit(player.itemArrayGet("pScore", 4))[2];
        var time = player.itemArrayGet("pScore", 5);
        this.gameTime.string = gameApplication.countTime(time)[0];
        this.prestige.string = player.itemArrayGet("pScore", 6);
        this.prestigeBuf.string = (Math.floor(player.itemArrayGet("pCurrency", 3))) + "%";
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
