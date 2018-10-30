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
        //执照信息
        licenseInfoList: {
            default: [],
            visible: false,
        },
        //当前历程杯最大等级
        curBigLevel: {
            default: 0,
            visible: false,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        window.buildManager = this;
    },

    start() { },

    //计算离线收益
    countOfflineProfit() {
        var totalOfflineProfit = 0;
        for (var idx = 0; idx < mainScript.floorInfoList.length; idx = idx + 1) {
            if (mainScript.floorInfoList[idx] != null && mainScript.floorInfoList[idx] != "undefined" && mainScript.floorInfoList[idx] != undefined) {
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
    openFloor(idx) {
        //获取执照的信息
        var info = this.licenseInfoList[idx];
        //判断是否够钱开启
        var openCost = this.countFloorCost(idx);
        if (player.itemArrayGet("pCurrency", 0) >= openCost) {
            player.itemArrayAdd("pCurrency", 0, -openCost, function () {
                //转盘显示
                var cCount = player.itemArrayGet("CircleCount", 0);
                if (cCount == -1 && idx == 5) {
                    player.itemArraySet("CircleCount", 0, 1);
                    guideScript.checkGuide(6);
                }

                var node = mainScript.floorList[idx].closeSprite.node;
                if (node.active && mainScript.floorInfoList[idx] != null && mainScript.floorInfoList[idx] != "undefined" && mainScript.floorInfoList[idx] != undefined) {
                    node.active = false;
                    this.openShop(idx);
                }

                //记录开楼
                var bornTimes = player.getData("BornTimes");
                var b = (bornTimes > 99 ? bornTimes : (bornTimes > 9 ? "0" + bornTimes : "00" + bornTimes));
                gameApplication.DataAnalytics.doEvent(b + "_" + idx);

                //开启楼层成就
                player.itemArrayAdd("pAchievement", 4,  1);

                soundManager.playSound("openFloor");
                //储存开店数据
                var myFloors = [idx/* 楼层 */, info.idx/* 店铺类型 */, 0/* 店铺等级 */, 0/* 店铺经验 */];
                player.itemArraySet("myFloors", idx, myFloors, function () {
                    //设置最后开店时间和最后一次所需的收益时间
                    this.lastNeedTime[idx] = 6;
                    this.lastTime[idx] = 0;
                    player.itemArraySet("myFloorsTime", idx, this.lastTime[idx]);
                    mainScript.floorInfoList[idx] = myFloors;
                    mainScript.loadFloor(idx, true);
                }.bind(this));
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
        if (this.lastTime[idx] != 0 && this.lastTime[idx] != -1 && this.lastTime[idx] != null && this.lastTime[idx] != "undefined") {
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
        } else {
            mainScript.floorList[idx].bar.active = true;
            mainScript.floorList[idx].maxBar.active = false;
        }
        var prosTime = ((new Date().getTime() / 1000) - this.lastTime[idx]);
        if (prosTime - needTime > 10) {
            this.lastTime[idx] = (new Date().getTime() / 1000) + 6;
        }
        //计算进度条当前进度
        var curPros = prosTime / needTime;
        if (needTime <= 1) {
            var curPros = prosTime / 1;
        }
        //给进度条赋值并给与回调函数
        viewManager.lerpAction(
            curPros * 100,//当前进度
            (1 - curPros) * 100,//剩余进度
            needTime * (1 - curPros),//剩余时间
            //进度条操作
            function (obj) {
                if (needTime > 1) {
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
        //防报错
        if (mainScript.floorInfoList.length <= 0) {
            return;
        }
        //获得收益
        var profit = this.countProfit(idx);
        this.getProfit(idx);
        mainScript.floorList[idx].maxBar.active = false;
        //如果有员工自动开店
        this.managerOpenJudge(idx, profit);
    },

    //管理员自动开店
    managerOpenJudge(idx, profit) {
        if (managerScript.managerInfoList[idx] != null && managerScript.managerInfoList[idx] != undefined && managerScript.managerInfoList[idx] != "undefined") {
            this.openShop(idx);
        } else {
            this.lastTime[idx] = -1;
            player.itemArraySet("myFloorsTime", idx, this.lastTime[idx]);
            mainScript.floorList[idx].closeSprite.node.active = true;
            effectManager.flyText(gameApplication.countUnit(profit)[2], mainScript.floorList[idx].closeSprite.node);
            soundManager.playSound("getProfit");
        }
    },

    //获取收益
    getProfit(idx) {
        var profit = this.countProfit(idx);
        player.itemArrayAdd("pCurrency", 0, profit);
    },

    //升级楼层
    train(idx, num) {
        var maxNum = this.countBatTrain(idx, num);
        if (maxNum.cost > player.itemArrayGet("pCurrency", 0)) {
            return;
        } else {
            //扣钱并升级
            player.itemArrayAdd("pCurrency", 0, -maxNum.cost, function () {
                //升级店铺成就
                player.itemArrayAdd("pAchievement", 1,  num);

                soundManager.playSound("train");
                //升级特效
                mainScript.floorList[idx].upgrade.stopAllActions();
                mainScript.floorList[idx].upgrade.opacity = 255;
                mainScript.floorList[idx].upgrade.runAction(cc.fadeOut(0.2).easing(cc.easeIn(3)));

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
            var expNeed = this.levelConfig.level[i];
            if (mainScript.floorInfoList[idx][3] >= expNeed) {
                mainScript.floorInfoList[idx][2] = i + 1;
                mainScript.showLevelTips(idx);
            }
        }
        var overFive = mainScript.floorInfoList[idx][3] - this.levelConfig.level[4];
        if (overFive >= 100) {
            var level = Math.floor(overFive / 100);
            mainScript.floorInfoList[idx][2] = 5 + level;
        }

        //引导里程碑
        if (mainScript.floorInfoList[idx][2] == 1) {
            guideScript.checkGuide(4);
        }

        var totalLevel = 100000;
        for (var idx = 0; idx < 10; idx = idx + 1) {
            if (mainScript.floorInfoList[idx] != null && mainScript.floorInfoList[idx] != "undefined" && mainScript.floorInfoList[idx] != undefined) {
                var level = mainScript.floorInfoList[idx][2];
                if (level < totalLevel) {
                    totalLevel = level;
                }
            } else {
                totalLevel = 0;
            }
        }

        if (totalLevel > this.curBigLevel) {
            this.curBigLevel = totalLevel;
            player.setData("AchieveLevel", totalLevel);
            effectManager.achieveFly();
            soundManager.playSound("bigLevel");
        }

    },

    //计算开启楼层的价格
    countFloorCost(idx) {
        var openCost = this.levelConfig.cost[idx];
        //处理大楼难度
        if (player.worldId == 1) {
            openCost = openCost * 8;
        } else if (player.worldId == 2) {
            openCost = openCost * 32;
        } else if (player.worldId == 3) {
            openCost = openCost * 96;
        } else if (player.worldId == 4) {
            openCost = openCost * 192;
        }
        return parseFloat(openCost.toFixed(3));
    },

    //计算收益
    countProfit(idx) {
        if (mainScript.floorInfoList[idx] == null || mainScript.floorInfoList[idx] == "undefined" || mainScript.floorInfoList[idx] == undefined) {
            return 0;
        }
        //获取收益的时间
        var getProfitTime = this.lastTime[idx] + this.lastNeedTime[idx];
        if (isNaN(getProfitTime)) {
            getProfitTime = gameApplication.getCurTime();
        }
        //楼层基础收益计算
        for (var i = 0; i <= idx; i = i + 1) {
            //培训的收益记录
            if (this.trainProfitList[i] == null) {
                this.trainProfitList[i] = {};
            }
        }
        //获取基础收益以及楼层等级
        var profit = this.levelConfig.profit[idx];
        //处理大楼难度
        if (player.worldId == 1) {
            profit = profit * 8;
        } else if (player.worldId == 2) {
            profit = profit * 32;
        } else if (player.worldId == 3) {
            profit = profit * 96;
        } else if (player.worldId == 4) {
            profit = profit * 192;
        }
        var lv = mainScript.floorInfoList[idx][3];
        //培训次数收益计算,判断是否计算过，计算过则直接使用缓存
        //if (this.trainProfitList[idx][lv] == null) {
        profit = profit * (lv + 1);
        this.trainProfitList[idx][lv] = profit;
        //} else {
        //    profit = this.trainProfitList[idx][lv];
        //}
        //管家收益

        var curManager = this.judgeHasManager(idx);
        if (curManager != null) {

            //类型为爆发类的管家
            if (curManager[1] == 0) {
                //训练界面的效果
                if (window.trainScript != null && window.trainScript != undefined && window.trainScript.curManagerIdx == idx) {
                    var mLV = curManager[5];
                    var needTime = this.countProfitTime(idx);
                    var total = 0.5 * Math.pow(1.1, mLV) * profit / needTime;
                    var nextTotal = 0.5 * Math.pow(1.1, (mLV + 1)) * profit / needTime;
                    trainScript.valList[0].string = "+" + gameApplication.countUnit(total)[2] + "/s( +" + gameApplication.countUnit(nextTotal - total)[2] + "/s )";
                }

                //技能效果
                var proVal = 1;
                if (curManager[8] - getProfitTime > 0) {
                    proVal = proVal + managerScript.countSkillEffect(0.5, curManager[5]);

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


        //基础的收益
        var baseProfit = profit;


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
                if (this.goodSkillsTime[1][i] < gameApplication.getCurTime()) {
                    //重置一次性道具的使用状态
                    this.goodSkills[1][i] = -1;
                    player.itemArraySet("goodSkills", 1, this.goodSkills[1]);
                }
            }
        }

        //加速效果显示处理
        var isShowEffect = false;
        var effectVal = 0;
        if (propPercent > 0) {
            isShowEffect = true;
            effectVal = propPercent;
            profit = profit * propPercent;
        } else {
            isShowEffect = false;
        }

        //里程碑总加成
        var totalLevel = 100000;
        for (var i = 0; i < 10; i = i + 1) {
            if (mainScript.floorInfoList[i] != null && mainScript.floorInfoList[i] != "undefined" && mainScript.floorInfoList[i] != undefined) {
                var level = mainScript.floorInfoList[i][2];
                if (level < totalLevel) {
                    totalLevel = level;
                }
            } else {
                totalLevel = 0;
            }
        }
        profit = profit * (Math.pow(2, totalLevel));

        //声望加成
        var prestige = player.itemArrayGet("pCurrency", 3);
        prestige = prestige / 100;
        profit = profit * (1 + prestige);

        //处理视频广告增益效果
        var adBuffTime = player.getData("AdBuffTime");
        var curTime = gameApplication.getCurTime();
        //是否还有增益时间
        if (adBuffTime >= getProfitTime) {
            isShowEffect = true;
            effectVal = effectVal + 2;
            profit = profit + (2 * baseProfit);
        } else if (adBuffTime >= curTime) {
            isShowEffect = true;
            effectVal = effectVal + 2;
        }

        //进度条时间小于一的收益处理
        var needTime = this.countProfitTime(idx);

        if (needTime <= 1) {
            profit = profit / needTime;
        }

        //加速显示处理时
        if (isShowEffect) {
            mainScript.floorList[idx].propEffect.active = true;
            mainScript.floorList[idx].propEffectText.string = "X" + effectVal;
        } else {
            mainScript.floorList[idx].propEffect.active = false;
        }

        return parseFloat(profit.toFixed(2));
    },

    //计算收益需要的时间
    countProfitTime(idx) {
        var getProfitTime = this.lastTime[idx] + this.lastNeedTime[idx];
        var time = this.levelConfig.profitTime[idx];
        var curManager = this.judgeHasManager(idx);
        if (curManager != null) {
            //类型为加速型的管家
            if (curManager[1] == 1) {

                //训练界面的效果
                if (window.trainScript != null && window.trainScript != undefined && window.trainScript.curManagerIdx == idx) {
                    var mLV = curManager[5];
                    var val = 0.25 * Math.pow(1.1, mLV) * time;
                    var nextVal = 0.25 * Math.pow(1.1, (mLV + 1)) * time;
                    trainScript.valList[0].string = "-" + val.toFixed(2) + "s/once( " + (nextVal - val).toFixed(2) + "s/once )";
                }
                //技能效果
                var proVal = 1;
                if (curManager[8] - getProfitTime > 0) {
                    proVal = proVal - managerScript.countSkillEffect(0.25, curManager[5]);
                    time = time * proVal;
                }
            }
        }
        //等级时间计算
        time = time * Math.pow(0.5, mainScript.floorInfoList[idx][2]);

        return parseFloat(time.toFixed(2));
    },

    //计算升级所需要的金币
    countTrainConsume(idx, lv) {
        if (this.trainCostList[idx] == null) {
            this.trainCostList[idx] = {};
        }
        var baseCost = this.countFloorCost(idx);
        if (baseCost == 0 && idx == 0) {
            baseCost = 4;
            /* //处理大楼难度
            if (player.worldId == 1) {
                baseCost = baseCost * 8;
            } else if (player.worldId == 2) {
                baseCost = baseCost * 32;
            } else if (player.worldId == 3) {
                baseCost = baseCost * 96;
            } else if (player.worldId == 4) {
                baseCost = baseCost * 192;
            } */
        }
        baseCost = baseCost * Math.pow(this.levelConfig.costPer[idx], lv - 1);
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
            end = 100000000;
        }
        for (var i = start + 1; i <= end; i = i + 1) {
            total = total + this.countTrainConsume(idx, i);
            //是否钱还足够
            if (total > player.itemArrayGet("pCurrency", 0) && isNoEnd) {
                //判断能否升级
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

                //训练界面的效果
                if (window.trainScript != null && window.trainScript != undefined && window.trainScript.curManagerIdx == idx) {
                    var mLV = curManager[5];
                    var val = 0.3 * Math.pow(1.1, mLV) * total;
                    var nextVal = 0.3 * Math.pow(1.1, (mLV + 1)) * total;
                    trainScript.valList[0].string = "-" + gameApplication.countUnit(val)[2] + "( " + gameApplication.countUnit(nextVal - val)[2] + " )";
                }

                //技能效果
                var proVal = 1;
                var nowTime = new Date().getTime() / 1000;
                if (curManager[8] - nowTime > 0) {
                    proVal = proVal - managerScript.countSkillEffect(0.3, curManager[5]);
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
        if (curManager == undefined || curManager == "undefined" || curManager == null) {
            return null;
        }
        return curManager;
    },

    // update (dt) {},
});
