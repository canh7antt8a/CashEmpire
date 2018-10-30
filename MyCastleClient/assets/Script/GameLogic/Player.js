import { isNumber, isString } from "util";

cc.Class({
    extends: cc.Component,

    properties: {
        itemArrayList: {
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
        fbPlayer: {
            default: null,
            visible: false,
        },
        playerCof: {
            default: null,
            visible: false,
        },
        fristInitPros: {
            default: 0,
            visible: false,
        },
        initData: {
            default: null,
            visible: false,
        },
    },


    onLoad() {
        window.player = this;
        this.fbPlayer = SDK().getSelfInfo();
        resManager.loadConfig("ResourceList", function (cof) {
            //获取配置信息的数据列表
            this.playerCof = cof.firstData;
            SDK().getItem("isFirst", function (val) {
                if (val == 0 || val == null) {
                    this.firstData(function () {
                        this.initPlayerInfo();
                        SDK().setItem({ isFirst: 1 });
                    }.bind(this));
                } else {
                    this.initPlayerInfo();
                }
            }.bind(this))
        }.bind(this));
    },

    //初始化数据
    firstData(cb) {
        this.fristInitPros = 0;
        resManager.loadConfig("ResourceList", function (cof) {
            //获取配置信息的数据列表
            var checkPros = function () {
                this.fristInitPros = this.fristInitPros + 1;
                if (this.fristInitPros == this.playerCof.length + 3) {
                    if (cb != null) {
                        console.log("firstData success");
                        cb();
                    }
                }
            }.bind(this)
            for (var i = 0; i < this.playerCof.length; i = i + 1) {
                dataManager.setStoreArray(this.playerCof[i].name, this.playerCof[i].array, function () {
                    checkPros();
                }.bind(this));
            }
            this.initData = cof.initData;
            for (var i = 0; i < 3; i = i + 1) {
                dataManager.setStoreArray(this.initData[i], [], function () {
                    checkPros();
                }.bind(this));
            }
        }.bind(this));
    },

    //加载用户数据
    initPlayerInfo: function () {
        //货币 分数 道具 成就完成情况 声望技能使用时间 执照 楼层信息 楼层开店时间信息
        resManager.loadConfig("ResourceList", function (cof) {
            this.initData = cof.initData;
            this.fristInitPros = 0;
            var checkInitPros = function () {
                this.fristInitPros = this.fristInitPros + 1;
                if (this.fristInitPros == this.initData.length) {
                    console.log("init success");
                    viewManager.initPopView();
                }
            }.bind(this)
            for (var i = 0; i < this.initData.length; i = i + 1) {
                dataManager.getStoreArray(this.initData[i], function (list, name) {
                    console.log(name,list)
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

    //货币操作 0-钱  1-钻石 -2累计充值美金 3-声望值
    //分数操作   3-累计所得的钱  4-拥有过最高的金额 5-游戏的时长 6-声望值 7-成就的个数 8-游戏最后离开的时间 
    //道具操作
    //数组数据操作
    itemArrayGet(name, i) {
        if (this.itemArrayList[name] == null) {
            this.itemArrayList[name] = [];
        }
        var val = this.itemArrayList[name][i];
        if (val == null) {
            console.warn("get " + name + "[" + i + "] fail,val is null")
            return 0;
        }
        return val;
    },
    itemArrayAdd(name, i, val, cb) {
        if (this.itemArrayList[name] == null) {
            this.itemArrayList[name] = [];
        }
        if (isNumber(val)) {
            if (this.itemArrayList[name][i] == null) {
                this.itemArrayList[name][i] = 0;
            }
            this.itemArrayList[name][i] = this.itemArrayList[name][i] + val;

            if (name == "pCurrency") {
                this.dealMoney(val, i);
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
    itemArraySet(name, i, val, cb) {
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
    getArrayAll(name) {
        if (this.itemArrayList[name] == null) {
            this.itemArrayList[name] = [];
        }
        return this.itemArrayList[name];
    },

    //处理金钱的事件
    dealMoney(val, i) {
        if (i == 0) {
            //处理总收入
            if (val > 0) {
                this.itemArrayAdd("pScore", 3, val);
            }
            //处理最高金额
            if (this.itemArrayList["pCurrency"][i] > this.itemArrayList["pScore"][4]) {
                this.itemArraySet("pScore", 4, this.itemArrayList["pCurrency"][i]);
            }
        } else if (i == 3) {
            //处理总声望
            if (val > 0) {
                this.itemArrayAdd("pScore", 6, val,function(){
                    //榜单处理
                    var all = this.itemArrayGet("pScore", 6);
                    SDK().setRankScore(2,all,"{}");
                    console.log(222)
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
