const MTA = {};
const sid = "500651013";
const version = '1.0.2';
var _mtac = {};

MTA.init = function () {
    var mta = document.createElement("script");
    mta.type = "text/javascript";
    mta.src = "//pingjs.qq.com/h5/stats.js?v2.0.4";
    mta.setAttribute("name", "MTAH5");
    mta.setAttribute("sid", sid);

    var s = document.getElementsByTagName("script")[0];
  	s.parentNode.insertBefore(mta, s);
};

//登录
MTA.login = function (userID, type = "0", age = 1, sex = 1) {
};

//退出
MTA.logout = function (userID) {
};

//创建角色
MTA.createAPart = function (partData) {//partData = {data1:"",data2:1}
};

//支付开始
MTA.payBegin = function (payDetail) {
};

//支付成功
MTA.paySuccess = function (payDetail) {
};

//关卡开始
MTA.levelBegin = function (levelDetail) {
};

//关卡结果
MTA.levelResult = function (isPass, levelDetail) {
};

//玩家后台运行
MTA.gameHideAndShow = function (isHide) {
};

//玩家触发事件
MTA.doEvent = function (detail) {
};

//玩家道具处理
MTA.dealItem = function (type, itemDetail) {
};






module.exports = MTA;
