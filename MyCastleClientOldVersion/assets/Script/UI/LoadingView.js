/* 
    "FlyGiftView",  
    "UsePopView",
    "ShopView",
    "SettingView",
    "AchieveView",
    "HomeView",
    "RankView",
    "FbFail",
    "RechargeView",
    "InfoView",
    "TrainManagerView",
    "WarnView", 
*/
cc.Class({
    extends: cc.Component,

    properties: {
        pro: {
            default: null,
            visible: false,
        },
        house: {
            default: null,
            visible: false,
        },
        prog: {
            default: null,
            visible: false,
        },
        isLoad: {
            default: false,
            visible: false,
        }
    },

    onLoad: function () {
        window.loadView = this;
        this.gameApplication = cc.find("GameApplication").getComponent("GameApplication");
        this.node.zIndex = 10000;
        this.prog = cc.find("House/Wave/Pro", this.node).getComponent(cc.ProgressBar);
        this.prog.totalLength = this.prog.node.width - 10;
        this.prog.progress = 0;
        this.pro = cc.find("House/Wave/Pro/Pro", this.node).getComponent(cc.Label);
        this.pro.string = 0;
        this.textLabel = cc.find("House/Wave/Text", this.node).getComponent("LocalizedLabel");
    },

    onEnable() {},

    goLoading(){
        if (!this.isLoad) {
            //加载界面进度条回调
            this.gameApplication.viewManager.node.on("loadPop", this.dealPro, this);
            //废话加载
            this.schedule(function () {
                this.textLabel.dataID = "lang.loadingText" + Math.floor(Math.random() * 5.99);
            }.bind(this), 2, 100);
        }
    },

    //加载进度条回调处理
    dealPro(obj) {
        var pro = obj.detail.pro;
        this.pro.string = (pro * 100).toFixed(2) + "%";
        this.gameApplication.viewManager.lerpAction(this.prog.progress, pro.toFixed(2) - this.prog.progress, 0.2,
            function (ob) {
                this.prog.progress = ob.x;
                if (this.prog.progress >= 0.99) {
                    this.isLoad = true;
                    //加载开店的执照的信息并去到主页
                    resManager.loadConfig("LicenseInfoList", function (cof) {
                        buildManager.licenseInfoList = cof.licences;
                        this.goMain();
                    }.bind(this));
                }
            }.bind(this),
            "0",
        )
    },

    //显示主界面
    goMain() {
        viewManager.showView("MainView", true, true);
        this.initResource();
        this.scheduleOnce(function () {
            this.node.active = false;
        }.bind(this), 1)
    },

    //初始化资源
    initResource() {
        resManager.loadConfig("ResourceList", function (cof) {
            //每个商店的信息
            mainScript.storeInfoList = cof.storeList;

            //读取用户每层楼的信息
            mainScript.floorInfoList = player.getArrayAll("myFloors");

            //获取楼层增长信息
            buildManager.levelConfig = cof.floorLevelList;

            //读取玩家的商品技能列表
            buildManager.goodSkills = player.getArrayAll("goodSkills");


            buildManager.curBigLevel = player.getData("AchieveLevel");

            //商品技能效果列表
            buildManager.goodSkillsEffect = cof.goodSkillsEffect;

            //商品技能结束时间列表
            buildManager.goodSkillsTime = player.getArrayAll("goodSkillsTime");

            //用户开店时间列表
            buildManager.lastTime = player.getArrayAll("myFloorsTime");

            //获取管家数据
            managerScript.managerInfoList = player.getArrayAll("myManagers");

            //管家按楼层的获取价格
            managerScript.priceList = cof.workerPriceList;

            mainScript.initBuilding();
            managerScript.initManagerList();
            buildManager.countOfflineProfit();
        }.bind(this));
    },

    //update (dt) {},
});
