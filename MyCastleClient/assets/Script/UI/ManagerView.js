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
        curFloorIdx: {
            default: -1,
            visible: false,
        },
        curInfoIdxList: {
            default: [],
            visible: false,
        },
        isLoadData: {
            default: false,
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
                if (this.managerUIList[i] != null) {
                    curUI = this.managerUIList[i];
                }
                //如果是当前的楼层
                if (this.managerInfoList[i][0] == this.curFloorIdx) {
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
            var cost = this.countRecruitCost();
            if (player.itemArrayGet("pCurrency", 0) >= cost) {
                //类型选取
                var random = Math.random() * 3;
                if (random == 0) {
                    random = 0.1;
                }
                random = Math.floor(random);
                //个别选取
                var targetManager = null;
                var select = Math.random() * this.managerCof[random].length;
                if (select == 0) {
                    select = 0.1;
                }
                select = Math.floor(select);
                targetManager = this.managerCof[random][select];
                targetManager.type = random;

                //扣钱并获得一个管家
                player.itemArrayAdd("pCurrency", 0, -cost, function () {
                    //本地自增经理并且储存到远程  -0当前所在楼层 -1类型 -2名字 -3头像 -4LV -5MLV -6ELV -7SLV -8技能结束时间 -9技能CD恢复时间 -10类别中的第几位 -11技能图标
                    var newManager = [-1, targetManager.type, targetManager.name, targetManager.pic, -1, 0, 0, 0, 0, 0, select, targetManager.sPic];
                    var idx = this.managerInfoList.length;
                    player.itemArraySet("myManagers", idx, newManager, function () {
                        this.managerInfoList[idx] = newManager;
                        this.initManagerList();
                    }.bind(this));
                }.bind(this));
            }
        }
    },

    initManagerList(idx) {
        if (idx != null) {
            this.curFloorIdx = idx;
        }
        var hasOne = false;
        //获取玩家第idx层的管家数据并进行初始化
        for (var i = 0; i < this.managerInfoList.length; i = i + 1) {
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
        }
        if (!hasOne && idx != null) {
            cc.find("Bg/CurManager", this.node).active = false;
        }
        this.isLoadData = true;
        this.content.y = 0;
    },

    //加载某个管家到楼层(idx是管家的idx)
    loadFloorManager(idx) {
        var floorIdx = this.managerInfoList[idx][0];
        mainScript.floorList[floorIdx].managerIdx = idx;

        //设置楼层管家的样子
        var body = mainScript.floorList[floorIdx].manager.getComponent(dragonBones.ArmatureDisplay);
        var name = this.managerInfoList[idx][1] + "/" + this.managerInfoList[idx][10];

        mainScript.floorList[floorIdx].mSprite.node.active = false;
        resManager.loadBone(name, function (bone) {
            if (bone == null || bone.length == 0) {
                return;
            }
            body.dragonAsset = bone[0];
            body.dragonAtlasAsset = bone[3];
            if (body.cbFunction == null) {
                body.cbFunction = function () {
                    body.armatureName = 'armatureName';
                    var random = Math.random();
                    if (random > 0.5) {
                        random = 1;
                    } else {
                        random = 2;
                    }
                    body.playAnimation('action' + random, 1);
                }.bind(this)
                body.schedule(body.cbFunction, 3)
            }
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
        power.dataID = this.managerCof[info[1]][info[10]].desc;
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

        sDesc.dataID = this.managerCof[info[1]][info[10]].sDesc;

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
            console.log(111, idx, event.string);
            gameApplication.soundManager.playSound("btnClick");
            this.reNameManager(idx, event.string);
        }.bind(this), this)

        power.dataID = this.managerCof[info[1]][info[10]].desc;

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
        dataManager.setStoreArray("myManagers", array, function () {
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
        var time = new Date().getTime() / 1000;
        var val = 3600 * Math.pow(0.99, eLV);
        time = time + val;
        return time;
    },

    //计算CD
    countSkillCd(endTime) {
        var now = new Date().getTime() / 1000;
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
        var time = new Date().getTime() / 1000;
        var val = 60 * Math.pow(1.01, sLV);
        time = time + val;
        return time;
    },

    //计算技能效果
    countSkillEffect(base, mLV) {
        var total = base * Math.pow(1.01, mLV);
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
