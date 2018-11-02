import { isString, isArray } from "util";

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
        //回调函数列表
        actionCbList: {
            default: {},
            visible: false,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        window.dataManager = this;
    },

    start() { },

    //设置某个数据
    setStoreItem(name, val, idx, cb) {
        //初始化缓存数据数组
        if (this.bufList[name] == null) {
            this.bufList[name] = {};
        }
        //保存数据并记录事件存在
        this.bufList[name][idx] = val;
        this.actionList[name] = true;

        //将所有同类的回调函数打包
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
        //同类数据事件的储存正在进行则返回等待回调
        if (this.statusList[name]) {
            return;
        }

        //调用储存事件并将该类数据回调传入
        let curCb = this.actionCbList[(name + idx)];
        this.actionCbList[(name + idx)] = null;
        this.saveAction(name, curCb);
    },

    //实际执行储存的操作
    saveAction(name, cb) {
        this.statusList[name] = true;
        this.getStoreArray(name, false, function (array) {
            //遍历缓存获取数据组装新数据数组(处理获取facebook数据的空挡时，同类数据的缓存一起进行储存)
            for (var index in this.bufList[name]) {
                if (this.bufList[name][index] != null) {
                    array[index] = this.bufList[name][index];
                    this.bufList[name][index] = null;
                    //回调一同处理
                    let oldCb = cb;
                    let newCb = this.actionCbList[(name + index)];
                    this.actionCbList[(name + index)] = null;
                    cb = function () {
                        if (oldCb != null) {
                            oldCb();
                        }
                        if (newCb != null) {
                            newCb();
                        }
                    }
                }
            }
            //将数据数据转换成字符串
            var saver = null;
            if (array.length > 0) {
                saver = JSON.stringify(array);
            }
            //本地储存并回调
            cc.sys.localStorage.setItem(name, saver);
            this.statusList[name] = false;
            if (cb != null) {
                cb();
            }
            if (this.actionList[name] == true) {
                this.actionList[name] = false;
                this.saveAction(name);
            }
            //远程储存
            var param = {};
            param[name] = saver;
            SDK().setItem(param, function () {
                //console.log("remote success",param);
            }.bind(this))
        }.bind(this))
    },

    //获取整个数据
    getStoreArray(name, isRemote, cb) {
        //是否远程进行获取资源
        if (isRemote) {
            SDK().getItem(name, function (dataString) {
                this.dealDate(dataString, name, cb, isRemote);
            }.bind(this), 1)
        } else {
            var dataString = cc.sys.localStorage.getItem(name);
            this.dealDate(dataString, name, cb, isRemote);
        }
    },

    //设置一组数据
    setStoreArray(name, array, cb) {
        if (this.bufList[name] == null) {
            this.bufList[name] = {};
        }
        //清空缓存池里面的数据
        for (var index in this.bufList[name]) {
            if (this.bufList[name][index] != null) {
                this.bufList[name][index] = null;
            }
        }
        var saver = null;
        saver = JSON.stringify(array);

        //本地进行储存并回调
        cc.sys.localStorage.setItem(name, saver);
        if (cb != null) {
            cb(true);
        }
        this.statusList[name] = false;
        this.actionList[name] = false;

        //远程储存
        var param = {};
        param[name] = saver;
        SDK().setItem(param, function () {
            //console.log("remote success",param);
        }.bind(this))
    },

    //处理数据
    dealDate(dataString, name, cb, isRemote) {
        if (dataString == "null" || dataString == null || dataString == undefined) {
            dataString = 0;
        }
        //数据字符串转换成数组，并回调
        if (isString(dataString)) {
            var dataArray = [];
            if (dataString.indexOf("^α", 0) > 0 || dataString.indexOf("^β", 0) > 0 || dataString.indexOf("[", 0) < 0) {
                dataArray = dataString.trim().split("^α");
                for (var i = 0; i < dataArray.length; i = i + 1) {
                    if (isString(dataArray[i])) {
                        if (dataArray[i].indexOf("^β", 0) > 0) {
                            dataArray[i] = this.dataDeSplit(dataArray[i]);
                        }
                    }
                    //处理单个数据并将数字转换成数字类型
                    if (!isArray(dataArray[i])) {
                        dataArray[i] = this.parseNumber(dataArray[i]);
                    }
                }
            } else {
                dataArray = JSON.parse(dataString);
            }
            if (cb != null) {
                cb(dataArray, name);
            }
            if(isRemote){
                this.setStoreArray(name,dataArray);
            }
        } else {
            console.log(name + " data error", dataString);
            cb([], name);
        }
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

    setData(name, val, cb) {
        var param = {};
        param[name] = val;
        cc.sys.localStorage.setItem(name, val);
        if (cb != null) {
            cb(true);
        }
        SDK().setItem(param, function () {
            //console.log("remote success",param);
        }.bind(this))
    },

    getData(name, cb, isRemote) {
        if (isRemote) {
            SDK().getItem(name, function (dataString) {
                if (dataString == "null" || dataString == null || dataString == undefined) {
                    dataString = 0;
                }
                dataString = this.parseNumber(dataString);
                if (cb != null) {
                    cb(dataString)
                }
                this.setData(name, dataString);
            }.bind(this), 1);
        } else {
            var dataString = cc.sys.localStorage.getItem(name);
            if (dataString == "null" || dataString == null || dataString == undefined) {
                dataString = 0;
            }
            dataString = this.parseNumber(dataString);
            if (cb != null) {
                cb(dataString)
            }
        }
    },
    // update (dt) {},
});
