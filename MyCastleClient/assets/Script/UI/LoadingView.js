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
        }
    },

    onLoad: function () {
        window.devicePixelRatio;
        this.gameApplication = cc.find("GameApplication").getComponent("GameApplication");
        this.node.zIndex = 10000;
        this.house = cc.find("House/Wave", this.node).getComponent("SpriteAnimation");
        this.prog = cc.find("House/Wave/Pro", this.node).getComponent(cc.ProgressBar);
        this.prog.totalLength = this.prog.node.width;
        this.prog.progress = 0;
        this.pro = cc.find("House/Wave/Pro/Pro", this.node).getComponent(cc.Label);
        this.pro.string = 0;
    },

    start() {
        this.gameApplication.viewManager.node.on("loadPop", this.dealPro, this);
        this.house.playSprites("loadingSprite", 7, 0, 0, 12, false, true);
    },

    dealPro(obj) {
        var pro = obj.pro;
        this.pro.string = (pro * 100).toFixed(2) + "%";
        this.gameApplication.viewManager.lerpAction(this.prog.progress, pro.toFixed(2) - this.prog.progress, 0.2,
            function (ob) {
                this.prog.progress = ob.x;
                if (this.prog.progress >= 0.99) {
                    //显示主界面
                    this.gameApplication.viewManager.showView("MainView", true, true);
                    this.initResource();
                    this.scheduleOnce(function () {
                        this.node.active = false;
                    }.bind(this), 0.5)
                }
            }.bind(this),
            "0",
        )
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

            //商品技能效果列表
            buildManager.goodSkillsEffect = cof.goodSkillsEffect;

             //商品技能结束时间列表
            buildManager.goodSkillsTime = player.getArrayAll("goodSkillsTime");

            //用户开店时间列表
            buildManager.lastTime = player.getArrayAll("myFloorsTime");

            //商品储存信息
            shopScript.selectInfo = cof.shopInfoList.typeList;

            //执照的信息
            storeSelectScript.licenseInfoList = cof.shopInfoList.typeList[2].infoList;

            //获取管家数据
            managerScript.managerInfoList = player.getArrayAll("myManagers");
            mainScript.initBuilding();
            managerScript.initManagerList();
            buildManager.countOfflineProfit();
        }.bind(this));
    },

    //update (dt) {},
});
