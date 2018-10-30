import { isString, isArray } from "util";
import { isatty } from "tty";

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
        cofDataMap: {
            default: {},
            visible: false,
        },
        //每个储存的状态 true-繁忙  false-空闲
        statusList: {
            default: {},
            visible: false,
        },
        //每个储存事件的缓存数据
        bufList: {
            default: {},
            visible: false,
        },
        //是否还存在事件
        actionList: {
            default: {},
            visible: false,
        },
        actionCbList: {
            default: {},
            visible: false,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        window.dataManager = this;
    },

    start() {
    },

    //设置某个数据
    setStoreItem(name, val, idx, cb) {
        if (this.bufList[name] == null) {
            this.bufList[name] = {};
        }
        this.bufList[name][idx] = val;
        this.actionList[name] = true;

        let oldCb = this.actionCbList[(name + idx)];
        this.actionCbList[(name + idx)] =
            function () {
                if (oldCb != null) {
                    oldCb();
                }
                if (cb != null) {
                    cb();
                }
            }.bind(this);
        if (this.statusList[name]) {
            return;
        }
        let curCb = this.actionCbList[(name + idx)];
        this.actionCbList[(name + idx)] = null;
        this.saveAction(name, curCb);
    },

    //实际执行储存的操作
    saveAction(name, cb) {
        this.statusList[name] = true;
        this.getStoreArray(name, function (array) {
            //遍历缓存获取数据组装新数据字符串
            for (var index in this.bufList[name]) {
                if (this.bufList[name][index] != null) {
                    array[index] = this.bufList[name][index];
                    this.bufList[name][index] = null;
                }
            }
            var saver = null;
            if (array.length > 0) {
                if (isArray(array[0])) {
                    array[0] = this.dataSplit(array[0]);
                }
                saver = "" + array[0];
                for (var i = 1; i < array.length; i = i + 1) {
                    if (isArray(array[i])) {
                        array[i] = this.dataSplit(array[i]);
                    }
                    saver = saver + "^α" + array[i];
                }
            }
            //储存并回调
            var param = {};
            param[name] = saver;
            SDK().setItem(param, function () {
                this.statusList[name] = false;
                if (cb != null) {
                    cb();
                }
                if (this.actionList[name] == true) {
                    this.actionList[name] = false;
                    this.saveAction(name);
                }
            }.bind(this))
        }.bind(this))
    },

    //获取整个数据
    getStoreArray(name, cb) {
        SDK().getItem(name, function (dataString) {
            if(dataString == "null" && dataString == null){
                dataString = 0;
            }
            //数据字符串转换成数组，并回调
            if (isString(dataString)) {
                var dataArray = dataString.trim().split("^α");
                for (var i = 0; i < dataArray.length; i = i + 1) {
                    if (isString(dataArray[i])) {
                        if (dataArray[i].indexOf("^β", 0) > 0) {
                            dataArray[i] = this.dataDeSplit(dataArray[i]);
                        }
                    }
                    if (!isArray(dataArray[i])) {
                        dataArray[i] = this.parseNumber(dataArray[i]);
                    }
                }
                if (cb != null) {
                    cb(dataArray,name);
                }
            } else {
                console.log(name + " data error");
                cb([],name);
            }
        }.bind(this), 1)
    },

    //设置一组数据
    setStoreArray(name, array, cb) {
        if (this.bufList[name] == null) {
            this.bufList[name] = {};
        }
        //情况缓存池里面的数据
        for (var index in this.bufList[name]) {
            if (this.bufList[name][index] != null) {
                this.bufList[name][index] = null;
            }
        }
        var saver = null;
        if (array.length > 0) {
            if (isArray(array[0])) {
                array[0] = this.dataSplit(array[0]);
            }
            saver = "" + array[0];
            for (var i = 1; i < array.length; i = i + 1) {
                if (isArray(array[i])) {
                    array[i] = this.dataSplit(array[i]);
                }
                saver = saver + "^α" + array[i];
            }
        }
        //储存并回调
        var param = {};
        param[name] = saver;
        SDK().setItem(param, function () {
            if (cb != null) {
                cb(true);
            }
            this.statusList[name] = false;
            this.actionList[name] = false;
        }.bind(this))
    },


    //一条字符串数据转换成数组
    dataDeSplit(dataString) {
        //数据字符串转换成数组，并回调
        var dataArray = [];
        if (isString(dataString)) {
            dataArray = dataString.trim().split("^β");
            for (var i = 0; i < dataArray.length; i = i + 1) {
                dataArray[i] = this.parseNumber(dataArray[i]);
            }
        } else {
            console.warn(name + " data error");
        }
        return dataArray;
    },

    //数组数据转换成一条字符串
    dataSplit(array) {
        var saver = "";
        if (array.length > 0) {
            saver = "" + array[0];
            for (var i = 1; i < array.length; i = i + 1) {
                saver = saver + "^β" + array[i];
            }
        }
        return saver;
    },
    //将一个数据转换成数字（如果可以）
    parseNumber(num) {
        if (/^(-?\d+)(\.\d+)?$/.test(num) && !isArray(num)) {
            if (parseInt(num) != parseFloat(num)) {
                num = parseFloat(num);
            } else {
                num = parseInt(num);
            }
        }
        if (/^(-?\d)(\.\d+)?e+|-\d+$/.test(num)) {
            num = parseFloat(num);
        }
        return num;
    },

    // update (dt) {},
});
