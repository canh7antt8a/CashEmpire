import { SIGPROF } from "constants";
var DataAnalytics = require("../SDK/DataAnalytics");
var MTA = require("../SDK/MTA");
cc.Class({
    extends: cc.Component,

    properties: {
        viewManager: {
            default: null,
            visible: false,
        },
        resManager: {
            default: null,
            visible: false,
        },
        soundManager: {
            default: null,
            visible: false,
        },
        effectManager: {
            default: null,
            visible: false,
        },
        dataManager: {
            default: null,
            visible: false,
        },
        gameBg: {
            default: null,
            visible: false,
        },
        player: {
            default: null,
            visible: false,
        },
        _playTimes: {
            default: 0,
            type: cc.Integer,
            visible: false,
        },
        playTimes: {
            get: function () {
                return this._playTimes;
            },
            set: function (val) {
                this._playTimes = val;
                SDK().plusPlayTimes();
            },
            visible: false,
        },
        unitCof: {
            default: null,
            visible: false,
        },
    },

    onEnable() {
        this.scheduleOnce(function () {
            this.schedule(this.countGameTime, 3);
        }.bind(this), 2)
    },

    onDisable() {
        this.unschedule(this.countGameTime);
    },

    onDestroy() {
        DataAnalytics.levelResult(true, { level: "gameTime" });
        DataAnalytics.logout(SDK().getSelfInfo().id);
    },

    onLoad() {
        MTA.init();
        cc.director.setDisplayStats(false);
        //初始化ASDK
        this.DataAnalytics = DataAnalytics;
        this.lang = i18n.languages['en'].lang;
        DataAnalytics.init()
        SDK().init(function () {
            DataAnalytics.login(SDK().getSelfInfo().id);
        });

        //初始化各系统脚本
        window.gameApplication = this;
        this.dataManager = this.node.addComponent("DataManager");
        this.resManager = this.node.addComponent("ResManager");
        this.soundManager = this.node.addComponent("SoundManager");
        this.viewManager = this.node.addComponent("ViewManager");
        this.effectManager = this.node.addComponent("EffectManager");
        this.player = this.node.addComponent("Player");
        this.gameBg = cc.find("Canvas/Bg").getComponent(cc.Sprite);

        //隐藏大楼界面
        this.goWorldView(true);

        //后台运行处理
        cc.game.on(cc.game.EVENT_HIDE, function () {
            DataAnalytics.gameHideAndShow(true);
            cc.audioEngine.pauseAll();
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            DataAnalytics.gameHideAndShow(false);
            cc.audioEngine.resumeAll();
        });
    },


    start() {
        //初始化语言
        SDK().getItem("curLang", function (idx) {
            if (idx == null) {
                idx = 0;
            }
            this.setLanguage(window.nameArr[idx]);
        }.bind(this))
        SDK().init();
        resManager.loadConfig("UnitList", function (cof) {
            //单位信息
            this.unitCof = cof.unitList;
        }.bind(this));
        this.scheduleOnce(function () {
            DataAnalytics.createAPart({
                roleID: SDK().getSelfInfo().id,
                userName: player.fbPlayer.name,
            });
            DataAnalytics.levelBegin({ level: "gameTime" })
        }.bind(this), 10);
    },

    goWorldView(isFirst) {
        cc.find("Canvas/WorldView/BeginMask").active = true;
        //隐藏大楼界面
        viewManager.showView("MainView", false, true);
        viewManager.showView("WorldView", true, false, null, function (view) {
            worldScript.initBuilding();
            cc.find("Canvas/WorldView/BeginMask").active = false;
        }.bind(this));

        if (!isFirst) {
            this.stopAllAction();
        }
        if(window.managerScript != null && window.managerScript != undefined){
            managerScript.unLoadCustomer();
        }
    },

    //停止所有操作
    stopAllAction() {
        mainScript.unscheduleAllCallbacks();
        buildManager.unscheduleAllCallbacks();
        viewManager.stopAllLerpActions();
        //大楼处理
        mainScript.floorInfoList = [];
        player.setArrayAll("myFloors", []);

        //卸载管家以及顾客
        managerScript.managerInfoList = [null, null, null, null, null, null, null, null, null, null];
        managerScript.isLoadData = false;
        player.setArrayAll("myManagers", ["undefined", "undefined", "undefined", "undefined", "undefined", "undefined", "undefined", "undefined", "undefined", "undefined"]);
        managerScript.unLoadCustomer();

        //重新加载大楼和管家
        mainScript.initBuilding();
        managerScript.initManagerList();
        workerScript.initView();
    },

    //计算游戏时长
    countGameTime() {
        player.itemArrayAdd("pScore", 5, 3);
        player.itemArraySet("pScore", 8, (new Date().getTime() / 1000));
        if (this.gameBg == null) {
            return;
        }
        var hour = new Date().getHours();
        if (hour >= 6 && hour <= 16) {
            if (this.gameBg.spriteFrame.name != "Bg0") {
                resManager.loadSprite("gameBg.Bg0", function (sp) {
                    this.gameBg.spriteFrame = sp;
                }.bind(this))
            }
        } else if (hour > 16 && hour <= 19) {
            if (this.gameBg.spriteFrame.name != "Bg1") {
                resManager.loadSprite("gameBg.Bg1", function (sp) {
                    this.gameBg.spriteFrame = sp;
                }.bind(this))
            }
        } else {
            if (this.gameBg.spriteFrame.name != "Bg2") {
                resManager.loadSprite("gameBg.Bg2", function (sp) {
                    this.gameBg.spriteFrame = sp;
                }.bind(this))
            }
        }
    },

    //设置语言
    setLanguage(language) {
        const i18n = require('LanguageData');
        i18n.init(language);
    },

    //视频奖励
    onVideoBtnClick(cb, type) {
        SDK().showVideoAd(
            function (isCompleted) {
                if (null == isCompleted) {
                    console.log("没有观看成功")
                    this.fbFail(1);
                    if (cb != null) {
                        cb(false);
                    }
                } else if (isCompleted) {
                    if (cb != null) {
                        cb(true);
                    }
                } else {
                    console.log("没有观看成功")
                    this.fbFail(1);
                    if (cb != null) {
                        cb(false);
                    }
                }
            }.bind(this)
            , type);
    },

    //检查日常次数限制
    checkDailyCount(key, isAdd, cb) {
        var myDate = new Date();
        let month = myDate.getMonth();       //获取当前月份(0-11,0代表1月)
        let day = myDate.getDate();        //获取当前日(1-31)
        SDK().getItem(month + "_" + day + "_" + key, function (val) {
            if (val == null) {
                val = 0;
            }
            val = parseInt(val);
            if (isAdd) {
                val = val + 1
                var param = {};
                param[month + "_" + day + "_" + key] = val;
                SDK().setItem(param);
            }
            if (cb != null) {
                cb(val);
            }
        })
    },

    //插屏广告按钮
    onGiftBtnClick(cb) {
        SDK().showInterstitialAd(
            function (isCompleted) {
                if (null == isCompleted) {
                    console.log("没有观看成功")
                    this.fbFail(1);
                } else if (isCompleted) {
                    cb(true);
                } else {
                    console.log("没有观看成功")
                    this.fbFail(1);
                }
            }.bind(this)
            , true);
    },

    //显示是否分享的提示框
    showSharaView(cb) {
        if (this.SharaView == null) {
            var view = cc.instantiate(this.SharaView_prefab);
            var Canvas = cc.find("Canvas");
            view.parent = Canvas;
            view.width = window.width;
            view.height = window.height;
            this.SharaView = view;
        }
        this.SharaView.active = true;
        let sureBtn = this.SharaView.getChildByName("Bg").getChildByName("Sure");
        sureBtn.off(cc.Node.EventType.TOUCH_END);
        sureBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.onShareBtnClick(function (isCompleted) {
                cb(isCompleted)
                if (isCompleted) {
                    this.SharaView.active = false;
                }
            }.bind(this));
            soundManager.playSound("btnClick");
        }, this);

        var laterBtn = this.SharaView.getChildByName("Bg").getChildByName("Later");
        laterBtn.off(cc.Node.EventType.TOUCH_END);
        laterBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.SharaView.active = false;
            soundManager.playSound("btnClick");
        }, this);
    },

    //分享按钮
    onShareBtnClick(cb) {
        var score = player.itemArrayGet("pScore", 6);
        SDK().share(score, function (isCompleted) {
            if (isCompleted) {//分享激励
                console.log("share:" + score);
                if (cb != null) {
                    cb(true)
                }
            } else {
                this.fbFail(2);
            }
        }.bind(this));
    },

    //飞行礼包
    flyGift() {
        var randomType = Math.floor(Math.random() * 2.99);
        effectManager.flyGift(randomType, function (giftPos) {
            var val = Math.random();
            if (val < 0.05) {
                viewManager.popView("FlyGiftView", true, function (view) {
                    var bg = cc.find("Bg", view);
                    //初始化
                    var moneyView = cc.find("Bg/Money", view);
                    var DiamondView = cc.find("Bg/Diamond", view);
                    var okBtn = cc.find("Bg/OK", view);
                    var moreBtn = cc.find("Bg/More", view);
                    var okText = cc.find("Bg/OK/Text", view).getComponent("LocalizedLabel");
                    var moreText = cc.find("Bg/More/Text", view).getComponent("LocalizedLabel");
                    //绑定事件
                    okBtn.off("click");
                    okBtn.on("click", function () {
                        viewManager.popView("FlyGiftView", false);
                        moneyView.active = false;
                        DiamondView.active = false;
                    }.bind(this), this)
                    moreBtn.off("click");
                    moreBtn.on("click", function () {
                        //分享按钮点击
                        gameApplication.onShareBtnClick(function (isOK) {
                            if (isOK) {
                                gameApplication.DataAnalytics.doEvent("flyGiftShare");
                                soundManager.playSound("getCoin");
                                player.itemArrayAdd("pCurrency", 1, 5);
                                effectManager.flyReward(10, 1, mainScript.diamonds.node, giftPos, null, true);
                                gameApplication.checkDailyCount("flyGift", true);
                                moneyView.active = false;
                                DiamondView.active = false;
                                viewManager.popView("FlyGiftView", false);
                            }
                        }.bind(this))
                    }.bind(this), this)
                    //按钮字
                    okText.dataID = "lang.noThanksText";
                    moreText.dataID = "lang.shareText";
                    //显示界面
                    moneyView.active = false;
                    DiamondView.active = true;
                    bg.active = true;
                }.bind(this));
            } else if (val < 0.65) {
                //随机收益
                var randomMul = 10 + Math.random() * 5;
                var totalProfit = 0;
                for (var idx = 0; idx < mainScript.floorInfoList.length; idx = idx + 1) {
                    if (mainScript.floorInfoList[idx] != null && mainScript.floorInfoList[idx] != "undefined" && mainScript.floorInfoList[idx] != undefined) {
                        totalProfit = totalProfit + (buildManager.countProfit(idx) / buildManager.countProfitTime(idx));
                    }
                }
                //弹窗询问是否进行翻倍
                viewManager.popView("FlyGiftView", true, function (view) {
                    //获得钱
                    player.itemArrayAdd("pCurrency", 0, totalProfit * randomMul);

                    var bg = cc.find("Bg", view);
                    //初始化
                    var moneyView = cc.find("Bg/Money", view);
                    var DiamondView = cc.find("Bg/Diamond", view);
                    var okBtn = cc.find("Bg/OK", view);
                    var moreBtn = cc.find("Bg/More", view);
                    var okText = cc.find("Bg/OK/Text", view).getComponent("LocalizedLabel");
                    var moreText = cc.find("Bg/More/Text", view).getComponent("LocalizedLabel");
                    var numText = cc.find("Bg/Money/Num", view).getComponent(cc.Label);
                    numText.string = gameApplication.countUnit(totalProfit * randomMul)[2];
                    //绑定事件
                    okBtn.off("click");
                    okBtn.on("click", function () {
                        moneyView.active = false;
                        DiamondView.active = false;
                        viewManager.popView("FlyGiftView", false);
                        effectManager.flyReward(10, 0, mainScript.coins.node, giftPos, null, true);
                        soundManager.playSound("getCoin");
                    }.bind(this), this)
                    moreBtn.off("click");
                    moreBtn.on("click", function () {
                        //视频按钮点击
                        gameApplication.onVideoBtnClick(function (isOK) {
                            if (isOK) {
                                gameApplication.DataAnalytics.doEvent("flyGiftVideo");
                                moneyView.active = false;
                                DiamondView.active = false;
                                player.itemArrayAdd("pCurrency", 0, totalProfit * randomMul);
                                effectManager.flyReward(10, 0, mainScript.coins.node, giftPos, null, true);
                                gameApplication.checkDailyCount("flyGift", true);
                                viewManager.popView("FlyGiftView", false);
                                soundManager.playSound("getCoin");
                            }
                        }.bind(this), 0)
                    }.bind(this), this)
                    okText.dataID = "lang.receiveText";
                    moreText.dataID = "lang.watchText";
                    moneyView.active = true;
                    DiamondView.active = false;
                    bg.active = true;
                }.bind(this));
            } else {
                //随机收益
                var randomMul = 5 + Math.random() * 5;
                var totalProfit = 0;
                for (var idx = 0; idx < mainScript.floorInfoList.length; idx = idx + 1) {
                    if (mainScript.floorInfoList[idx] != null && mainScript.floorInfoList[idx] != "undefined" && mainScript.floorInfoList[idx] != undefined) {
                        totalProfit = totalProfit + (buildManager.countProfit(idx) / buildManager.countProfitTime(idx));
                    }
                }
                //获得收益
                player.itemArrayAdd("pCurrency", 0, totalProfit * randomMul);
                effectManager.flyReward(10, 0, mainScript.coins.node, giftPos, null, true);
                soundManager.playSound("getCoin");
            }
        }.bind(this));
    },

    //FB失败界面
    fbFail(type) {
        viewManager.popView("FbFail", true, function (view) {
            if (type == 1) {
                view.getChildByName("Bg").getChildByName("VideoText").active = true;
                view.getChildByName("Bg").getChildByName("ShareText").active = false;
            } else {
                view.getChildByName("Bg").getChildByName("VideoText").active = false;
                view.getChildByName("Bg").getChildByName("ShareText").active = true;
            }
            view.active = true;
        }.bind(this));

    },

    //提示窗
    warnTips(dID, closeCb) {
        viewManager.popView("WarnView", true, function (view) {
            var text = cc.find("Bg/Text", view).getComponent("LocalizedLabel");
            text.dataID = dID;
            text.node.active = true;
            let close = cc.find("Bg/Close", view);
            close.on("click", function (event) {
                text.node.active = false;
                if (closeCb != null) {
                    closeCb();
                    closeCb = null;
                }
            }, this);
        }.bind(this));
    },


    //互推按钮事件
    popClick(event, type) {
        SDK().switchGameAsync(type);
    },

    //获取当前时间
    getCurTime() {
        var nowTime = new Date().getTime() / 1000;
        return parseFloat(nowTime);
    },

    //计算时间
    countTime(time) {
        var tempMin = time / 60;
        var hor = 0;
        if (tempMin >= 60) {
            var count = Math.floor(tempMin / 60);
            hor = count;
            tempMin = (tempMin % 60);
        }
        var min = tempMin < 10 ? "0" + Math.floor(tempMin) : "" + Math.floor(tempMin);
        var sec = time % 60 < 10 ? "0" + Math.floor(time % 60) : "" + Math.floor(time % 60);
        if (time <= 0) {
            min = "00";
            sec = "00"
        }
        var string;
        if (hor > 0) {
            string = hor + ":" + min + ":" + sec;
        } else {
            string = min + ":" + sec;
        }
        return [string, hor, min, sec];
    },

    //计算单位
    countUnit(num) {
        var old = num;
        var unit = 0;
        while (num >= 10000) {
            num = num * 0.001;
            unit = unit + 1;
        }
        var money = num.toFixed(2);
        if (gameApplication.unitCof == null) {
            return [money, unit, "$" + old.toFixed(2), money];
        }
        return [money, unit, ("$" + money + gameApplication.unitCof[unit].unit), (money + gameApplication.unitCof[unit].unit)];
    },

    //互推按钮时间
    popClick(event, type) {
        SDK().switchGameAsync(type);
    },

    update(dt) {
        //监测时间
    },
});
