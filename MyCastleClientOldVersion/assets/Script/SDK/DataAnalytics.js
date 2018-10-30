const dataAnalytics = {};
const appID = "687321083";
const appSecret = "e06533166df0daac1faf65f2b9bf8355";
const channel = 'facebook';
const version = '1.0.2';

dataAnalytics.init = function () {
    cocosAnalytics.init({
        // 申请的APPID，必填
        appID: appID,
        appSecret: appSecret,
        // 渠道来源，区分用户渠道，渠道编号参考 http://dq.qudao.info/。
        channel: channel,
        version: version
    })
};

//登录
dataAnalytics.login = function (userID, type = "0", age = 1, sex = 1) {
    //ANALYTICS: login
    cocosAnalytics.CAAccount.loginStart();
    cocosAnalytics.CAAccount.loginSuccess({ 'userID': userID });
    // 设置帐号类型
    cocosAnalytics.CAAccount.setAccountType(type);
    // 年龄
    cocosAnalytics.CAAccount.setAge(age);
    // 性别：1为男，2为女，其它表示未知
    cocosAnalytics.CAAccount.setGender(sex);
};

//退出
dataAnalytics.logout = function (userID) {
    cocosAnalytics.CAAccount.logout({ 'userID': userID })
};

//创建角色
dataAnalytics.createAPart = function (partData) {//partData = {data1:"",data2:1}
    partData.gameServer = 'platform' + cc.sys.platform;
    //ANALYTICS: createRole
    cocosAnalytics.CAAccount.createRole(partData);
    //等级
    cocosAnalytics.CAAccount.setLevel(1);
};

//支付开始
dataAnalytics.payBegin = function (payDetail) {
    //ANALYTICS
    let payTime = Date.now().toString();
    payDetail.payTime = payTime;
    cocosAnalytics.CAPayment.payBegin(payDetail);
    /* payDetail ={
        // amount 付费金额，单位为分，必填
        amount: 1,
        // currencyType 货币类型，可选。默认CNY
        currencyType: 'CNY',
        // payType 支付方式，可选。默认为空
        payType: '信用卡',
        // iapID 付费点，可选。默认为空
        iapID: '原地满血复活',
        // orderID 订单编号，可选。默认为空
        orderID: orderID
    } */
};

//支付成功
dataAnalytics.paySuccess = function (payDetail) {
    //ANALYTICS
    let payTime = Date.now().toString();
    payDetail.payTime = payTime;
    cocosAnalytics.CAPayment.paySuccess(payDetail);
    /* payDetail = {
        // amount 付费金额，单位为分，必填
        amount: 1,
        // currencyType 货币类型，可选。默认CNY
        currencyType: 'CNY',
        // payType 支付方式，可选。默认为空
        payType: '信用卡',
        // iapID 付费点，可选。默认为空
        iapID: '原地满血复活',
        // orderID 订单编号，可选。默认为空
        orderID: orderID
    } */
};

//关卡开始
dataAnalytics.levelBegin = function (levelDetail) {
    cocosAnalytics.CALevels.begin(levelDetail);
    /*levelDetail = {
        level :  idx
    } */
};

//关卡结果
dataAnalytics.levelResult = function (isPass, levelDetail) {
    if (isPass) {
        cocosAnalytics.CALevels.complete(levelDetail);
    } else {
        cocosAnalytics.CALevels.failed(levelDetail);
    }
    /*levelDetail = {
        level :  "" + idx
        reason : "主角死亡"
    } */
};

//玩家后台运行
dataAnalytics.gameHideAndShow = function (isHide) {
    if (isHide) {
        cocosAnalytics.onPause(true)
    } else {
        cocosAnalytics.onResume(true)
    }
};

//玩家触发事件
dataAnalytics.doEvent = function (detail) {
    cocosAnalytics.CAEvent.onEvent({
        eventName: detail,
    })
};

//玩家道具处理
dataAnalytics.dealItem = function (type, itemDetail) {
    if (type == 0) {
        // 购买道具
        cocosAnalytics.CAItem.buy(itemDetail)
        /* {
            itemID: "魔法瓶",
            itemType: "蓝药",
            itemCount:    //购买数量,int 数字,
            VirtualCoin: 消耗虚拟币数量，int 数字,
            VirtualType: 虚拟币类型，字符串，"钻石"、"金币"
            consumePoint : 消耗点，字符串
        } */
    } else if (type == 1) {
        // 获得道具
        cocosAnalytics.CAItem.get(itemDetail)
        /* {
            itemID: "魔法瓶",
            itemType: "蓝药",
            itemCount: 购买数量，int 数字,
            reason: 获得原因，字符串
        } */
    } else if (type == 2) {
        // 消耗道具
        cocosAnalytics.CAItem.consume(itemDetail)
        /* {
            itemID: "魔法瓶",
            itemType: "蓝药",
            itemCount: 购买数量，int 数字,
            reason: 消耗原因，字符串
        } */
    }

};






module.exports = dataAnalytics;