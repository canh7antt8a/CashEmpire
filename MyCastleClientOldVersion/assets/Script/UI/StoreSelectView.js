import { isNull } from "util";
cc.Class({
    extends: cc.Component,

    properties: {
        //成就滚动界面
        licenseView: {
            default: null,
            type: cc.ScrollView,
        },
        //滚动体
        licenseContent: {
            default: null,
            type: cc.Node,
        },
        //成就预制件
        licenseItem: {
            default: null,
            type: cc.Node,
        },
        //成就UI存储列表
        licenseList: {
            default: [],
            visible: false,
        },
        //当前选择的执照
        curLicense: {
            default: null,
            type: cc.Node,
        },
        curInfo: {
            default: {},
            visible: false,
        },
        licenseInfoList: {
            default: [],
            visible: false,
        },
        openIdx: {
            default: 0,
            visible: false,
        },
        myLicenseList: {
            default: [],
            visible: false,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        window.storeSelectScript = this;
        this.myLicenseList = player.getArrayAll("myLicense");
    },

    start() {
        //处理item之间的间距来适应分辨率
        var width = cc.winSize.width - 100;
        var count = 3;
        width = width - (this.licenseItem.width * count);
        this.licenseContent.getComponent(cc.Layout).spacingX = width / (count - 1);
    },
    onEnable() {
        this.curInfo = null;
    },

    //按钮点击事件
    menuClick(event, type) {
        soundManager.playSound("btnClick");
        if (type == "sure") {
            if (this.curInfo != null) {
                //服务器追加用户数据
                buildManager.openFloor(this.openIdx, this.curInfo);
            }
        }
        else if (type == "select") {
            //加载头像
            var pic = this.curLicense.getComponent(cc.Sprite);
            resManager.loadSprite(this.curInfo.pic + "0", function (spriteFrame) {
                pic.spriteFrame = spriteFrame;
            }.bind(this));
            //加载名字
            var name = cc.find("Name", this.curLicense).getComponent(cc.Label);
            name.string = this.curInfo.name;
        }
    },


    //刷新执照
    initView(idx) {
        this.openIdx = idx;
        for (var i = 0; i < this.licenseInfoList.length || i < this.licenseList.length; i = i + 1) {
            if (i < this.licenseInfoList.length) {
                this.loadlicenseItem(i);
            } else {
                if (this.licenseList[i].curItem != null) {
                    this.licenseList[i].curItem.active = false;
                }
            }
        }
    },

    //加载执照信息
    loadlicenseItem(idx) {
        var info = {};
        info = this.licenseInfoList[idx];
        if (this.licenseList[idx] == null) {
            this.licenseList[idx] = {};
        }
        var curItem = this.licenseList[idx].curItem;
        if (this.myLicenseList[idx] == 0) {
            if (curItem != null) {
                curItem.active = false;
            }
            return;
        }
        if (curItem == null) {
            curItem = cc.instantiate(this.licenseItem);
            this.licenseList[idx].curItem = curItem;
            this.licenseList[idx].showSprite = cc.find("Sprite", curItem).getComponent(cc.Sprite);
            this.licenseList[idx].name = cc.find("Name", curItem).getComponent(cc.Label);
        }
        var showSprite = this.licenseList[idx].showSprite;
        var name = this.licenseList[idx].name;

        //点击事件按钮初始化
        curItem.off(cc.Node.EventType.TOUCH_END);
        curItem.on(cc.Node.EventType.TOUCH_END, function (event) {
            gameApplication.soundManager.playSound("btnClick");
            this.curInfo = info;
            this.menuClick(event, "select");
        }.bind(this), this)

        //读取图片信息
        resManager.loadSprite(info.pic + "0", function (spriteFrame) {
            showSprite.spriteFrame = spriteFrame;
        }.bind(this));

        //等级描述
        name.string = info.name;

        curItem.parent = this.licenseContent;
        curItem.active = true;
    },

    //start() {},

    // update (dt) {},
});
