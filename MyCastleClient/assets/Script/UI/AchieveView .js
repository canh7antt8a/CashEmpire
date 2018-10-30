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
        //成就滚动界面
        achieveView: {
            default: null,
            type: cc.ScrollView,
        },
        //滚动体
        achieveContent: {
            default: null,
            type: cc.Node,
        },
        //成就预制件
        achieveItem: {
            default: null,
            type: cc.Node,
        },
        //成就UI存储列表
        achieveList: {
            default: [],
            visible: false,
        },
        //成就配置存储列表
        achieveInfoList: {
            default: [],
            visible: false,
        },
        //成就完成情况存储列表
        achieveFinishList: {
            default: [],
            visible: false,
        },
        //目标列表
        targetList: {
            default: [],
            visible: false,
        },
        achieveInited: {
            default: false,
            visible: false,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        resManager.loadConfig("ResourceList", function (cof) {
            this.achieveInfoList = cof.achieveList;
            this.targetList = cof.targetList;
            this.achieveFinishList = player.getArrayAll("pAchievement");
            this.initView();
        }.bind(this));
    },

    onEnable() {
        this.refreashVal();
        this.schedule(this.refreashVal, 0.5);
    },
    onDisable() {
        this.unschedule(this.refreashVal);
    },

    //按钮点击事件
    menuClick(event, type) {
        soundManager.playSound("btnClick");
        if (type == "recharge") {
        }
    },

    //刷新数据
    refreashVal() {
        if (!this.achieveInited) {
            return;
        }
        for (var idx = 0; idx < this.achieveList.length; idx = idx + 1) {
            this.setProsVal(idx);
        }
    },

    //设置进度条
    setProsVal(idx) {
        var lv = this.achieveFinishList[idx];
        var info = this.achieveInfoList[idx];
        var targetName = this.targetList[this.achieveInfoList[idx].target].name;
        var targetIdx = this.targetList[this.achieveInfoList[idx].target].idx;
        var curVal = 0;
        if (targetIdx == -1) {
            var list = player.getArrayAll(targetName);
            if (targetName == "myManagers") {
                curVal = 0;
                for (var i = 0; i < list.length; i = i + 1) {
                    if (list[4] >= 99) {
                        curVal = curVal + 1;
                    }
                }
            } else {
                curVal = list.length;
            }
        } else {
            curVal = player.itemArrayGet(targetName, targetIdx)
        }
        //进度条设置
        if (info.num.length <= lv) {
            this.achieveList[idx].curItem.active = false;
        }
        var progress = parseFloat(curVal / info.num[lv]);
        this.achieveList[idx].pros.progress = 0;
        this.achieveList[idx].pros.progress = this.achieveList[idx].pros.progress + progress;
        this.achieveList[idx].prosVal.string = ((progress > 1 ? 1 : progress) * 100).toFixed(2) + "%";
        if (this.achieveList[idx].pros.progress >= 1) {
            this.achieveList[idx].getBtn.interactable = true;
        } else {
            this.achieveList[idx].getBtn.interactable = false;
        }
    },

    //刷新成就
    initView() {
        var curDay = cc.find("Date", this.achieveView.node.parent).getComponent(cc.Label);
        var today = new Date();
        var mouth = (today.getMonth() + 1) < 10 ? "0" + (today.getMonth() + 1) : (today.getMonth() + 1);
        var day = today.getDate() < 10 ? "0" + today.getDate() : today.getDate();
        curDay.string = mouth + "/" + day;
        for (var i = 0; i < this.achieveInfoList.length; i = i + 1) {
            this.loadAchieveItem(i);
        }
        this.achieveInited = true;
    },

    //初始化成就信息
    loadAchieveItem(idx) {
        var info = this.achieveInfoList[idx];
        var lv = this.achieveFinishList[idx];
        if (this.achieveList[idx] == null) {
            this.achieveList[idx] = {};
        }
        var curItem = this.achieveList[idx].curItem;
        if (this.achieveInfoList[idx] == null || this.achieveInfoList[idx] == undefined) {
            curItem.active = false;
        }
        if (curItem == null) {
            curItem = cc.instantiate(this.achieveItem);
            this.achieveList[idx].curItem = curItem;
            this.achieveList[idx].getBtn = this.achieveList[idx].curItem.getComponent(cc.Button);
            this.achieveList[idx].showSprite = cc.find("Sprite", curItem).getComponent(cc.Sprite);
            this.achieveList[idx].desc = cc.find("Description/Text", curItem).getComponent("LocalizedLabel");
            this.achieveList[idx].pros = cc.find("Progress/Pro", curItem).getComponent(cc.ProgressBar);
            this.achieveList[idx].pros.totalLength = this.achieveList[idx].pros.node.width;
            this.achieveList[idx].prosVal = cc.find("Progress/Text", curItem).getComponent(cc.Label);
        }
        var showSprite = this.achieveList[idx].showSprite;
        var desc = this.achieveList[idx].desc;

        //完成按钮初始化
        curItem.off("click");
        curItem.on("click", function (event) {
            this.achieveFinishClick(idx);
        }.bind(this), this)

        //读取图片信息
        resManager.loadSprite(info.pic[lv], function (spriteFrame) {
            showSprite.spriteFrame = spriteFrame;
        }.bind(this));

        //库存描述
        desc.dataID = info.desc + "L" + lv;

        curItem.parent = this.achieveContent;
        curItem.active = true;
    },

    //领取按钮事件
    achieveFinishClick(idx) {
        if (this.achieveList[idx].pros.progress >= 1) {
            this.getReward(idx);
        }
    },

    //获取奖品
    getReward(idx) {
        var lv = this.achieveFinishList[idx];
        var info = this.achieveInfoList[idx];
        var rTarget = this.achieveInfoList[idx].rTarget[lv];
        var rNum = this.achieveInfoList[idx].rNum[lv];
        var targetName = this.targetList[rTarget].name;
        var targetIdx = this.targetList[rTarget].idx;
        var curVal = 0;
        //奖品类型
        if (rTarget == 6) {
            console.log(targetName);
        } else if (rTarget == 7) {
            console.log(targetName);
        } else if (rTarget == 8) {
            console.log(targetName);
        } else if (rTarget == 9) {
            console.log(targetName);
        } else if (rTarget == 10) {
            console.log(targetName);
        } else {
            player.itemArraySet("pAchievement", idx, lv + 1, function () {
                player.itemArrayAdd(targetName, targetIdx, rNum);
                this.loadAchieveItem(idx);
            }.bind(this));
        }
    },

    //start() {},

    // update (dt) {},
});
