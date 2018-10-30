import { SIGPROF } from "constants";
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


    onLoad() {
        SDK().init();
        window.gameApplication = this;
        this.soundManager = this.node.addComponent("SoundManager");
        this.viewManager = this.node.addComponent("ViewManager");
        this.resManager = this.node.addComponent("ResManager");
        this.effectManager = this.node.addComponent("EffectManager");
        this.dataManager = this.node.addComponent("DataManager");
        this.player = this.node.addComponent("Player");
        //显示加载界面
        cc.find("Canvas/LoadingView").active = true;
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
        resManager.loadConfig("ResourceList", function (cof) {
            //每个商店的信息
            this.unitCof = cof.unitList;
        }.bind(this));
    },

    //设置语言
    setLanguage(language) {
        const i18n = require('LanguageData');
        i18n.init(language);
    },

    //显示是否观看视频的提示框
    showVideoView(cb, isCount) {
        if (this.VideoView == null) {
            var view = cc.instantiate(this.VideoView_prefab);
            var Canvas = cc.find("Canvas");
            view.parent = Canvas;
            view.width = window.width;
            view.height = window.height;
            this.VideoView = view;
        }
        this.VideoView.active = true;
        this.VideoView.setSiblingIndex(this.VideoView.parent.childrenCount);

        //弹出动画
        let Bg = this.VideoView.getChildByName("Bg");
        Bg.scale = 0;
        Bg.runAction(cc.scaleTo(0.5, 1).easing(cc.easeBounceOut(2)));

        //旋转光
        let light = this.VideoView.getChildByName("Bg").getChildByName("Light");
        light.stopAllActions();
        light.runAction(cc.repeatForever(
            cc.rotateBy(1.1, 100),
        ));

        let sureBtn = this.VideoView.getChildByName("Bg").getChildByName("Sure");
        let sureText = sureBtn.getChildByName("Text").getComponent(cc.Label);
        sureBtn.off(cc.Node.EventType.TOUCH_END);

        let viewCount = 0;
        this.checkDailyCount("video", false, function (val) {
            viewCount = 5 - val;
            if (viewCount > 0) {
                sureBtn.getComponent(cc.Button).interactable = true;
            } else {
                sureBtn.getComponent(cc.Button).interactable = false;
            }
            if (isCount) {
                sureText.string = "FREE(" + viewCount + ")";
            } else {
                sureText.string = "FREE";
                sureBtn.getComponent(cc.Button).interactable = true;
            }
            sureBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
                if (viewCount > 0 || !isCount) {
                    soundManager.playSound("btnClick");
                    this.onVideoBtnClick(function (isCompleted) {
                        cb(isCompleted)
                        this.VideoView.active = !isCompleted;
                    }.bind(this), isCount);
                }
            }, this);
        }.bind(this));

        //按钮设置
        var laterBtn = this.VideoView.getChildByName("Bg").getChildByName("Later");
        laterBtn.off(cc.Node.EventType.TOUCH_END);
        laterBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            soundManager.playSound("btnClick");
            cb(false);
            this.VideoView.active = false;
        }, this);
    },

    //显示是否观看视频的提示框
    showCoinView(cb, isCount) {
        if (this.CoinView == null) {
            var view = cc.instantiate(this.CoinView_prefab);
            var Canvas = cc.find("Canvas");
            view.parent = Canvas;
            view.width = window.width;
            view.height = window.height;
            this.CoinView = view;
        }
        this.CoinView.active = true;
        this.CoinView.setSiblingIndex(this.CoinView.parent.childrenCount);

        //弹出动画
        let Bg = this.CoinView.getChildByName("Bg");
        Bg.scale = 0;
        Bg.runAction(cc.scaleTo(0.5, 1).easing(cc.easeBounceOut(2)));

        //旋转光
        let light = this.CoinView.getChildByName("Bg").getChildByName("Bg").getChildByName("Light");
        light.stopAllActions();
        light.runAction(cc.repeatForever(
            cc.rotateBy(1.1, 100),
        ));

        //按钮设置
        let sureBtn = this.CoinView.getChildByName("Bg").getChildByName("Bg").getChildByName("Sure");
        let sureText = sureBtn.getChildByName("Text").getComponent(cc.Label);
        sureBtn.off(cc.Node.EventType.TOUCH_END);

        let viewCount = 0;
        this.checkDailyCount("coinVideo", false, function (val) {
            viewCount = 5 - val;
            if (viewCount > 0) {
                sureBtn.getComponent(cc.Button).interactable = true;
            } else {
                sureBtn.getComponent(cc.Button).interactable = false;
            }
            if (isCount) {
                sureText.string = "FREE(" + viewCount + ")";
            } else {
                sureText.string = "FREE";
                sureBtn.getComponent(cc.Button).interactable = true;
            }
            sureBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
                if (viewCount > 0 || !isCount) {
                    soundManager.playSound("btnClick");
                    this.onVideoBtnClick(function (isCompleted) {
                        if (isCompleted) {
                            Bg.runAction(
                                cc.sequence(
                                    cc.scaleTo(0.3, 0).easing(cc.easeSineIn(2)),
                                    cc.callFunc(function () {
                                        this.CoinView.active = false;
                                    }.bind(this), this)
                                )
                            )
                        }
                        cb(isCompleted)
                    }.bind(this), isCount);
                }
            }, this);
        }.bind(this));

        var laterBtn = this.CoinView.getChildByName("Bg").getChildByName("Later");
        laterBtn.off(cc.Node.EventType.TOUCH_END);
        laterBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            soundManager.playSound("btnClick");
            cb(false);
            Bg.runAction(
                cc.sequence(
                    cc.scaleTo(0.3, 0).easing(cc.easeSineIn(2)),
                    cc.callFunc(function () {
                        this.CoinView.active = false;
                    }.bind(this), this)
                )
            )
        }, this);
    },

    //视频奖励
    onVideoBtnClick(cb, isCount) {
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
                    if (isCount) {
                        this.checkDailyCount("video", true);
                    }
                } else {
                    console.log("没有观看成功")
                    this.fbFail(1);
                    if (cb != null) {
                        cb(false);
                    }
                }
            }.bind(this)
        );
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
        SDK().getItem("all", function (score) {
            SDK().share(score, function (isCompleted) {
                if (isCompleted) {//分享激励
                    console.log("share:" + score);
                    if (cb != null) {
                        cb(true)
                    }
                } else {
                    this.fbFail(2);
                }
                this.soundManager.audioSource.play();
                this.soundManager.audioSource.loop = true;
            }.bind(this));
        }.bind(this))
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

    //互推按钮事件
    popClick(event, type) {
        SDK().switchGameAsync(type);
    },

    //获取当前时间
    getCurTime(){
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
        var unit = 0;
        while (num >= 10000) {
            num = num * 0.001;
            unit = unit + 1;
        }
        var money = num.toFixed(2);
        return [money, unit, ("$" + money + gameApplication.unitCof[unit].unit),(money + gameApplication.unitCof[unit].unit)];
    }

    // update (dt) {},
});
