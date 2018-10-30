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
            type: cc.Node,
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
        //是否初始化成就
        achieveInited: {
            default: false,
            visible: false,
        },
        //里程碑滚动界面
        milepostView: {
            default: null,
            type: cc.Node,
        },
        //滚动体
        milepostContent: {
            default: null,
            type: cc.Node,
        },
        //里程碑预制件
        milepostItem: {
            default: null,
            type: cc.Node,
        },
        //里程碑UI存储列表
        milepostList: {
            default: [],
            visible: false,
        },
        //里程碑配置存储列表
        milepostInfoList: {
            default: [],
            visible: false,
        },
        //总等级
        totalLevel: {
            default: 0,
            visible: false,
        },
        //里程碑商店小图标
        storeSpList: {
            default: [],
            visible: false,
        },
        //是否初始化里程碑
        milepostInited: {
            default: false,
            visible: false,
        },
        //目标列表
        targetList: {
            default: [],
            visible: false,
        },
        //滚动体
        selectContent: {
            default: null,
            type: cc.Node,
        },
        //预制件
        selectItem: {
            default: null,
            type: cc.Node,
        },
        //选项UI存储列表
        selectList: {
            default: [],
            visible: false,
        },
        //信息存储列表
        selectInfo: {
            default: {},
            visible: false,
        },
        isInit: {
            default: false,
            visible: false,
        },
        achieveMark: {
            default: null,
            type: cc.Node,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        resManager.loadConfig("AchieveList", function (cof) {
            //成就的信息
            this.achieveInfoList = cof.achieveList;
            this.achieveFinishList = player.getArrayAll("pAchievement");
            this.targetList = cof.targetList;

            //里程碑信息
            this.milepostInfoList = [];

            this.initSelectList(0);
            //this.initSelectList(1);
            this.getStoreList();
            this.initView();
            //this.initList(1);
            this.initList(0);
        }.bind(this));
    },

    start() {
        this.node.script = this;
        var spaceX = this.milepostContent.width - (this.milepostItem.width * 2);
        this.milepostContent.getComponent(cc.Layout).spacingX = spaceX;
    },

    onEnable() {
        if (this.isInit) {
            //this.initList(1);
            this.initList(0);
            this.refreashVal();
        }
        this.schedule(this.refreashVal, 0.5);
    },

    onDisable() {
        //this.unschedule(this.refreashVal);
    },


    //刷新日期
    initView(cb) {
        var curDay = cc.find("Bg/Detail/DataBg/Date", this.node).getComponent(cc.Label);
        var today = new Date();
        var mouth = (today.getMonth() + 1) < 10 ? "0" + (today.getMonth() + 1) : (today.getMonth() + 1);
        var day = today.getDate() < 10 ? "0" + today.getDate() : today.getDate();
        curDay.string = mouth + "/" + day;
        
        if(cb!=null){
            cb();
        }
    },


    //获取店铺小图标列表
    getStoreList() {
        for (var i = 0; i < 10; i = i + 1) {
            this.storeSpList[i] = cc.find("Total/StoreList/Store" + i, this.milepostView);
            this.storeSpList[i].color = cc.color(88, 88, 88, 255);
        }
        this.storeSpList[10] = cc.find("Total/All/Level/Num", this.milepostView).getComponent(cc.Label);
    },


    //刷新数据
    refreashVal() {
        if (!this.isInit) {
            return;
        }
        //里程碑
        if (this.milepostInited) {
            for (var idx = 0; idx < 10; idx = idx + 1) {
                this.setProsVal(idx, 1);
            }
            this.totalLevel = 100000;
            for (var idx = 0; idx < 10; idx = idx + 1) {
                if (mainScript.floorInfoList[idx] != null && mainScript.floorInfoList[idx] != "undefined" && mainScript.floorInfoList[idx] != undefined) {
                    var level = mainScript.floorInfoList[idx][2];
                    if (level < this.totalLevel) {
                        this.totalLevel = level;
                    }
                } else {
                    this.totalLevel = 0;
                }
            }
            this.totalLevel = this.totalLevel + 1;
            this.storeSpList[10].string = this.totalLevel;
            for (var idx = 0; idx < 10; idx = idx + 1) {
                if (mainScript.floorInfoList[idx] != null && mainScript.floorInfoList[idx] != "undefined" && mainScript.floorInfoList[idx] != undefined) {
                    var level = mainScript.floorInfoList[idx][2];
                    if (level >= this.totalLevel) {
                        this.storeSpList[idx].color = cc.color(255, 255, 255, 255);
                    } else {
                        this.storeSpList[idx].color = cc.color(88, 88, 88, 255);
                    }
                } else {
                    this.storeSpList[idx].color = cc.color(88, 88, 88, 255);
                }
            }
        }
        this.checkMark = 0;
        //成就
        if (this.achieveInited) {
            for (var idx = 0; idx < this.achieveList.length; idx = idx + 1) {
                this.setProsVal(idx, 0);
            }
        }
        if (this.achieveMark != null) {
            if (this.checkMark > 0) {
                this.achieveMark.active = true;
                mainScript.achieveMark.active = true;
            } else {
                this.achieveMark.active = false;
                mainScript.achieveMark.active = false;
            }
        }
    },

    //设置进度条
    setProsVal(idx, type) {
        //处理成就
        if (type == 0) {
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
                this.checkMark++;
            } else {
                this.achieveList[idx].getBtn.interactable = false;
            }
        }
        //处理里程碑 
        else {
            if (mainScript.floorInfoList[idx] != null && mainScript.floorInfoList[idx] != "undefined" && mainScript.floorInfoList[idx] != undefined) {
                var level = mainScript.floorInfoList[idx][2];
                var exp = mainScript.floorInfoList[idx][3];
                var levelMax;
                if (level > 4) {
                    levelMax = buildManager.levelConfig.level[4] + (level - 4) * 100;
                } else {
                    levelMax = buildManager.levelConfig.level[level];
                }
                this.milepostList[idx].prosVal.string = exp + "/" + levelMax;
                this.milepostList[idx].pros.progress = exp / levelMax;
                this.milepostList[idx].level.string = level + 1;
            } else {
                this.milepostList[idx].prosVal.string = 0 + "/" + 10;
                this.milepostList[idx].pros.progress = 0 / 10;
                this.milepostList[idx].level.string = 1;
            }
        }

    },

    //初始化类别选择列表
    initSelectList(idx) {
        var curItem = this.selectList[idx];
        if (curItem == null) {
            curItem = cc.instantiate(this.selectItem);
            this.selectList[idx] = curItem;
        }
        //绑定点击事件
        curItem.on("toggle", function (event) {
            this.menuClick(event, "select");
        }.bind(this), this)

        //初始化类型名称
        var name1 = cc.find("checkmark/Name", curItem).getComponent("LocalizedLabel");
        var name2 = cc.find("Background/Name", curItem).getComponent("LocalizedLabel");
        name1.dataID = "lang.achieveType" + idx;
        name2.dataID = "lang.achieveType" + idx;

        this.achieveMark = cc.find("Mark", curItem);

        //放入列表并显示
        curItem.parent = this.selectContent;
        curItem.idx = idx;
        //curItem.active = true;
        this.isInit = true;
    },


    //初始化列表
    initList(idx) {
        //获取列表信息并加载
        var infoList;
        var curView;
        if (idx == 1) {
            curView = this.achieveView;
            infoList = this.achieveInfoList;
        } else if (idx == 0) {
            curView = this.milepostView;
            infoList = this.milepostInfoList;
            infoList.length = 10;
        }
        this.achieveView.active = false;
        this.milepostView.active = false;
        for (var i = 0; i < infoList.length; i = i + 1) {
            if (idx == 1) {
                this.loadAchieveItem(i);
            } else if (idx == 0) {
                this.loadmilepostItem(i);
            }
        }
        curView.active = true;
        var toggle = this.selectList[idx].getComponent(cc.Toggle);
        toggle.check();
        if (idx == 1) {
            this.achieveInited = true;
        } else {
            this.milepostInited = true;
        }
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

        //成就描述
        desc.dataID = info.desc + "L" + lv;

        curItem.parent = this.achieveContent;
        curItem.active = true;
    },

    //加载里程碑信息
    loadmilepostItem(idx) {
        var info = this.milepostInfoList[idx];
        if (this.milepostList[idx] == null) {
            this.milepostList[idx] = {};
        }
        var curItem = this.milepostList[idx].curItem;
        if (curItem == null) {
            curItem = cc.instantiate(this.milepostItem);
            this.milepostList[idx].curItem = curItem;
            this.milepostList[idx].showSprite = cc.find("Sprite", curItem).getComponent(cc.Sprite);
            this.milepostList[idx].name = cc.find("Name", curItem).getComponent(cc.Label);
            this.milepostList[idx].desc = cc.find("Description/Text", curItem).getComponent("LocalizedLabel");
            this.milepostList[idx].pros = cc.find("Level/Progress/Pro", curItem).getComponent(cc.ProgressBar);
            this.milepostList[idx].pros.totalLength = this.milepostList[idx].pros.node.width;
            this.milepostList[idx].prosVal = cc.find("Level/Progress/Text", curItem).getComponent(cc.Label);
            this.milepostList[idx].level = cc.find("Level/Level/Num", curItem).getComponent(cc.Label);
        }
        var showSprite = this.milepostList[idx].showSprite;
        var name = this.milepostList[idx].name;
        var desc = this.milepostList[idx].desc;
        var pros = this.milepostList[idx].pros;

        pros.progress = 0;

        //读取图片信息
        resManager.loadSprite("SpAchievement.store" + idx, function (spriteFrame) {
            showSprite.spriteFrame = spriteFrame;
        }.bind(this));

        //店铺名称
        resManager.loadConfig("ResourceList", function (cof) {
            name.string = cof.storeList[idx].name;
        });

        //库存描述
        desc.dataID = "lang.milepostDesc";

        curItem.parent = this.milepostContent;
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
            /* player.itemArraySet("pAchievement", idx, lv + 1, function () {
                if(targetIdx == 0){
                    effectManager.flyReward(10, 0, mainScript.coins.node, this.achieveList[idx].curItem, null, true);
                }else if(targetIdx == 1){
                    effectManager.flyReward(10, 1, mainScript.diamonds.node, this.achieveList[idx].curItem, null, true);
                }
                player.itemArrayAdd(targetName, targetIdx, rNum);
                this.loadAchieveItem(idx);
            }.bind(this)); */
        }
    },

    //按钮点击事件
    menuClick(event, type) {
        soundManager.playSound("btnClick");
        if (type == "select") {
            this.initList(event.target.idx);
        }
    }

    //start() {},

    // update (dt) {},
});
