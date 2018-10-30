import { isNumber, isString } from "util";

cc.Class({
    extends: cc.Component,

    properties: {
        //数组数据列表
        itemArrayList: {
            default: {},
            visible: false,
        },
        //数据列表
        dataList: {
            default: {},
            visible: false,
        },
        //姓名
        pName: {
            default: "",
            visible: false,
        },
        //性别
        pSex: {
            default: 0,
            type: cc.Integer,
            visible: false,
        },
        //年龄
        pAge: {
            default: 0,
            type: cc.Integer,
            visible: false,
        },
        //头像
        pAvatar: {
            default: "",
            visible: false,
        },
        //用户Id
        pId: {
            default: 0,
            type: cc.Integer,
            visible: false,
        },
        //世界id
        worldId: {
            default: 0,
            type: cc.Integer,
            visible: false,
        },
        fbPlayer: {
            default: null,
            visible: false,
        },
        playerCof: {
            default: null,
            visible: false,
        },
        config: {
            default: null,
            visible: false,
        },
        playerInitData: {
            default: null,
            visible: false,
        },
        initData: {
            default: null,
            visible: false,
        },
        fristInitPros: {
            default: 0,
            visible: false,
        },
        InitPros: {
            default: 0,
            visible: false,
        },
        isLoadRes: {
            default: false,
            visible: false,
        },
        isFirstCome: {
            default: false,
            visible: false,
        },
    },

    //第一次进游戏则不需要再更新
    firstIncheckUpdata() {
        var version = ["V1.0.2", "V1.0.3", "V1.0.4", "V1.0.5"];
        //更新完毕
        var item = {};
        item[version[0]] = 1;
        SDK().setItem(item);
        //更新完毕
        var item = {};
        item[version[1]] = 1;
        SDK().setItem(item);
        //更新完毕
        var item = {};
        item[version[2]] = 1;
        SDK().setItem(item);
    },

    //版本数据更新处理
    updataVersion(cb) {
        var version = ["V1.0.2", "V1.0.3", "V1.0.4", "V1.0.5"];
        this.updataPros = [0, 0, 0, 0];//每个版本的进度
        this.updataAllPros = 0;//总进度
        //回调函数
        var checkProsUpdata = function () {
            this.updataAllPros = this.updataAllPros + 1;
            if (this.updataAllPros == version.length) {
                console.log("updata success");
                if (cb != null) {
                    cb();
                }
            }
        }.bind(this)

        //新增了pBuilding,pBuildingTime字段
        SDK().getItem(version[0], function (val) {
            //是否需要进行更新
            if (val == 0 || val == null) {
                //内容
                var updataLength = 2;
                var checkPros = function () {
                    this.updataPros[0] = this.updataPros[0] + 1;
                    if (this.updataPros[0] == updataLength) {
                        console.log("updata " + version[0] + "success");
                        checkProsUpdata();
                    }
                }.bind(this)
                resManager.loadConfig("PlayerFirstData", function (cof) {
                    this.playerCof = cof.playerFirstData;
                    for (var i = 4; i < 6; i = i + 1) {
                        dataManager.setStoreArray(this.playerCof[i].name, this.playerCof[i].array, function () {
                            checkPros();
                        }.bind(this));
                    }
                    //更新完毕
                    var item = {};
                    item[version[0]] = 1;
                    SDK().setItem(item);
                }.bind(this))
            } else {
                checkProsUpdata();
            }
        }.bind(this))

        //新增了CircleCount,CircleTime字段，以及单独世界的AdBuffTime字段
        SDK().getItem(version[1], function (val) {
            //是否需要进行更新
            if (val == 0 || val == null) {
                //内容
                var updataLength = 3;
                var checkPros = function () {
                    this.updataPros[1] = this.updataPros[1] + 1;
                    if (this.updataPros[1] == updataLength) {
                        console.log("updata" + version[1] + " success");
                        checkProsUpdata();
                    }
                }.bind(this)
                resManager.loadConfig("PlayerFirstData", function (cof) {
                    this.playerCof = cof.playerFirstData;
                    for (var i = 6; i < 8; i = i + 1) {
                        dataManager.setStoreArray(this.playerCof[i].name, this.playerCof[i].array, function () {
                            checkPros();
                        }.bind(this));
                    }
                    //更新完毕
                    var item = {};
                    item[version[1]] = 1;
                    SDK().setItem(item);
                }.bind(this))
                resManager.loadConfig("FirstData", function (cof) {
                    this.config = cof.firstData;
                    //AdBuffTime
                    for (var i = 11; i < 12; i = i + 1) {
                        //数组数据
                        if (this.config[i].array != undefined) {
                            var name = this.worldId + "-" + this.config[i].name;
                            dataManager.setStoreArray(name, this.config[i].array, function () {
                                checkPros();
                            }.bind(this));
                        }
                        //单个数据
                        else {
                            //console.log("deVal " + this.config[i].name + this.config[i].deVal)
                            this.setData(this.config[i].name, this.config[i].deVal, function () {
                                checkPros();
                            }.bind(this))
                        }
                    }
                }.bind(this));
            } else {
                checkProsUpdata();
            }
        }.bind(this))

        //将字段"preSkill","gainPre","goodSkills","goodSkillsTime"从独立楼层移到共享
        SDK().getItem(version[2], function (val) {
            //是否需要进行更新
            if (val == 0 || val == null) {
                //内容
                var updataLength = 4;
                var checkPros = function () {
                    this.updataPros[2] = this.updataPros[2] + 1;
                    if (this.updataPros[2] == updataLength) {
                        console.log("updata" + version[2] + " success");
                        checkProsUpdata();
                    }
                }.bind(this)
                resManager.loadConfig("PlayerFirstData", function (cof) {
                    this.playerCof = cof.playerFirstData;
                    for (var i = 8; i < 12; i = i + 1) {
                        dataManager.setStoreArray(this.playerCof[i].name, this.playerCof[i].array, function () {
                            checkPros();
                        }.bind(this));
                    }
                    //更新完毕
                    var item = {};
                    item[version[2]] = 1;
                    SDK().setItem(item);
                }.bind(this))
            } else {
                checkProsUpdata();
            }
        }.bind(this))

        //将字段"pAchievement"数组数量从5个增加到7个
        SDK().getItem(version[3], function (val) {
            //是否需要进行更新
            if (val == 0 || val == null) {
                //内容
                var updataLength = 1;
                var checkPros = function () {
                    this.updataPros[3] = this.updataPros[3] + 1;
                    if (this.updataPros[3] == updataLength) {
                        console.log("updata" + version[3] + " success");
                        //更新完毕
                        var item = {};
                        item[version[3]] = 1;
                        SDK().setItem(item);

                        checkProsUpdata();
                    }
                }.bind(this)
                resManager.loadConfig("PlayerFirstData", function (cof) {
                    this.playerCof = cof.playerFirstData;
                    dataManager.setStoreArray(this.playerCof[3].name, this.playerCof[3].array, function () {
                        checkPros();
                    }.bind(this));
                }.bind(this))
            } else {
                checkProsUpdata();
            }
        }.bind(this))
    },

    onLoad() {
        window.player = this;
        this.fbPlayer = SDK().getSelfInfo();
        resManager.loadConfig("ResourceList", function (cof) {
            this.initData = cof.initData;
            SDK().getItem("isFirst", function (val) {
                //是否第一次进入游戏
                if (val == 0 || val == null) {
                    this.isFirstCome = true;
                    this.firstPlayerData(function () {
                        this.initPlayerInfo();
                        this.firstIncheckUpdata();
                        SDK().setItem({ isFirst: 1 });
                    }.bind(this));
                } else {
                    //更新版本
                    this.updataVersion(function () {
                        //加载用户数据
                        this.initPlayerInfo();
                    }.bind(this));
                }
            }.bind(this))
        }.bind(this));
    },

    //初始化用户数据
    firstPlayerData(cb) {
        //新手引导数据
        SDK().setItem({ guideStep: -1 });
        cc.sys.localStorage.setItem('guideStep', -1);

        this.fristInitPros = 0;
        resManager.loadConfig("PlayerFirstData", function (cof) {
            //获取配置信息的数据列表
            this.playerCof = cof.playerFirstData;
            var checkPros = function () {
                this.fristInitPros = this.fristInitPros + 1;
                if (this.fristInitPros == this.playerCof.length) {
                    if (cb != null) {
                        console.log("playerFirstData success");
                        cb();
                    }
                }
            }.bind(this)

            //货币 分数 道具 成就完成情况
            for (var i = 0; i < this.playerCof.length; i = i + 1) {
                dataManager.setStoreArray(this.playerCof[i].name, this.playerCof[i].array, function () {
                    checkPros();
                }.bind(this));
            }
        }.bind(this));
    },

    //加载用户数据
    initPlayerInfo() {
        //货币 分数 道具 成就完成情况 个人信息等等
        resManager.loadConfig("ResourceList", function (cof) {
            this.playerInitData = cof.playerInitData;
            this.fristInitPros = 0;
            var checkInitPros = function () {
                this.fristInitPros = this.fristInitPros + 1;
                if (this.fristInitPros == this.playerInitData.length) {
                    console.log("initPlayer success");
                    this.isLoadRes = true;
                    //换楼才用--------------------
                    /* worldScript.initBuilding(); */

                    //不换楼用--------------------
                    worldScript.selectWorld(0);
                }
            }.bind(this)
            for (var i = 0; i < this.playerInitData.length; i = i + 1) {
                dataManager.getStoreArray(this.playerInitData[i], function (list, name) {
                    //console.log(name, list)
                    this.itemArrayList[name] = list;
                    checkInitPros();
                }.bind(this));
            }
        }.bind(this));

        //姓名
        SDK().getItem("pName", function (name) {
            if (name != 0 && name != null && name != "") {
                this.setName(name);
            } else {
                this.setName(this.fbPlayer.name);
            }
        }.bind(this), 1);

        //性别
        SDK().getItem("pSex", function (sex) {
            if (sex != null && sex != "") {
                this.setSex(sex);
            } else {
                this.setSex(0);
            }
        }.bind(this), 1);

        //年龄
        SDK().getItem("pAge", function (age) {
            if (age != null && age != "") {
                this.setAge(age);
            } else {
                this.setAge(0);
            }
        }.bind(this), 1);

        //头像
        SDK().getItem("pAvatar", function (avatar) {
            if (avatar != null && avatar != "") {
                this.setAvatar(avatar);
            }
        }.bind(this), 1);

        //id
        this.setID();
    },

    //初始化单独世界数据
    firstData(cb) {
        this.InitPros = 0;
        resManager.loadConfig("FirstData", function (cof) {
            this.config = cof.firstData;
            //获取配置信息的数据列表
            var checkPros = function () {
                this.InitPros = this.InitPros + 1;
                if (this.InitPros == this.config.length) {
                    if (cb != null) {
                        console.log("firstData success");
                        cb();
                    }
                }
            }.bind(this)
            //楼层信息 楼层开店时间 管家信息 声望技能使用时间 金币购买的声望冷却时间 商品技能使用状态 商品技能使用结束时间
            for (var i = 0; i < this.config.length; i = i + 1) {
                //数组数据
                if (this.config[i].array != undefined) {
                    var name = this.worldId + "-" + this.config[i].name;
                    dataManager.setStoreArray(name, this.config[i].array, function () {
                        checkPros();
                    }.bind(this));
                }
                //单个数据
                else {
                    //console.log("deVal " + this.config[i].name + this.config[i].deVal)
                    this.setData(this.config[i].name, this.config[i].deVal, function () {
                        checkPros();
                    }.bind(this))
                }
            }
        }.bind(this));
    },

    //加载单独世界信息
    initInfo(isReBorn, cb) {
        resManager.loadConfig("ResourceList", function (cof) {
            this.initData = cof.initData;
            //2-声望值  3-累计所得的钱  4-拥有过最高的金额 5-游戏的时长 6-声望值 7-成就的个数 8-游戏最后离开的时间等等
            this.InitPros = 0;
            var checkInitPros = function () {
                this.InitPros = this.InitPros + 1;
                if (this.InitPros == this.initData.name.length) {
                    console.log("init success");
                    if (isReBorn == null) {
                        viewManager.initPopView();
                    } else {
                        if (cb != null) {
                            cb();
                        }
                    }
                }
            }.bind(this)
            for (var i = 0; i < this.initData.name.length; i = i + 1) {
                //数组数据
                if (this.initData.isOne[i] == 0) {
                    var name = this.worldId + "-" + this.initData.name[i];
                    dataManager.getStoreArray(name, function (list, name) {
                        //console.log(name, list)
                        this.itemArrayList[name] = list;
                        checkInitPros();
                    }.bind(this));
                }
                //单个数据
                else {
                    this.getData(this.initData.name[i], function () {
                        checkInitPros();
                    }.bind(this))
                }
            }
        }.bind(this));
    },


    //货币操作   0-钱  1-钻石 -2累计充值美金 3-声望值
    //分数操作   2-声望值  3-累计所得的钱  4-拥有过最高的金额 5-游戏的时长 6-声望值 7-成就的个数 8-游戏最后离开的时间 
    //道具操作   
    //数组idx数据获取
    itemArrayGet(name, i) {
        //处理不同世界的数据
        if (this.initData.name.indexOf(name) >= 0) {
            name = this.worldId + "-" + name;
        }
        //初始化缓存数据列表
        if (this.itemArrayList[name] == null) {
            this.itemArrayList[name] = [];
        }
        var val = this.itemArrayList[name][i];
        if (val == null || val == NaN) {
            console.warn("get " + name + "[" + i + "] fail,val is null")
            return 0;
        }
        return val;
    },
    //数组idx数据自增
    itemArrayAdd(name, i, val, cb) {
        //处理不同世界的数据
        if (this.initData.name.indexOf(name) >= 0) {
            name = this.worldId + "-" + name;
        }
        //处理初始化缓存数据
        if (this.itemArrayList[name] == null) {
            this.itemArrayList[name] = [];
        }
        if (isNumber(val)) {
            if (this.itemArrayList[name][i] == null) {
                this.itemArrayList[name][i] = 0;
            }
            this.itemArrayList[name][i] = this.itemArrayList[name][i] + val;

            //处理有关金币的时间
            if (name == "pCurrency") {
                this.dealMoney(val, i);
                if (this.itemArrayList[name][i] >= 4 && !worldScript.node.active) {
                    //引导升级店铺
                    guideScript.checkGuide(2);
                }
                if (this.itemArrayList[name][i] >= 3 && !worldScript.node.active) {
                    //引导买管家
                    guideScript.checkGuide(1);
                }
                if (this.itemArrayList[name][i] >= 30 && !worldScript.node.active) {
                    //引导升级管家
                    guideScript.checkGuide(3);
                }
                if (this.itemArrayList[name][i] >= 50000 && !worldScript.node.active) {
                    //引导送可乐
                    if (mainScript.floorInfoList[3] != null && mainScript.floorInfoList[3] != undefined && mainScript.floorInfoList[3] != "undefined") {
                        guideScript.checkGuide(5);
                    }
                }
            }
            dataManager.setStoreItem(name, this.itemArrayList[name][i], i, function () {
                if (cb != null) {
                    cb();
                }
            }.bind(this));
        } else {
            console.warn("set " + name + "[" + i + "] fail,val is not Number");
        }
    },
    //数组idx数据设置
    itemArraySet(name, i, val, cb) {
        //处理不同世界的数据
        if (this.initData.name.indexOf(name) >= 0) {
            name = this.worldId + "-" + name;
        }
        //处理初始化缓存数据
        if (this.itemArrayList[name] == null) {
            this.itemArrayList[name] = [];
        }

        if (val != null) {
            this.itemArrayList[name][i] = val;
            dataManager.setStoreItem(name, this.itemArrayList[name][i], i, function () {
                if (cb != null) {
                    cb();
                }
            }.bind(this));
        } else {
            console.warn("set " + name + "[" + i + "] fail,val(" + val + ") is not Number");
        }
    },
    //获取整个数组数据
    getArrayAll(name) {
        //处理不同世界的数据
        if (this.initData.name.indexOf(name) >= 0) {
            name = this.worldId + "-" + name;
        }
        //处理初始化缓存数据
        if (this.itemArrayList[name] == null) {
            this.itemArrayList[name] = [];
        }
        return this.itemArrayList[name];
    },
    //设置整个数据数组
    setArrayAll(name, array, cb) {
        //处理不同世界的数据
        if (this.initData.name.indexOf(name) >= 0) {
            name = this.worldId + "-" + name;
        }
        this.itemArrayList[name] = array;
        dataManager.setStoreArray(name, array, function () {
            if (cb != null) {
                cb();
            }
        }.bind(this))
    },

    //设置单个数据
    setData(name, val, cb) {
        var realName = name;
        //处理不同世界的数据
        if (this.initData.name.indexOf(name) >= 0) {
            realName = this.worldId + "-" + name;
            //重生处理
            if (name == "BornIncome") {
                realName = this.getData("BornTimes") + "^" + realName;
            }
        }
        if (val != undefined && val != null) {
            this.dataList[realName] = val;
            dataManager.setData(realName, val, function () {
                if (cb != null) {
                    cb();
                }
            }.bind(this));
        }
    },

    //获取单个数据
    getData(name, cb) {
        var realName = name;
        //处理不同世界的数据
        if (this.initData.name.indexOf(name) >= 0) {
            realName = this.worldId + "-" + name;
            //重生处理
            if (name == "BornIncome") {
                realName = this.getData("BornTimes") + "^" + realName;
            }
        }
        if (this.dataList[realName] == undefined) {
            dataManager.getData(realName, function (val) {
                this.dataList[realName] = val;
                if (cb != null) {
                    cb();
                }
            }.bind(this));
        } else {
            if (cb != null) {
                cb();
            }
        }
        return this.dataList[realName];
    },

    //处理金钱的事件
    dealMoney(val, i) {
        if (i == 0) {
            //当前现金成就
            this.itemArraySet("pAchievement", 3, this.itemArrayList["pCurrency"][0]);

            //处理总收入
            if (val > 0) {
                this.itemArrayAdd("pScore", 3, val);
                //处理单栋楼的总收入
                var buildingTI = this.getData("TotalIncome");
                buildingTI = buildingTI + val;
                this.setData("TotalIncome", buildingTI);

                //处理单栋楼的每次重生的总收入
                var bornTI = this.getData("BornIncome");
                bornTI = bornTI + val;
                this.setData("BornIncome", bornTI);

                //第一次达到重生的条件
                if (this.itemArrayList["pCurrency"][0] >= 180000000) {
                    //引导重生
                    guideScript.checkGuide(7);
                }
            }
            //处理最高金额
            if (this.itemArrayList["pCurrency"][i] > this.itemArrayList["pScore"][4]) {
                this.itemArraySet("pScore", 4, this.itemArrayList["pCurrency"][i]);
            }
        } else if (i == 3) {
            //处理总声望
            if (val > 0) {
                this.itemArrayAdd("pScore", 6, val, function () {
                    //榜单处理
                    var all = this.itemArrayGet("pScore", 6);
                    SDK().setRankScore(2, all, "{}");
                }.bind(this));
            }
        }
    },

    //姓名操作
    getName() {
        var val = this.pName;
        if (val == null) {
            console.warn("get Name fail,val is null")
            return "";
        }
        return val;
    },
    setName(val) {
        if (isString(val)) {
            SDK().setItem({ pName: val }, function () {
                this.pName = this.substrName(val, 30);
            }.bind(this));
        } else {
            console.warn("set pName fail,val is not String");
        }
    },

    //性别操作
    getSex() {
        var val = this.pSex;
        if (val == null) {
            console.warn("get Sex fail,val is null")
            return 0;
        }
        return val;
    },
    setSex(val) {
        if (isNumber(val)) {
            SDK().setItem({ pSex: val }, function () {
                this.pSex = val;
            }.bind(this));
        } else {
            console.warn("set pSex fail,val is not Number");
        }
    },

    //年龄操作
    getAge() {
        var val = this.pAge;
        if (val == null) {
            console.warn("get Age fail,val is null")
            return 0;
        }
        return val;
    },
    setAge(val) {
        if (isNumber(val)) {
            SDK().setItem({ pAge: val }, function () {
                this.pAge = val;
            }.bind(this));
        } else {
            console.warn("set pAge fail,val is not Number");
        }
    },

    //头像操作
    getAvatar(cb) {
        var val = this.pAvatar;
        if (val == null) {
            console.warn("get pAvatar fail,val is null")
            return "";
        }
        resManager.loadSprite(val, function (texture) {
            var spriteFrame = new cc.SpriteFrame(texture);
            if (spriteFrame != null) {
                cb(spriteFrame);
            }
        }.bind(this))
    },
    setAvatar(val) {
        if (isString(val)) {
            SDK().setItem({ pAvatar: val }, function () {
                this.pAvatar = val;
            }.bind(this));
        } else {
            console.warn("set pAvatar fail,val is not String");
        }
    },

    //id操作
    getID() {
        var val = this.pId;
        if (val == null) {
            console.warn("get pId fail,val is null")
            return 0;
        }
        return val;
    },
    setID(val) {
        if (isString(val)) {
            this.pId = SDK().MyPlayer.id;
        } else {
            console.warn("set pID fail,val is not Number");
        }
    },

    //名字截取
    substrName(str, n) {
        if (str.replace(/[\u4e00-\u9fa5]/g, "**").length <= n) {
            return str;
        } else {
            var len = 0;
            var tmpStr = "";
            for (var i = 0; i < str.length; i++) {//遍历字符串
                if (/[\u4e00-\u9fa5]/.test(str[i])) {//中文 长度为两字节
                    len += 2;
                }
                else {
                    len += 1;
                }
                if (len > n) {
                    break;
                }
                else {
                    tmpStr += str[i];
                }
            }
            return tmpStr + " ...";
        }

    }

    // update (dt) {},
});
