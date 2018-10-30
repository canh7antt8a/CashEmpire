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
        //转盘
        circle: {
            default: null,
            type: cc.Node,
        },
        //大楼外观的组件
        circleMain: {
            default: null,
            type: cc.Node,
        },
        //礼包
        giftUIList: {
            default: [],
            visible: false,
        },
        //旋转按钮
        spinBtn: {
            default: null,
            visible: false,
        },
        //冷缺时间Label
        cdTime: {
            default: [],
            visible: false,
        },
        //转动时的遮罩
        clickMask: {
            default: null,
            type: cc.Node,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        window.circleScript = this;
    },

    onEnable() {
        this.schedule(this.refreashVal, 0.5);
        this.clickMask.active = false;
    },
    onDisable() {
        this.unschedule(this.refreashVal);
        this.cdTime.node.active = false;
    },

    start() {
        this.spinBtn = cc.find("Bg/GoSpin", this.node);
        this.cdTime = cc.find("Bg/GoSpin/Text", this.node).getComponent("LocalizedLabel");
        for (var i = 0; i < 8; i = i + 1) {
            this.giftUIList[i] = cc.find("Bg/Circle/CBorder/CMain/" + i + "/Gift", this.node).getComponent(cc.Sprite);
            this.giftUIList[i].pauseRotation = 22.5 + (7 - i) * 45;
        }
    },

    initView(cb){
        this.initCircle();
        if(cb!=null){
            cb();
        }
    },

    refreashVal() {
        //this.cdTime = player.getData("CircleTime");
        var cTime = player.itemArrayGet("CircleTime", 0);
        //cTime = 0;//测试
        var now = gameApplication.getCurTime();
        if (cTime <= now) {
            var cCount = player.itemArrayGet("CircleCount", 0);
            if (cCount > 0) {
                this.cdTime.dataID = "FREE";
            } else {
                this.cdTime.dataID = "lang.goSpin";
            }
            this.spinBtn.getComponent(cc.Button).interactable = true;
        } else {
            this.spinBtn.getComponent(cc.Button).interactable = false;
            this.cdTime.dataID = gameApplication.countTime(cTime - now)[0];
        }
        this.cdTime.node.active = true;
    },

    //初始化转盘
    initCircle() {
        this.circleMain.rotation = 337.5;
        this.spinBtn.off("click");
        this.spinBtn.on("click", function () {
            var cTime = player.itemArrayGet("CircleTime", 0);
            //cTime = 0;//测试
            var now = gameApplication.getCurTime();
            if (cTime <= now) {
                var cCount = player.itemArrayGet("CircleCount", 0);
                //cCount = 0;//测试
                if (cCount > 0) {
                    this.goSpin(true);
                    player.itemArraySet("CircleCount", 0, 0);
                } else if (cCount == 0) {
                    gameApplication.onVideoBtnClick(function (isOK) {
                        if (isOK) {
                            this.goSpin();
                        }
                    }.bind(this), 1);
                }
            }
        }.bind(this), this)
    },


    goSpin(isFirst) {
        this.clickMask.active = true;
        var ramdomGift;
        if (isFirst) {
            ramdomGift = 3;
        } else {
            //设置时间
            var now = gameApplication.getCurTime();
            player.itemArraySet("CircleTime", 0, now + 3600);

            var ramdom = Math.random();
            if (ramdom < 0.2) {
                ramdomGift = 0;
                player.itemArrayAdd("pCurrency", 1, 5);
            } else if (ramdom < 0.35) {
                ramdomGift = 1;
                player.itemArrayAdd("pCurrency", 1, 10);
            } else if (ramdom < 0.45) {
                ramdomGift = 2;
                player.itemArrayAdd("pCurrency", 1, 15);
            } else if (ramdom < 0.5) {
                ramdomGift = 3;
                player.itemArrayAdd("pCurrency", 1, 20);
            } else if (ramdom < 0.74) {
                ramdomGift = 4;
                var totalProfit = this.getTotal();
                totalProfit = totalProfit * 10;
                player.itemArrayAdd("pCurrency", 0, totalProfit);
            } else if (ramdom < 0.89) {
                ramdomGift = 5;
                var totalProfit = this.getTotal();
                totalProfit = totalProfit * 20;
                player.itemArrayAdd("pCurrency", 0, totalProfit);
            } else if (ramdom < 0.99) {
                ramdomGift = 6;
                var totalProfit = this.getTotal();
                totalProfit = totalProfit * 30;
                player.itemArrayAdd("pCurrency", 0, totalProfit);
            } else if (ramdom <= 1) {
                ramdomGift = 7;
                var oldStore = player.getArrayAll("pProp");
                //仓储更新
                var oldVal = oldStore[1][6];
                oldStore[1][6] = oldVal + 1;
                player.itemArraySet("pProp", 1, oldStore[1]);
            }
        }
        this.circleMain.runAction(
            cc.sequence(
                cc.rotateBy(3, 1440).easing(
                    cc.easeCircleActionIn(0.5)
                ),
                cc.rotateTo(3, 1440 + 360 + this.giftUIList[ramdomGift].pauseRotation).easing(
                    cc.easeCircleActionOut(0.5)
                ),
                cc.callFunc(function () {
                    this.clickMask.active = false;
                    viewManager.popView("CircleResultView", true, function (view) {
                        var closeBtn = cc.find("Bg/Close", view);
                        //图片
                        var gift = cc.find("Bg/Gift", view).getComponent(cc.Sprite);
                        gift.spriteFrame = this.giftUIList[ramdomGift].spriteFrame;
                        //数量
                        let giftNum = cc.find("Bg/Gift/Num", view).getComponent(cc.Label);
                        if (ramdomGift <= 3) {
                            giftNum.string = "X" + (5 + ramdomGift * 5);
                        } else if (ramdomGift < 7) {
                            giftNum.string = (10 + (ramdomGift - 4) * 10) + "S";
                        } else {
                            giftNum.string = "";
                        }
                        //关闭按钮
                        closeBtn.off("click")
                        closeBtn.on("click", function () {
                            viewManager.popView("CircleResultView", false);
                            if (ramdomGift <= 3) {
                                giftNum.string = "X" + (5 + ramdomGift * 5);
                                effectManager.flyReward(10, 1, mainScript.diamonds.node, closeBtn, null, true);
                            } else if (ramdomGift < 7) {
                                giftNum.string = (10 + (ramdomGift - 4) * 10) + "S";
                                effectManager.flyReward(10, 0, mainScript.coins.node, closeBtn, null, true);
                            } else {
                                giftNum.string = "";
                                effectManager.flyReward(1, 2, mainScript.coins.node, closeBtn, null, true);
                            }
                        }.bind(this), this)
                    }.bind(this));
                }.bind(this), this)
            )
        );
    },

    //获取所有楼层一秒的收益
    getTotal() {
        var totalProfit = 0;
        for (var idx = 0; idx < mainScript.floorInfoList.length; idx = idx + 1) {
            if (mainScript.floorInfoList[idx] != null && mainScript.floorInfoList[idx] != "undefined" && mainScript.floorInfoList[idx] != undefined) {
                totalProfit = totalProfit + (buildManager.countProfit(idx) / buildManager.countProfitTime(idx));
            }
        }
        return totalProfit;
    },

    // update (dt) {},
});
