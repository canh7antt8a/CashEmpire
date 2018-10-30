// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var passVal = [3, 50];
var timeVal = [2, 100];
cc.Class({
    extends: cc.Component,

    properties: {
        giftView: {
            default: null,
            type: cc.Node,
            visible: false,
        },
        giftBtn: {
            default: null,
            type: cc.Node,
        },
        giftMask: {
            default: null,
            type: cc.Node,
        },
        giftTip: {
            default: null,
            type: cc.Node,
        },
        giftTimeText: {
            default: null,
            type: cc.Label,
        },
        giftTime: {
            default: 0,
            visible: false,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        window.timeGiftScript = this;
        SDK().getItem("giftTime", function (time) {
            time = parseInt(time);
            this.giftTime = time;
        }.bind(this));

        this.node.on("click", function (event) {
            this.openBtn();
        }, this);
    },

    openBtn() {
        soundManager.playSound("btnClick");
        if (this.giftTip.active) {
            this.showTimeGiftView(1);
        }
    },

    start() {
        this.checkTime(true);
    },

    showTimeGiftView(type) {
        let heartVal = 0;
        let coinVal = 0;
        if (type == 1) {
            heartVal = timeVal[0];
            coinVal = timeVal[1];
        } else if (type == 2) {
            heartVal = passVal[0];
            coinVal = passVal[1];
        }
        viewManager.popView("GiftView", true, function (view) {
            //初始化
            this.giftView = view;
            var bg = this.giftView.getChildByName("Bg");
            var later = bg.getChildByName("Later");
            var receive = bg.getChildByName("ReceiveView");
            cc.find("Heart/HeartNum",receive).getComponent(cc.Label).string = "+" + heartVal;
            cc.find("Coin/CoinNum",receive).getComponent(cc.Label).string = "+" + heartVal;
            var lightBg0 = receive.getChildByName("Light0");
            var lightBg1 = receive.getChildByName("Light1");
            var receiveBtn = receive.getChildByName("Receive");
            var doubleBtn = receive.getChildByName("Double");
            lightBg0.runAction(
                cc.repeatForever(cc.rotateBy(1, 120))
            );
            lightBg1.runAction(
                cc.repeatForever(cc.rotateBy(1, 120))
            );
            receiveBtn.off("click");
            //接收按钮
            receiveBtn.on("click", function (event) {
                soundManager.playSound("btnClick");

                if (type == 1) {
                    //重置时间
                    this.resetTime();
                }

                //加体力
                SDK().getItem("hearts", function (Heart) {
                    Heart = parseInt(Heart);
                    Heart = Heart + heartVal;
                    viewManager.flyReward(heartVal, "heartSprite", null, null);
                    SDK().setItem({ hearts: Heart }, null);
                    if (null != window.mainScript.hearts) {
                        window.mainScript.hearts.getComponent(cc.Label).string = Heart.toString();
                    }
                }.bind(this));

                //加金币
                SDK().getItem("coins", function (Coin) {
                    Coin = parseInt(Coin);
                    Coin = Coin + coinVal;
                    viewManager.flyReward(coinVal * 0.1, "coin", null, null);
                    SDK().setItem({ coins: Coin }, function () {
                        window.mainScript.refreashVal();
                    });
                    if (null != window.mainScript.coins) {
                        window.mainScript.coins.getComponent(cc.Label).string = Coin.toString();
                    }
                }.bind(this));

                viewManager.popView("GiftView", false);
            }, this);

            doubleBtn.off("click");
            //三倍按钮
            doubleBtn.on("click", function (event) {
                soundManager.playSound("btnClick");
                window.gameApplication.onVideoBtnClick(function (isCompleted) {
                    if (isCompleted) {
                        if (type == 1) {
                            //重置时间
                            this.resetTime();
                        }

                        //加体力
                        SDK().getItem("hearts", function (Heart) {
                            Heart = parseInt(Heart);
                            Heart = Heart + (heartVal * 3);
                            viewManager.flyReward((heartVal * 3), "heartSprite", null, null);
                            SDK().setItem({ hearts: Heart }, null);
                            if (null != window.mainScript.hearts) {
                                window.mainScript.hearts.getComponent(cc.Label).string = Heart.toString();
                            }
                        }.bind(this));

                        //加金币
                        SDK().getItem("coins", function (Coin) {
                            Coin = parseInt(Coin);
                            Coin = Coin + (coinVal * 3);
                            viewManager.flyReward((coinVal * 0.3), "coin", null, null);
                            SDK().setItem({ coins: Coin }, function () {
                                window.mainScript.refreashVal();
                            });
                            if (null != window.mainScript.coins) {
                                window.mainScript.coins.getComponent(cc.Label).string = Coin.toString();
                            }
                        }.bind(this));
                        viewManager.popView("GiftView", false);
                    }
                }.bind(this));
            }, this);
        }.bind(this))
    },

    resetTime() {
        var timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
        this.giftTime = timestamp;
        SDK().setItem({ giftTime: this.giftTime }, null);
    },

    checkTime(isStart) {
        var timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
        if (timestamp - this.giftTime > 10800) {
            if ((!this.giftTip.active && this.giftMask.active) || isStart) {
                this.giftTip.active = true;
                this.giftMask.active = false;
                this.giftTimeText.node.active = true;
                this.giftBtn.stopAllActions();
            }
        } else {
            if ((this.giftTip.active && !this.giftMask.active) || isStart) {
                this.giftTip.active = false;
                this.giftTip.stopAllActions();
                this.giftMask.active = true;
                this.giftTimeText.node.active = true;
                this.giftBtn.getChildByName("Gift").stopAllActions();
                this.giftBtn.getChildByName("Gift").rotation = 0;
            }
            var temp = timestamp - this.giftTime;
            temp = 10800 - temp;
            var tempMin = temp / 60;
            var hor = 0;
            if (tempMin >= 60) {
                var count = Math.floor(tempMin / 60);
                hor = count;
                tempMin = (tempMin % 60) * 60;
            }
            var min = tempMin / 60 < 10 ? "0" + Math.floor(tempMin / 60) : "" + Math.floor(tempMin / 60);
            var sec = temp % 60 < 10 ? "0" + Math.floor(temp % 60) : "" + Math.floor(temp % 60);
            if (temp <= 0) {
                min = "00";
                sec = "00"
            }
            if (hor > 0) {
                this.giftTimeText.string = hor + ":" + min + ":" + sec;
            } else {
                this.giftTimeText.string = min + ":" + sec;
            }
        }
        this.scheduleOnce(function () {
            this.checkTime(false);
        }.bind(this), 1)
    },

    /* update(dt) {
        
    }, */
});
