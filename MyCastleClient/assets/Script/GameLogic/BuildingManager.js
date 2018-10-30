cc.Class({
    extends: cc.Component,
    properties: {
        lastTime: {
            default: [],
            visible: false,
        },
        lastNeedTime: {
            default: [],
            visible: false,
        },
        floorInfo: {
            default: [],
            visible: false,
        },
        levelConfig: {
            default: null,
            visible: false,
        },
        //开启楼层所需金币的缓存
        floorCostList: {
            default: [],
            visible: false,
        },
        //收益金币的缓存
        floorProfitList: {
            default: [],
            visible: false,
        },
        trainProfitList: {
            default: [],
            visible: false,
        },
        //培训所需金币的缓存
        trainCostList: {
            default: [],
            visible: false,
        },
        //商品技能
        goodSkills: {
            default: [],
            visible: false,
        },
        //商品技能时间
        goodSkillsTime: {
            default: [],
            visible: false,
        },
        //商品技能效果
        goodSkillsEffect: {
            default: [],
            visible: false,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        window.buildManager = this;
    },

    start() {
    },

    //计算离线收益
    countOfflineProfit() {
        var totalOfflineProfit = 0;
        for (var idx = 0; idx < mainScript.floorInfoList.length; idx = idx + 1) {
            this.lastNeedTime[idx] = this.countProfitTime(idx);
            //如果有营业时间
            if (this.lastTime[idx] > 1000) {
                var nowtime = (new Date().getTime() / 1000);
                var limit = player.itemArrayGet("pScore", 8) + 86400;
                var minTime = Math.min(nowtime, limit);
                var curManager = this.judgeHasManager(idx);
                //判断是否有收益
                while (this.lastTime[idx] + this.lastNeedTime[idx] < minTime) {
                    if (curManager != null) {
                        totalOfflineProfit = totalOfflineProfit + this.countProfit(idx);
                        this.setLastTime(idx);
                    } else {
                        totalOfflineProfit = totalOfflineProfit + this.countProfit(idx);
                        break;
                    }
                }
                //将店铺开启
                if (curManager != null) {
                    mainScript.floorList[idx].closeSprite.node.active = false;
                    this.loadPros(idx);
                }
            }
        }
        totalOfflineProfit = 0.1 * totalOfflineProfit;
        //永久性道具的加成计算
        var effectIdx = this.goodSkills[0][1];
        if (effectIdx >= 0) {
            var effect = this.goodSkillsEffect[0][1][effectIdx];
            var per = effect.per;
            totalOfflineProfit = totalOfflineProfit * per;
        }
        //一次性道具的加成计算
        effectIdx = this.goodSkills[1][0];//获取一次性道具中第一种类型的使用状态
        if (effectIdx >= 0) {
            //获取一次性道具中第一种类型的第effectIdx个等级的信息
            var effect = this.goodSkillsEffect[1][0][effectIdx];
            var per = effect.per;
            totalOfflineProfit = totalOfflineProfit * per;
            //重置一次性道具的使用状态
            this.goodSkills[1][0] = -1;
            player.itemArraySet("goodSkills", 1, this.goodSkills[1]);
        }
        if (totalOfflineProfit > 0) {
            viewManager.popView("OfflineProfitView", true, function (view) {
                view.getComponent("OfflineProfitView").showView(totalOfflineProfit);
            }.bind(this));
        }
    },

    //开店
    openFloor(idx, info) {
        var openCost = this.countFloorCost(idx);
        if (player.itemArrayGet("pCurrency", 0) >= openCost) {
            player.itemArrayAdd("pCurrency", 0, -openCost, function () {
                //储存开店数据
                var myFloors = [idx/* 楼层 */, info.idx/* 店铺类型 */, 0/* 店铺等级 */, 0/* 店铺经验 */];
                player.itemArraySet("myFloors", idx, myFloors, function () {
                    //设置最后开店时间和最后一次所需的收益时间
                    this.lastNeedTime[idx] = 6;
                    this.lastTime[idx] = 0;
                    player.itemArraySet("myFloorsTime", idx, this.lastTime[idx]);
                    player.itemArrayAdd("myLicense", info.idx, -1);
                    mainScript.floorInfoList[idx] = myFloors;
                    mainScript.loadFloor(idx, true);
                }.bind(this));
                viewManager.popView("StoreSelectView", false);
            }.bind(this));
        } else {
            console.log("needMore");
        }
    },

    //开始营业
    openShop(idx, cb) {
        //设置时间
        this.setLastTime(idx);
        //加载进度条
        this.loadPros(idx);
    },

    //设置某一楼层最后一次开店的时间
    setLastTime(idx, disVal) {
        if (disVal == null) {
            disVal = 0;
        }
        if (this.lastTime[idx] != -1 && this.lastTime[idx] != null && this.lastTime[idx] != "undefined") {
            this.lastNeedTime[idx] = this.countProfitTime(idx);
            this.lastTime[idx] = this.lastTime[idx] + this.lastNeedTime[idx];
        } else {
            this.lastTime[idx] = new Date().getTime() / 1000 - disVal;
        }
        //保存远程数据-------------------------------------
        player.itemArraySet("myFloorsTime", idx, this.lastTime[idx]);
    },

    //加载某层楼的进度条
    loadPros(idx) {
        //获取并记录一次收益所需时间
        var needTime = this.countProfitTime(idx);
        if (needTime <= 1) {
            mainScript.floorList[idx].bar.active = false;
            mainScript.floorList[idx].maxBar.active = true;
        }else{
            mainScript.floorList[idx].bar.active = true;
            mainScript.floorList[idx].maxBar.active = false;
        }
        var prosTime = ((new Date().getTime() / 1000) - this.lastTime[idx]);
        if (prosTime - needTime > 10) {
            this.lastTime[idx] = (new Date().getTime() / 1000) + 6;
        }
        //计算进度条当前进度
        var curPros = prosTime / needTime;
        //给进度条赋值并给与回调函数
        viewManager.lerpAction(
            curPros * 100,//当前进度
            (1 - curPros) * 100,//剩余进度
            needTime * (1 - curPros),//剩余时间
            //进度条操作
            function (obj) {
                if(needTime > 1){
                    mainScript.floorList[idx].earnPros.progress = obj.x / 100;
                }
                if (obj.x >= 99.99) {
                    mainScript.floorList[idx].earnPros.progress = 0;
                    this.closeShop(idx);
                }
            }.bind(this),
            "" + idx,
        )
    },

    //关店
    closeShop(idx) {
        //获得收益
        this.getProfit(idx);
        //如果有员工自动开店
        this.managerOpenJudge(idx);
    },

    //管理员自动开店
    managerOpenJudge(idx) {
        if (mainScript.floorList[idx].managerIdx != null) {
            this.openShop(idx);
        } else {
            this.lastTime[idx] = -1;
            player.itemArraySet("myFloorsTime", idx, this.lastTime[idx]);
            mainScript.floorList[idx].closeSprite.node.active = true;
        }
    },

    //获取收益
    getProfit(idx) {
        var profit = this.countProfit(idx);
        player.itemArrayAdd("pCurrency", 0, profit);
    },

    //培训员工
    train(idx, num) {
        var maxNum = this.countBatTrain(idx, num);
        if (maxNum.cost > player.itemArrayGet("pCurrency", 0)) {
            return;
        } else {
            //扣钱并升级
            player.itemArrayAdd("pCurrency", 0, -maxNum.cost, function () {
                effectManager.particleShow(mainScript.floorList[idx].upBtn.node, 0);
                //本地经验调升并且储存到远程
                mainScript.floorInfoList[idx][3] = mainScript.floorInfoList[idx][3] + num;
                //本地等级调升并且储存到远程
                this.countTrainResult(idx);
                //储存数据到远端
                var myFloors = [idx, mainScript.floorInfoList[idx][1], mainScript.floorInfoList[idx][2], mainScript.floorInfoList[idx][3]];
                player.itemArraySet("myFloors", idx, myFloors, function () {
                    mainScript.floorInfoList[idx] = myFloors;
                    mainScript.loadFloor(idx);
                }.bind(this));
            }.bind(this));
        }
    },

    //计算楼层等级
    countTrainResult(idx) {
        var start = mainScript.floorInfoList[idx][2];
        for (var i = start; i < 5; i = i + 1) {
            var expNeed = this.levelConfig[i];
            if (mainScript.floorInfoList[idx][3] >= expNeed) {
                mainScript.floorInfoList[idx][2] = i + 1;
            }
        }
    },

    //计算开启楼层的价格
    countFloorCost(idx) {
        var openCost = this.floorCostList[idx];
        if (openCost == null) {
            openCost = 25000;
            if (idx == 1) {
                openCost = 1000;
            } else if (idx == 0) {
                openCost = 100;
            }
            for (var i = 3; i <= idx; i = i + 1) {
                openCost = openCost * 20;
                this.floorCostList[idx] = openCost;
            }
        }
        return parseFloat(openCost.toFixed(3));
    },

    //计算收益
    countProfit(idx) {
        //获取收益的时间
        var getProfitTime = this.lastTime[idx] + this.lastNeedTime[idx];
        //最基础收益
        this.floorProfitList[0] = 100;
        var profit = this.floorProfitList[0];
        //培训的收益记录
        if (this.trainProfitList[0] == null) {
            this.trainProfitList[0] = {};
            this.trainProfitList[0][0] = this.floorProfitList[0];
        }
        //楼层基础收益计算
        for (var i = 1; i <= idx; i = i + 1) {
            if (this.floorProfitList[i] == null) {
                if (idx % 5 == 0) {
                    profit = profit * 30;
                } else {
                    profit = profit * 10;
                }
                this.floorProfitList[i] = profit;
            } else {
                profit = this.floorProfitList[i];
            }
            //培训的收益记录
            if (this.trainProfitList[i] == null) {
                this.trainProfitList[i] = {};
                this.trainProfitList[i][0] = this.floorProfitList[i];
            }
        }
        var base = this.floorProfitList[idx];
        //培训次数收益计算
        for (var i = 1; i <= mainScript.floorInfoList[idx][3]; i = i + 1) {
            if (this.trainProfitList[idx][i] == null) {
                profit = profit + (base * 0.15);
                this.trainProfitList[idx][i] = profit;
            } else {
                profit = this.trainProfitList[idx][i];
            }
        }

        //管家收益
        var curManager = this.judgeHasManager(idx);
        if (curManager != null) {
            //类型为爆发类的管家
            if (curManager[1] == 0) {
                var proVal = 1;
                if (curManager[8] - getProfitTime > 0) {
                    proVal = proVal + managerScript.countSkillEffect(0.5, curManager[5]);
                    //技能效果
                    profit = profit * proVal;
                }
            }
            profit = profit * Math.pow(1.01, curManager[4]);
        }

        //声望技能效果
        var preSkillList = prestigeScript.selectInfo[1].infoList;
        var prePercent = 0;
        for (var i = 0; i < preSkillList.length; i = i + 1) {
            var useTime = player.itemArrayGet("preSkill", i);
            var duringTime = preSkillList[i].time;
            if (useTime != 0) {
                if (useTime + duringTime > getProfitTime) {
                    prePercent = prePercent + preSkillList[i].profit;
                }
            }
        }
        if (prePercent > 0) {
            profit = profit * prePercent;
        }

        //永久性道具的加成计算
        var effectIdx = this.goodSkills[0][0];
        if (effectIdx >= 0) {
            var effect = this.goodSkillsEffect[0][0][effectIdx];
            var per = effect.per;
            profit = profit * per;
        }

        var propPercent = 0;
        //一次性道具的加成计算
        for (var i = 3; i < 8; i = i + 1) {
            effectIdx = this.goodSkills[1][i];//获取一次性道具中第一种类型的使用状态
            if (effectIdx >= 0) {
                //判断技能时间是否结束
                if (this.goodSkillsTime[1][i] >= getProfitTime) {
                    //获取一次性道具中第一种类型的第effectIdx个等级的信息
                    var effect = this.goodSkillsEffect[1][i][effectIdx];
                    propPercent = propPercent + effect.per;
                }
            }
        }
        if (propPercent > 0) {
            profit = profit * propPercent;
        }

        //进度条时间小于一的收益处理
        var needTime = this.countProfitTime(idx);
        if (needTime <= 1) {
            profit = profit/needTime;
        }

        return parseFloat(profit.toFixed(2));
    },

    //计算收益需要的时间
    countProfitTime(idx) {
        var getProfitTime = this.lastTime[idx] + this.lastNeedTime[idx];
        var time = 6;
        var curManager = this.judgeHasManager(idx);
        if (curManager != null) {
            //类型为加速型的管家
            if (curManager[1] == 1) {
                var proVal = 1;
                if (curManager[8] - getProfitTime > 0) {
                    proVal = proVal - managerScript.countSkillEffect(0.25, curManager[5]);
                    //技能效果
                    time = time * proVal;
                }
            }
        }

        //等级时间计算
        time = time * Math.pow(0.5, mainScript.floorInfoList[idx][2]);

        if(time < 1){
            time = 1;
        }

        return parseFloat(time.toFixed(2));
    },

    //计算升级所需要的金币
    countTrainConsume(idx, lv) {
        if (this.trainCostList[idx] == null) {
            this.trainCostList[idx] = {};
        }
        var baseCost = this.trainCostList[idx][lv];
        if (baseCost == null) {
            baseCost = this.countFloorCost(idx);
            for (var i = 0; i <= lv; i = i + 1) {
                baseCost = baseCost * 1.15;
                this.trainCostList[idx][i] = baseCost;
            }
        }
        return parseFloat(baseCost.toFixed(2));
    },

    //计算批量购买所需要的金币
    countBatTrain(idx, num) {
        var total = 0;//升级总金额
        var max = 0;//升级总次数
        var isNoEnd = (num == -1 ? true : false);
        var start = parseInt(mainScript.floorInfoList[idx][3]);
        var end = start + num;
        if (isNoEnd) {
            end = 385;
        }
        for (var i = start + 1; i <= end && i <= 385; i = i + 1) {
            total = total + this.countTrainConsume(idx, i);
            if (total > player.itemArrayGet("pCurrency", 0) && isNoEnd) {
                if (max != 0) {
                    total = total - this.countTrainConsume(idx, i);
                } else {
                    max = 1;
                }
                break;
            }
            max = max + 1;
        }
        var result = {};
        result.num = max;

        var curManager = this.judgeHasManager(idx);
        if (curManager != null) {
            //类型为减费用型的管家
            if (curManager[1] == 2) {
                var nowTime = new Date().getTime() / 1000;
                var proVal = 1;
                if (curManager[8] - nowTime > 0) {
                    proVal = proVal - managerScript.countSkillEffect(0.3, curManager[5]);
                    //技能效果
                    total = total * proVal;
                }
            }
        }
        result.cost = parseFloat(total.toFixed(2));
        return result;
    },

    //判断是否有管家
    judgeHasManager(idx) {
        if (mainScript.floorList[idx] == null) {
            return null;
        }
        var managerIdx = mainScript.floorList[idx].managerIdx;
        var curManager = null;
        if (managerIdx != null) {
            curManager = managerScript.managerInfoList[managerIdx];
        }
        return curManager;
    },

    // update (dt) {},
});
