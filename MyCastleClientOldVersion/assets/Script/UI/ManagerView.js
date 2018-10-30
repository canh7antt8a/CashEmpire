import { isString } from "util";
cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: {
            default: null,
            type: cc.ScrollView,
        },
        content: {
            default: null,
            type: cc.Node,
        },
        managerUIList: {
            default: [],
            visible: false,
        },
        managerInfoList: {
            default: [],
            visible: false,
        },
        managerCof: {
            default: null,
            visible: false,
        },
        managerItem: {
            default: null,
            type: cc.Node,
        },
        curManagerUI: {
            default: null,
            visible: false,
        },
        getBtn: {
            default: null,
            type: cc.Button,
        },
        getCost: {
            default: null,
            type: cc.Label,
        },
        //当前打开的管家界面第几楼的
        curFloorIdx: {
            default: -1,
            visible: false,
        },
        curInfoIdxList: {
            default: [],
            visible: false,
        },
        //获取管家的价格列表
        priceList: {
            default: [],
            visible: false,
        },
        //是否加载过了
        isLoadData: {
            default: false,
            visible: false,
        },
        //随机客户生成列表
        randomCusCb: {
            default: [],
            visible: false,
        },
        //顾客移动回调列表
        customerCbList: {
            default: [],
            visible: false,
        },
        //顾客回调次数列表
        customerCbTimes: {
            default: [],
            visible: false,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        window.managerScript = this;
        this.curInfoIdxList = [];
        this.curManagerUI = null;
        resManager.loadConfig("ResourceList", function (cof) {
            this.managerCof = cof.managerList;
        }.bind(this));
    },

    start() {
    },

    onEnable() {
        this.schedule(this.refreashVal, 0.25);
    },
    onDisable() {
        this.unschedule(this.refreashVal);
        if (this.isLoadData) {
            if (this.curManagerUI != null) {
                this.curManagerUI.active = false;
            }
        }
    },

    refreashVal() {
        if (this.isLoadData) {
            var cost = this.countRecruitCost();
            this.getCost.string = gameApplication.countUnit(cost)[2];
            if (player.itemArrayGet("pCurrency", 0) >= cost) {
                this.getBtn.interactable = true;
            } else {
                this.getBtn.interactable = false;
            }
            //刷新管家的技能时间
            for (var i = 0; i < this.managerInfoList.length; i = i + 1) {
                var info = this.managerInfoList[i];
                var curUI = null;
                if (info == null && info == undefined || info == "undefined") {
                    continue;
                }
                if (this.managerUIList[i] != null) {
                    curUI = this.managerUIList[i];
                }
                //如果是当前的楼层
                if (info[0] == this.curFloorIdx) {
                    curUI = this.curManagerUI;
                }
                if (curUI != null) {
                    curUI.cdTime.string = this.countSkillCd(info[9]);
                    if (curUI == this.curManagerUI) {
                        if (curUI.cdTime.string == "00:00") {
                            curUI.cdTime.node.active = false;
                            curUI.sBtn.interactable = true;
                        } else {
                            curUI.cdTime.node.active = true;
                            curUI.sBtn.interactable = false;
                        }
                    }
                }
            }
        }
    },

    eventDeal(event, type) {
        soundManager.playSound("btnClick");
        //获取管家
        if (type == "getManager") {
            if (this.managerCof == null) {
                return;
            }
            var cost = this.priceList[event.idx];
            if (player.itemArrayGet("pCurrency", 0) >= cost) {
                var targetManager = this.managerCof[event.idx];
                //扣钱并获得一个管家
                player.itemArrayAdd("pCurrency", 0, -cost, function () {
                    soundManager.playSound("buyManager");
                    //本地自增经理并且储存到远程  -0当前所在楼层 -1类型 -2名字 -3头像 -4LV -5MLV -6ELV -7SLV -8技能结束时间 -9技能CD恢复时间 -10类别中的第几位 -11技能图标
                    var newManager = [event.idx, targetManager.type, targetManager.name, targetManager.pic, -1, 0, 0, 0, 0, 0, event.idx, targetManager.sPic];
                    var idx = event.idx/* this.managerInfoList.length */;
                    //如果该管家的楼层有开启并且没有在营业则开店
                    var node = mainScript.floorList[idx].closeSprite.node;
                    if (node.active && mainScript.floorInfoList[idx] != null && mainScript.floorInfoList[idx] != "undefined" && mainScript.floorInfoList[idx] != undefined) {
                        node.active = false;
                        buildManager.openShop(idx);
                    }
                    player.itemArraySet("myManagers", idx, newManager, function () {
                        this.managerInfoList[idx] = newManager;
                        this.initManagerList();
                        workerScript.loadWorkerItem(idx);
                    }.bind(this));

                    //管家成就
                    player.itemArrayAdd("pAchievement", 0, 1);
                }.bind(this));
            }
        }
    },

    initManagerList(idx) {
        this.managerInfoList = player.getArrayAll("myManagers");
        if (idx != null) {
            this.curFloorIdx = idx;
        }
        var hasOne = false;
        //获取玩家第idx层的管家数据并进行初始化
        for (var i = 0; i < 10; i = i + 1) {
            //判断是否有管家
            if (this.managerInfoList[i] != null && this.managerInfoList[i] != undefined && this.managerInfoList[i] != "undefined") {
                if (idx == null && this.managerInfoList[i][0] != -1) {
                    //加载楼层的管家
                    this.loadFloorManager(i);
                } else {
                    //判断当前管家是否空闲
                    if (this.managerInfoList[i][0] == -1) {
                        this.loadManager(i);
                    }
                    //判断玩家当前第idx层当前是否有使用管家
                    else {
                        //如果是当前的楼层
                        if (this.managerInfoList[i][0] == idx) {
                            hasOne = true;
                            this.loadCurManager(i);
                        }
                        if (this.managerUIList[i] != null) {
                            this.managerUIList[i].active = false;
                        }
                    }
                }
            } else {
                if (mainScript.floorList[i] != null) {
                    mainScript.floorList[i].manager.active = false;
                }
            }

        }
        if (!hasOne && idx != null) {
            cc.find("Bg/CurManager", this.node).active = false;
        }
        this.isLoadData = true;
        this.content.y = 0;
    },

    //加载顾客的模样
    loadCostomer(floorDetail, random, idx) {
        resManager.loadSprite("Customer.customer" + random, function (spriteFrame) {
            floorDetail.cus.spriteFrame = spriteFrame;
            floorDetail.cus.node.active = true;
            floorDetail.cus.sizeMode = cc.Sprite.SizeMode.TRIMMED;
        }.bind(this));

        //顾客活动
        if (this.customerCbList[idx] == null) {
            var time = 3;
            this.customerCbList[idx] = function () {
                var random = Math.random();
                if (random > 0.9 && this.customerCbTimes[idx] != 1) {
                    floorDetail.cus.node.stopAllActions();
                } else {
                    if (this.customerCbTimes[idx] == 1) {
                        floorDetail.cus.node.runAction(cc.fadeIn(2));
                    }
                    var randomVal = Math.random() * ((floorDetail.cus.node.parent.width / 2) - 50);
                    var roVal = 20 * (randomVal / floorDetail.cus.node.parent.width);
                    floorDetail.cus.node.rotation = -0.5 * roVal;
                    if (floorDetail.cus.node.x > 0) {
                        floorDetail.cus.node.scaleX = Math.abs(floorDetail.cus.node.scaleX);
                        floorDetail.cus.node.runAction(
                            cc.spawn(
                                cc.repeat(
                                    cc.sequence(
                                        cc.rotateBy(time / 10, roVal),
                                        cc.rotateBy(time / 10, -roVal)
                                    ), 10
                                ),
                                cc.moveBy(time, cc.p(-randomVal, 0))
                            )
                        )
                    } else {
                        floorDetail.cus.node.scaleX = -Math.abs(floorDetail.cus.node.scaleX);
                        floorDetail.cus.node.runAction(
                            cc.spawn(
                                cc.repeat(
                                    cc.sequence(
                                        cc.rotateBy(time / 10, roVal),
                                        cc.rotateBy(time / 10, -roVal)
                                    ), 10
                                ),
                                cc.moveBy(time, cc.p(randomVal * 0.3, 0))
                            )
                        )
                    }
                }
                this.customerCbTimes[idx] = this.customerCbTimes[idx] + 1;
                if (this.customerCbTimes[idx] == 20) {
                    floorDetail.cus.node.runAction(cc.fadeOut(2));
                }
            }.bind(this);
            this.customerCbTimes[idx] = 1;
            this.schedule(this.customerCbList[idx], time, 20);
        }
    },

    //卸载顾客
    unLoadCustomer() {
        for (var j = 0; j < 10; j = j + 1) {
            if (this.customerCbList[j] != null) {
                //停止当前的移动
                mainScript.floorList[j].cus.node.stopAllActions();
                //隐藏顾客
                mainScript.floorList[j].cus.node.active = false;
                //不进行回调
                this.unschedule(this.customerCbList[j]);
                this.customerCbList[j] = null;
                //放弃进行顾客随机
                this.unschedule(this.randomCusCb[j]);
                this.randomCusCb[j] = null;
            }
        }
    },

    //加载某个管家到楼层(idx是管家的idx)
    loadFloorManager(idx) {
        var floorIdx = this.managerInfoList[idx][0];

        //获取楼层UI信息
        var floorDetail = mainScript.floorList[floorIdx];
        floorDetail.managerIdx = idx;

        var mSkillSprite = floorDetail.mSkillSprite;
        var mSkillUse = floorDetail.mSkillUse;
        var mSkillBg = floorDetail.mSkillBg;
        var mSkillDesc = floorDetail.mSkillDesc;
        var lv = managerScript.judgeLevel(this.managerInfoList[idx]);
        floorDetail.mLevel.string = "LV." + lv;

        if (lv > 1 && (this.randomCusCb[idx] == null || this.randomCusCb[idx] == undefined)) {
            this.randomCusCb[idx] = function () {
                this.customerCbList[idx] = null;
                var arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
                for (i = 0; i < 1; i = i + 1) {
                    //随机抽取一个
                    var ran = Math.floor(Math.random() * arr.length);
                    var center = arr[ran];
                    arr[ran] = arr[arr.length - 1];
                    arr[arr.length - 1] = center;
                    arr = arr.slice(0, arr.length - 1);
                    this.loadCostomer(floorDetail, center, idx);
                }
            }.bind(this);
            this.randomCusCb[idx]();
            this.schedule(this.randomCusCb[idx], 65);
        }
        //训练入口
        var trainIn = floorDetail.mSprite.node;
        trainIn.active = true;
        trainIn.off('click');
        trainIn.on('click', function (event) {
            gameApplication.soundManager.playSound("btnClick");
            this.trainManager(idx);
        }.bind(this), this)

        //技能描述
        mSkillDesc.dataID = this.managerCof[idx].sDesc;

        //设置技能图标
        resManager.loadSprite(this.managerInfoList[idx][11], function (spriteFrame) {
            mSkillSprite.spriteFrame = spriteFrame;
            mSkillSprite.node.active = true;
        }.bind(this));

        //技能按钮
        mSkillSprite.node.off('click');
        mSkillSprite.node.on('click', function (event) {
            gameApplication.soundManager.playSound("btnClick");
            mSkillBg.runAction(cc.scaleTo(0.5, 1).easing(cc.easeBounceOut(2)));
            this.scheduleOnce(function () {
                mSkillBg.runAction(cc.scaleTo(0.3, 0).easing(cc.easeBackIn(2)));
            }.bind(this), 3);
        }.bind(this), this)

        //激活技能按钮
        mSkillUse.off('click');
        mSkillUse.on('click', function (event) {
            gameApplication.soundManager.playSound("btnClick");
            this.useSkill(idx);
            mSkillBg.runAction(cc.scaleTo(0.3, 0).easing(cc.easeBackIn(2)));
        }.bind(this), this)

        //设置楼层管家的样子
        var body = floorDetail.manager.getComponent(dragonBones.ArmatureDisplay);
        var name = "Manager/m" + idx/* this.managerInfoList[idx][1] + "/" + this.managerInfoList[idx][10] */;

        //floorDetail.mSprite.node.active = false;
        resManager.loadBone(name, function (bone) {
            if (bone == null || bone.length == 0) {
                return;
            }
            body.dragonAsset = bone[0];
            body.dragonAtlasAsset = bone[3];
            floorDetail.manager.active = true;
            body.armatureName = 'armatureName';
            /* var random = Math.random();
            if (random > 0.5) {
                random = 1;
            } else {
                random = 2;
            } */
            body.playAnimation("standby", -1);
            /* if (body.cbFunction == null) {
                body.cbFunction = function () {
                    body.armatureName = 'armatureName';
                    var random = Math.random();
                    if (random > 0.5) {
                        random = 1;
                    } else {
                        random = 2;
                    }
                    body.playAnimation("standby", 1);
                }.bind(this)
                body.schedule(body.cbFunction, 1)
            } */
        }.bind(this));
    },

    //加载当前楼层的管家
    loadCurManager(idx) {
        var info = this.managerInfoList[idx];
        this.curInfoIdxList[this.curFloorIdx] = idx;
        var curItem = this.curManagerUI;
        if (curItem == null) {
            curItem = cc.find("Bg/CurManager", this.node);
            this.curManagerUI = curItem;
            //管家头像
            this.curManagerUI.head = cc.find("Head", curItem).getComponent(cc.Sprite);

            //管家等级
            this.curManagerUI.level = cc.find("Level/Val", curItem).getComponent(cc.Label);

            //管家姓名
            this.curManagerUI.mName = cc.find("Name/Val", curItem).getComponent(cc.Label);

            //管家能力
            this.curManagerUI.power = cc.find("Power/Val", curItem).getComponent("LocalizedLabel");

            //管家技能图片
            this.curManagerUI.sSprite = cc.find("Skill/Sprite", curItem).getComponent(cc.Sprite);

            //管家技能按钮
            this.curManagerUI.sBtn = cc.find("Skill/Sprite", curItem).getComponent(cc.Button);

            //管家技能描述
            this.curManagerUI.sDesc = cc.find("Skill/Desc", curItem).getComponent("LocalizedLabel");

            //管家技能冷却时间
            this.curManagerUI.cdTime = cc.find("Skill/Time", curItem).getComponent(cc.Label);

            //撤下按钮
            this.curManagerUI.withdrawBtn = cc.find("Withdraw", curItem);
        }
        var head = this.curManagerUI.head;
        var level = this.curManagerUI.level;
        var mName = this.curManagerUI.mName;
        var power = this.curManagerUI.power;
        var sSprite = this.curManagerUI.sSprite;
        var sDesc = this.curManagerUI.sDesc;
        var cdTime = this.curManagerUI.cdTime;
        var withdrawBtn = this.curManagerUI.withdrawBtn;
        //设置管家头像
        resManager.loadSprite(info[3], function (spriteFrame) {
            head.spriteFrame = spriteFrame;
        }.bind(this));
        level.string = "LV." + this.judgeLevel(info);
        mName.string = info[2];
        power.dataID = this.managerCof[idx].desc;
        cdTime.string = this.countSkillCd(info[9]);

        //设置技能图标
        resManager.loadSprite(info[11], function (spriteFrame) {
            sSprite.spriteFrame = spriteFrame;
        }.bind(this));

        sSprite.node.off('click');
        sSprite.node.on('click', function (event) {
            gameApplication.soundManager.playSound("btnClick");
            this.useSkill(idx);
        }.bind(this), this)

        sDesc.dataID = this.managerCof[idx].sDesc;

        withdrawBtn.off("click");
        withdrawBtn.on("click", function (event) {
            gameApplication.soundManager.playSound("btnClick");
            this.withDrawManager(this.curFloorIdx);
        }.bind(this), this)

        curItem.active = true;
    },

    //加载某个拥有的管家
    loadManager(idx) {
        var info = this.managerInfoList[idx];
        //缓存的数组获取，否则创建
        var curItem = this.managerUIList[idx];
        if (curItem == null) {
            curItem = cc.instantiate(this.managerItem);
            this.managerUIList[idx] = curItem;
            //管家头像
            this.managerUIList[idx].head = cc.find("Head", curItem).getComponent(cc.Sprite);

            //管家等级
            this.managerUIList[idx].level = cc.find("Level/Val", curItem).getComponent(cc.Label);

            //管家姓名
            this.managerUIList[idx].mName = cc.find("Name/Val", curItem).getComponent(cc.EditBox);

            //管家能力
            this.managerUIList[idx].power = cc.find("Power/Val", curItem).getComponent("LocalizedLabel");

            //管家技能冷却时间
            this.managerUIList[idx].cdTime = cc.find("SkillCD/Val", curItem).getComponent(cc.Label);

            //使用按钮
            this.managerUIList[idx].useBtn = cc.find("Use", curItem);

            //培训按钮
            this.managerUIList[idx].trainBtn = cc.find("Train", curItem);

            //售出按钮
            this.managerUIList[idx].fireBtn = cc.find("Fire", curItem);
        }
        var head = this.managerUIList[idx].head;
        var level = this.managerUIList[idx].level;
        var mName = this.managerUIList[idx].mName;
        var power = this.managerUIList[idx].power;
        var cdTime = this.managerUIList[idx].cdTime;
        var useBtn = this.managerUIList[idx].useBtn;
        var trainBtn = this.managerUIList[idx].trainBtn;
        var fireBtn = this.managerUIList[idx].fireBtn;

        //设置管家头像
        resManager.loadSprite(info[3], function (spriteFrame) {
            head.spriteFrame = spriteFrame;
        }.bind(this));

        level.string = "LV." + this.judgeLevel(info);

        mName.string = info[2];
        mName.node.off('editing-did-ended');
        mName.node.on('editing-did-ended', function (event) {
            gameApplication.soundManager.playSound("btnClick");
            this.reNameManager(idx, event.string);
        }.bind(this), this)

        power.dataID = this.managerCof[idx].desc;

        cdTime.string = this.countSkillCd(info[9]);

        useBtn.off('click');
        useBtn.on('click', function (event) {
            gameApplication.soundManager.playSound("btnClick");
            this.appointmentManager(idx);
        }.bind(this), this)

        trainBtn.off('click');
        trainBtn.on('click', function (event) {
            gameApplication.soundManager.playSound("btnClick");
            this.trainManager(idx);
        }.bind(this), this)

        fireBtn.off('click');
        fireBtn.on('click', function (event) {
            gameApplication.soundManager.playSound("btnClick");
            this.fireManager(idx);
        }.bind(this), this)

        curItem.parent = this.content;
        curItem.active = true;
    },

    //重命名一个经理
    reNameManager(idx, name) {
        var newManager = this.managerInfoList[idx];
        //技能结束时间
        newManager[2] = name;
        this.managerInfoList[idx] = newManager;
        player.itemArraySet("myManagers", idx, newManager, function () {
            this.initManagerList(this.curFloorIdx);
        }.bind(this));
    },

    //任命一个管理
    appointmentManager(idx) {
        this.withDrawManager(this.curFloorIdx, function () {
            var newManager = this.managerInfoList[idx];
            newManager[0] = this.curFloorIdx;
            this.managerInfoList[idx] = newManager;
            this.loadFloorManager(idx);
            player.itemArraySet("myManagers", idx, newManager);
            this.initManagerList(this.curFloorIdx);
        }.bind(this))
    },

    //撤下一个管理
    withDrawManager(idx, cb) {
        //如果当前楼层有管理者
        if (this.curInfoIdxList[idx] != -1 && this.curInfoIdxList[idx] != null) {
            //根据他的idx获取他
            var oldManager = this.managerInfoList[this.curInfoIdxList[idx]];
            //确定是有管家在某楼层，撤下来
            if (oldManager[0] != -1) {
                mainScript.floorList[idx].manager.getComponent(dragonBones.ArmatureDisplay).dragonAsset = null;
                mainScript.floorList[oldManager[0]].mSprite.node.active = true;
                mainScript.floorList[oldManager[0]].mSkillSprite.node.active = false;
                //设置店面图片
                mainScript.floorList[oldManager[0]].managerIdx = null;
            }
            //管家闲置
            oldManager[0] = -1;

            //确定改变管家数值并保存回调
            this.managerInfoList[this.curInfoIdxList[idx]] = oldManager;
            player.itemArraySet("myManagers", this.curInfoIdxList[idx], oldManager, function () {
                if (cb != null) {
                    cb();
                } else {
                    this.initManagerList(this.curFloorIdx);
                }
            }.bind(this));
        } else {
            if (cb != null) {
                cb();
            }
        }
    },

    //培训一个管理
    trainManager(idx) {
        viewManager.popView("TrainManagerView", true, function (view) {
            //初始化
            view.getComponent("TrainManagerView").loadInfo(idx);
        }.bind(this));
    },

    //解雇一个管理
    fireManager(idx) {
        this.managerUIList[idx].active = false;
        this.managerInfoList.splice(idx, 1);
        var array = new Array(this.managerInfoList);
        player.setArrayAll("myManagers", array, function () {
            player.itemArrayAdd("pCurrency", 0, 500);
            this.initManagerList(this.curFloorIdx);
        }.bind(this))
    },

    //使用一个技能
    useSkill(idx) {
        var newManager = this.managerInfoList[idx];
        newManager[8] = this.countSkillTime(idx);
        newManager[9] = this.countSkillReviveTime(idx);
        this.managerInfoList[idx] = newManager;
        player.itemArraySet("myManagers", idx, newManager);
    },

    //判断等级
    judgeLevel(info) {
        for (var i = 0; i < 100; i = i + 1) {
            if (parseInt(info[5]) < i) {
                break;
            }
            if (parseInt(info[6]) < i) {
                break;
            }
            if (parseInt(info[7]) < i) {
                break;
            }
            info[4] = i;
        }
        return info[4] + 1;
    },

    //计算技能恢复的时间
    countSkillReviveTime(idx) {
        var eLV = this.managerInfoList[idx][6];
        var time = gameApplication.getCurTime();
        var val = 3600 * Math.pow(0.9, eLV);
        time = time + val;
        return time;
    },

    //计算CD
    countSkillCd(endTime) {
        var now = gameApplication.getCurTime();
        var time = endTime - now;
        var string = "";
        if (time <= 0) {
            string = "00:00";
        } else {
            var data = gameApplication.countTime(time);
            string = data[0];
        }
        return string;
    },

    //计算技能的结束时间
    countSkillTime(idx) {
        var sLV = this.managerInfoList[idx][7];
        var time = gameApplication.getCurTime();
        var val = 60 * Math.pow(1.1, sLV);
        time = time + val;
        return time;
    },

    //计算技能效果
    countSkillEffect(base, mLV) {
        var total = base * Math.pow(1.1, mLV);
        return total;
    },

    //计算当前招募价格
    countRecruitCost() {
        var cost = 500;
        for (var i = 0; i < this.managerInfoList.length; i = i + 1) {
            cost = cost * 5;
        }
        return cost;
    },

    // update (dt) {},
});
