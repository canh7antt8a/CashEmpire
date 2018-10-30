var Utils = require("./utils/SDKUtils");
var GAME_CHECK_URL = "https://haiwai.31home.com:8003/games.detail";
var GAME_RECOMMEND_URL = "https://haiwai.31home.com:8003/games.recommend";
var GAME_STAT_URL = "https://haiwai.31home.com:8003/games.stat";

var ELoadState = {
    AD_LOADING: "AD_LOADING",
    AD_LOAD_SUCCESS: "AD_LOAD_SUCCESS",
    AD_LOAD_FAIL: "AD_LOAD_FAIL",
    AD_COMPLETE: "AD_COMPLETE"
};

//SDK广告node的路径
var sdkADName = "Canvas/sdk_ad";
//视频广告ID
var video_ad_ids = ['2099185553434050_2099192553433350', '2099185553434050_2099192870099985'];

//插屏广告ID
var interstitial_ad_ids = '2099185553434050_2099190180100254';
//游戏ID
var game_id = "2099185553434050";


//广告配置为默认配置，进入游戏后会加载服务器配置，如果服务器读取失败，使用默认配置。
//每玩N局播一次插屏广告，如果<=1，代表每次播放
var interstitialCount = 2;
//是否播放视频广告
var videoOn = 1;
//是否播放插屏广告
var interstitialOn = 1;
//是否播放互推插屏广告
var interstitialOp = 0;
//好友榜单名（目前暂时不用）
var rankName_friends = "Friends";
//世界榜单名
var rankName_world = "world"//"World";

var MyPlayer = {}

var FB_SDK = function () {
    this.cb = null;
    this.videoAd = [];
    this.videoAdState = [];
    this.InterstitialAd = null;
    this.InterstitialAdState = null;
    this.playTimes = 0;

    this.sdk_ad = null;
};

/**
 * =========================================================
    * 初始化
 * =========================================================
**/

/**
    初始化
    1）执行初始化服务器配置
    2）加载视频广告、插屏广告
    3）设置语言
*/
FB_SDK.prototype.init = function (cb) {
    if (typeof FBInstant === 'undefined') {
        if (cb != null) {
            cb()
        }
        return;
    }
    this.playTimes = 0;

    //预加载视频广告和插屏广告
    if (cc.sys.os != cc.sys.OS_WINDOWS) {
        //预加载视频广告和插屏广告
        this.loadVideoAd(0);
        this.loadVideoAd(1);
        this.loadInterstitialAd();
    }

    MyPlayer.name = FBInstant.player.getName();
    cc.loader.load(FBInstant.player.getPhoto(), function (err, texture) {
        MyPlayer.head = new cc.SpriteFrame(texture);
    });
    MyPlayer.id = FBInstant.player.getID();

    var locale = this.getLocale(); // 'en_US'
    /* FBInstant.startGameAsync().then(function () {

    }); */

    if (cb != null) {
        cb()
    }
};

FB_SDK.prototype.sePros = function (pros) {
    if (typeof FBInstant === 'undefined') {
        return;
    }
    FBInstant.setLoadingProgress(pros);
},


    /**
     * =========================================================
        * 保存、读取数据
     * =========================================================
    **/

    /**
     * 获得用户属性（一般来说可以获得设置的分数，以及用户的其他属性）
    **/
    FB_SDK.prototype.getItem = function (key, cb, type) {
        if (typeof FBInstant === 'undefined') {
            var score;
            if (type != null) {
                score = cc.sys.localStorage.getItem(key);
            } else {
                score = JSON.parse(cc.sys.localStorage.getItem(key));
            }
            if (typeof score === 'undefined' || score == null || score == "null") {
                if (key == "guideStep") {
                    score = -1;
                } else {
                    score = 0;
                }
            }
            cb(score, key);
        } else {
            var score;
            FBInstant.player
                .getDataAsync(['' + key])
                .then(function (data) {
                    //console.log('data is loaded',key,data[key]);
                    if (typeof data[key] === 'undefined') {
                        if (key == "guideStep") {
                            score = -1;
                        } else {
                            score = 0;
                        }
                        //console.log(key+"+null")
                    } else {
                        score = data[key];
                    }
                    cb(score, key);
                });
        }
    };



/**
 * 设置属性，如记录分数、记录各类和用户相关的属性
 * param要传递一个对象进来，如{score:100}
**/
FB_SDK.prototype.setItem = function (param, cb) {
    if (typeof FBInstant === 'undefined') {
        for (var p in param) {//遍历json对象的每个key/value对,p为key
            // cc.log("setScore:"+ p + "_" + param[p]);
            cc.sys.localStorage.setItem(p, param[p]);
        }
        // 
        if (cb != null) {
            cb();
        }
    } else {
        FBInstant.player
            .setDataAsync(param)
            .then(function () {
                if (cb != null) {
                    cb();
                }
                // console.log('------------data is set',param);
            });
    }
};

/**
 * =========================================================
    * 基础接口
 * =========================================================
**/

/**
 * 获得用户的国家地区语言
**/
FB_SDK.prototype.getLocale = function () {
    if (typeof FBInstant === 'undefined') return;

    return FBInstant.getLocale();
};

/**
 * 获得游戏ID
**/
FB_SDK.prototype.getGameId = function () {
    return game_id;
};

/**
 * 获得玩家昵称
**/
FB_SDK.prototype.getName = function () {
    if (typeof FBInstant === 'undefined') return "undefined";
    return FBInstant.player.getName();
};

/**
 * 创建桌面快捷方式
**/
FB_SDK.prototype.canCreateShortcutAsync = function (cb) {
    if (typeof FBInstant === 'undefined') return;

    FBInstant.canCreateShortcutAsync()
        .then(function (canCreateShortcut) {
            if (canCreateShortcut) {
                FBInstant.createShortcutAsync()
                    .then(function () {
                        // Shortcut created
                        if (cb != null) {
                            cb(true);
                        }
                    })
                    .catch(function () {
                        // Shortcut not created
                        if (cb != null) {
                            cb(false);
                        }
                    });
            } else {
                if (cb != null) {
                    cb(false);
                }
            }
        });
};

/**
 * 切换到别的游戏（互推游戏）
**/
FB_SDK.prototype.switchGameAsync = function (game_id) {
    if (typeof FBInstant === 'undefined') return false;
    FBInstant.switchGameAsync(game_id).catch(function (e) {
        // Handle game change failure
    });
};

/**
 * =========================================================
    * 支付相关
 * =========================================================
**/

/**
 * 获取游戏商品目录
 * （列表是后台添加的列表）
**/
FB_SDK.prototype.getCatalogAsync = function (cb) {
    if (typeof FBInstant === 'undefined') {
        if (cb != null) {
            cb([]);
        }
        return;
    }
    FBInstant.payments.getCatalogAsync().then(function (catalog) {
        console.log(catalog); // [{productID: '12345', ...}, ...]
        cb(catalog);
    }).catch(function (e) {
        console.log(e);
        cb([]);
    });
};

/**
 * 支付
 * 支付成功后，返回支付订单。然后调用consumePurchaseAsync使用，使用后发放道具。
**/
FB_SDK.prototype.purchaseAsync = function (productID, developerPayload, cb) {
    productID = '' + productID;
    if (typeof FBInstant === 'undefined') {
        if (cb != null) {
            cb(true, {});
        }
        return;
    }

    FBInstant.payments.purchaseAsync({
        productID: productID,
        developerPayload: productID,
    }).then(function (purchase) {
        cb(purchase);
        // {productID: '12345', purchaseToken: '54321', developerPayload: 'foobar', ...}
    }).catch(function (e) {
        console.log(e);
        cb(false, null);
    });
};

/**
 * 获取未消费的支付列表
 * (可能出现的原因是，支付成功后，断网或没有拿到订单)
 * 即：每次进入游戏后，应该请求一下是否有已支付未消费的订单。
**/
FB_SDK.prototype.getPurchasesAsync = function (cb) {

    if (typeof FBInstant === 'undefined') {
        if (cb != null) {
            cb(false, null);
        }
        return;
    }

    FBInstant.payments.getPurchasesAsync().then(function (purchases) {
        cb(purchases);
        // [{productID: '12345', ...}, ...]
    }).catch(function (e) {
        cb([]);
    });
};


/**
 * 消费已支付的订单（一定要在发物品、道具之前调用这个接口，返回成功后才能发放物品）
 * purchaseToken 为支付成功的purchaseToken
**/
FB_SDK.prototype.consumePurchaseAsync = function (purchaseToken, cb) {

    if (typeof FBInstant === 'undefined') {
        if (cb != null) {
            cb(true, {});
        }
        return;
    }

    FBInstant.payments.consumePurchaseAsync(purchaseToken).then(function () {
        // Purchase successfully consumed!
        // Game should now provision the product to the player
        cb(true);
    }).catch(function (e) {
        cb(false);
    });
};



/**
 * =========================================================
    * 分享
 * =========================================================
**/


/**
 * 分享分数
**/
FB_SDK.prototype.share = function (score, cb) {
    if (typeof FBInstant === 'undefined') {
        if (cb != null) {
            cb(true);
        }
        return;
    }
    var self = this;

    FBInstant.context
        .chooseAsync()
        .then(function () {
            // console.log("FBInstant.context.getID():",FBInstant.context.getID());
            self.doShare(score);
            if (cb != null) {
                cb(true);
            }
        }
        ).catch(function (e) {
            // console.log("catch",e);
            if (e.code != null && e.code == "SAME_CONTEXT") {
                //相同的用户或group，不能再次发消息
                if (cb != null) {
                    cb(false);
                }
            }
        });
};

/**
 * 执行分享动作
 * 并读取resources/texture2d/game_icon.png 作为分享图片
**/
FB_SDK.prototype.doShare = function (score) {
    var self = this;
    var en_text = self.getName() + "Let's play together?";
    var cn_text = self.getName() + "一起来玩吧！";
    // console.log("share:"+en_text);
    var random = Math.floor(Math.random() * 2.99);
    var framePath = "texture2d/share" + random;
    // console.log("framePath:",framePath)
    cc.loader.loadRes(framePath, cc.Texture2D, function (err, texture) {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        canvas.width = 600;
        canvas.height = 420;

        let image = texture.getHtmlElementObj();
        ctx.drawImage(image, 0, 0);

        var base64Picture = canvas.toDataURL('image/png');

        FBInstant.updateAsync({
            action: 'CUSTOM',
            cta: 'Play Game',
            template: 'join_fight',
            image: base64Picture,
            text: en_text,
            data: { myReplayData: '...' },
            strategy: 'IMMEDIATE',
            notification: 'NO_PUSH',
        }).then(function () {
            //当消息发送后
            // console.log("____当消息发送后")
        });
    });
};

/**
 * 每三分钟提示分享，并分享最高分数
 * 并读取resources/texture2d/game_icon.png 作为分享图片
**/
FB_SDK.prototype.shareBestScore3Times = function (key) {
    SDK().getItem("share_times", function (t) {
        //如果没有设置过倒计时，那么设置为3分钟
        var now = Math.floor(Date.now() / 1000);
        // console.log("t:",t)
        // console.log("t-now:",t-now)
        if (t == null || t <= 0 || t - now < 0) {
            var param = {};
            param['share_times'] = now + 180;
            SDK().setItem(param, function () {
                SDK().shareBestScore(key);
            });
        }
    });
};

/**
 * 分享最高分数
 * 并读取resources/texture2d/game_icon.png 作为分享图片
**/
FB_SDK.prototype.shareBestScore = function (key, cb) {
    if (key == null || key == "") {
        key = "all";
    }
    this.getItem(key, function (score) {
        SDK().share(score, function (isCompleted) {
            if (cb) {
                cb(isCompleted)
            }
        });
    }.bind(this));
};


/**
 * =========================================================
    * 广告相关
 * =========================================================
**/

/**
 * 游戏次数+1
**/
FB_SDK.prototype.plusPlayTimes = function () {

    this.playTimes++;
    this.showInterstitialAd(function (isCompleted) {
        console.log("播放Done");
    }, false);
};


/**
 * 是否打开视频广告
**/
FB_SDK.prototype.openVideoAd = function () {
    return videoOn >= 1;
};

/**
 * 是否打开插屏广告
**/
FB_SDK.prototype.openinterstitialAd = function () {
    return interstitialOn >= 1;
};

/**
 * 每玩多少局播放一次插屏广告
**/
FB_SDK.prototype.getInterstitialCount = function () {
    return interstitialCount;
};

//是否显示互推广告（互相推荐自己的游戏）
FB_SDK.prototype.isPlayOpAD = function () {
    var test = Math.random() * 10;
    if (test <= interstitialOp) {
        return true;
    } else {
        return false;
    }
};

/**
 * 加载插屏广告
**/
FB_SDK.prototype.loadInterstitialAd = function () {
    if (typeof FBInstant === 'undefined') return;
    if (!this.openinterstitialAd()) {
        return;
    }

    FBInstant.getInterstitialAdAsync(
        interstitial_ad_ids,
    ).then(function (interstitial) {
        // console.log("FBInstant.getInterstitialAdAsync:",interstitial);
        this.InterstitialAd = interstitial;
        this.InterstitialAdState = ELoadState.AD_LOADING;
        return this.InterstitialAd.loadAsync();
    }.bind(this)).catch(function (e) {
        // console.log("load.showInterstitialAd catch");
        // console.log(JSON.stringify(e));
    }.bind(this))
        .then(function () {
            // console.log("FBInstant.getInterstitialAdAsync done:");
            this.InterstitialAdState = ELoadState.AD_LOAD_SUCCESS;
        }.bind(this));
};

/**
 * 播放插屏广告
**/
FB_SDK.prototype.showInterstitialAd = function (cb, noOp) {

    if (interstitialOn < 1) {
        return;
    }

    if (this.InterstitialAd != null) {
        if (typeof FBInstant === 'undefined') {
            if (cb) {
                cb(false);
            }
            return;
        };
        // console.log("show Interstitial ad start");
        this.InterstitialAd.showAsync().then(function () {
            // console.log("this.showInterstitialAd.showAsync");
            this.InterstitialAdState = ELoadState.AD_COMPLETE;
            // this.game.paused = false;
            // window.sounds.toggleMusic(false);
            if (cb) {
                cb(true);
            }

            // console.log("show showInterstitialAd success");
            this.loadInterstitialAd();
        }.bind(this))
            .catch(function (e) {
                // console.log("this.showInterstitialAd catch");
                this.InterstitialAdState = ELoadState.AD_COMPLETE;
                // this.game.paused = false;
                // window.sounds.toggleMusic(false);
                // console.log(JSON.stringify(e));
                if (cb) {
                    cb(false);
                }
            }.bind(this));
    } else {
        // console.log("show showInterstitialAd ad Stop");
        if (cb) {
            cb(false);
        }
        this.loadInterstitialAd();
    }
};

/**
 * 加载视频广告
**/
FB_SDK.prototype.loadVideoAd = function (type) {
    if (typeof FBInstant === 'undefined') return;

    if (!this.openVideoAd()) {
        return;
    }

    // console.log("FB_SDK.prototype.loadVideoAd");
    FBInstant.getRewardedVideoAsync(
        video_ad_ids[type],
    ).then(function (rewardedVideo) {
        this.videoAd[type] = rewardedVideo;
        this.videoAdState[type] = ELoadState.AD_LOADING;
        return this.videoAd[type].loadAsync();
    }.bind(this)).then(function () {
        this.videoAdState[type] = ELoadState.AD_LOAD_SUCCESS;
    }.bind(this)).catch(function (err) {
        this.videoAdState[type] = ELoadState.AD_LOADING;
        this.loadVideoAd(type);
    }.bind(this));;
};

/**
 * 是否有视频广告可以播放
**/
FB_SDK.prototype.hasVideoAd = function () {
    if (typeof FBInstant === 'undefined') {
        return false;
    };

    return this.videoAd.length > 0;
};

/**
 * 播放视频广告
**/
FB_SDK.prototype.showVideoAd = function (cb, type) {
    if (typeof FBInstant === 'undefined') {
        if (cb) {
            cb(true);
        }
        return;
    };

    // console.log("FB_SDK.prototype.showVideoAd",this.videoAd);

    if (this.videoAd[type] != null) {
        console.log("show video ad start");
        this.videoAd[type].showAsync()
            .then(function () {
                this.videoAdState[type] = ELoadState.AD_COMPLETE;
                if (cb) {
                    cb(true);
                }
                this.loadVideoAd(type);
            }.bind(this))
            .catch(function (e) {
                this.videoAdState[type] = ELoadState.AD_COMPLETE;
                // console.log(JSON.stringify(e));
                if (cb) {
                    cb(false);
                }
                this.loadVideoAd(type);
            }.bind(this));
    } else {
        console.log("show video ad Stop");
        if (cb) {
            cb(false);
        }
        this.loadVideoAd(type);
    }
};


/**
 * =========================================================
    * 统计相关
 * =========================================================
**/

/**
 * 统计显示、点击次数（统计自己的互推广告）
**/
FB_SDK.prototype.stat = function (type, gid) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && (xhr.status == 200)) {
            var response = JSON.parse(xhr.responseText);
            // console.log("______________response",response);
        }
    };

    xhr.open("GET", GAME_STAT_URL + "?game_id=" + gid + "&type=" + type, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send();
};




/**
 * =========================================================
    * 榜单
 * =========================================================
**/

/**
 * 和好友一起玩
 * id 好友ID
 * score 自己的最高分
 * cb callback
**/
FB_SDK.prototype.playWith = function (id, score, cb) {
    if (typeof FBInstant === 'undefined') {
        if (cb != null) {
            cb(true);
        }
        return;
    }
    var self = this;
    FBInstant.context
        .createAsync(id)
        .then(function () {
            // console.log("FBInstant.context.getID():",FBInstant.context.getID());
            self.doShare(score);
            if (cb != null) {
                cb(true);
            } else {
                cb(false);
            }
        }).catch(cb(false));
};




/**
 * 获取自身信息
 * cb callback
**/
FB_SDK.prototype.getSelfInfo = function () {
    if (typeof FBInstant === 'undefined') {
        /* console.log("get info fail"); */
        var random = Math.random() * 10000 + "";
        return { id: 1 };
    } else {
        return MyPlayer;
    }
}

/**
 * 保存榜单分数
**/
FB_SDK.prototype.setRankScore = function (type, score, extra, cb) {
    if (typeof FBInstant === 'undefined') {
        console.log("set rank fail");
    } else {
        var rankName;
        var contextID = FBInstant.context.getID();
        if (contextID != null) {
            contextID = "." + contextID;
        }
        if (type == 1) {
            rankName = rankName_friends;
            if (contextID == null) {
                console.log(FBInstant.context.getType());
                contextID = "";
                return;
            }
        } else if (type == 2) {
            rankName = rankName_world;
            contextID = "";
        } else {
            if (null != cb) {
                cb("wrong type")
            }
            console.log("wrong type");
            return;
        }
        FBInstant
            .getLeaderboardAsync(rankName + contextID)
            .then(leaderboard => {
                console.log(leaderboard.getName());
                return leaderboard.setScoreAsync(score, extra);
            })
            .then(() => console.log('Score saved'))
            .catch(error => console.error(error));
    }
};

/**
 * 获取自身的排行榜
**/
FB_SDK.prototype.getRankScore = function (type, cb) {
    if (typeof FBInstant === 'undefined') {
        console.log("get self rank fail");
    } else {
        var rankName;
        var contextID = FBInstant.context.getID();
        if (contextID != null) {
            contextID = "." + contextID;
        }
        if (type == 1) {
            rankName = rankName_friends;
            if (contextID == null) {
                console.log(FBInstant.context.getType());
                contextID = "";
                return;
            }
        } else if (type == 2) {
            rankName = rankName_world;
            contextID = "";
        } else {
            if (null != cb) {
                cb("wrong type")
            }
            console.log("wrong type");
            return;
        }
        FBInstant
            .getLeaderboardAsync(rankName + contextID)
            .then(leaderboard => leaderboard.getPlayerEntryAsync())
            .then(entry => {
                var info;
                if (entry != null) {
                    info = {};
                    info.id = entry.getPlayer().getID();
                    info.no = entry.getRank();
                    info.name = entry.getPlayer().getName();
                    info.score = entry.getScore();
                    info.headUrl = entry.getPlayer().getPhoto();
                }
                cb(info);
            }).catch(error => console.error(error));
    }
};

/**
 * 获取榜单百分比
**/
FB_SDK.prototype.getPercent = function (cb) {
    if (typeof FBInstant === 'undefined') {
        console.log("get rank fail");
        if (cb != null) {
            cb();
        }
    } else {
        FBInstant.getLeaderboardAsync('World')
            .then(function (leaderboard) {
                return leaderboard.getEntryCountAsync();
            })
            .then(function (count) {
                if (cb != null) {
                    cb(count);
                }
            });
    }
}

/**
 * 获取榜单
**/
FB_SDK.prototype.getWorldRank = function (type, num, offset, cb) {
    if (typeof FBInstant === 'undefined') {
        console.log("get rank fail");
    } else {
        var rankName;
        var contextID = FBInstant.context.getID();
        if (contextID != null) {
            contextID = "." + contextID;
        }
        if (type == 1) {
            rankName = rankName_friends;
            if (contextID == null) {
                console.log(FBInstant.context.getType());
                contextID = "";
                if (cb != null) {
                    cb([]);
                }
                return;
            }
        } else if (type == 2) {
            rankName = rankName_world;
            contextID = "";
        } else {
            if (null != cb) {
                cb("wrong type")
            }
            console.log("wrong type");
            return;
        }
        var playerList = [];
        FBInstant
            .getLeaderboardAsync(rankName + contextID)
            .then(leaderboard => leaderboard.getEntriesAsync(num, offset))//第一个是获取数量，第二个是起始点
            .then(entries => {
                for (var i = 0; i < entries.length; i++) {
                    playerList[i] = {};
                    playerList[i].id = entries[i].getPlayer().getID();
                    playerList[i].no = entries[i].getRank();
                    playerList[i].name = entries[i].getPlayer().getName();
                    playerList[i].score = entries[i].getScore();
                    playerList[i].headUrl = entries[i].getPlayer().getPhoto();
                }
                if (cb != null) {
                    cb(playerList);
                }
            }).catch(error => console.error(error));
    }
};


/**
 * 获取好友榜单
 * cb callback
**/
FB_SDK.prototype.getFriendRank = function (type, num, offset, cb) {
    if (typeof FBInstant === 'undefined') {
        console.log("getFriendsInfo fail");
        if (cb != null) {
            cb({});
        }
    } else {
        var rankName;
        var contextID = FBInstant.context.getID();
        if (contextID != null) {
            contextID = "." + contextID;
        }
        if (type == 1) {
            rankName = rankName_friends;
            if (contextID == null) {
                console.log(FBInstant.context.getType());
                contextID = "";
                if (cb != null) {
                    cb([]);
                }
                return;
            }
        } else if (type == 2) {
            rankName = rankName_world;
            contextID = "";
        } else {
            if (null != cb) {
                cb("wrong type")
            }
            console.log("wrong type");
            return;
        }
        var playerList = [];
        FBInstant.getLeaderboardAsync(rankName + contextID).then(
            leaderboard => leaderboard.getConnectedPlayerEntriesAsync(num, offset)
        ).then(function (entries) {
            for (var i = 0; i < entries.length; i = i + 1) {
                playerList[i] = {};
                playerList[i].id = entries[i].getPlayer().getID();
                playerList[i].name = entries[i].getPlayer().getName();
                playerList[i].headUrl = entries[i].getPlayer().getPhoto();
                playerList[i].no = entries[i].getRank();
                playerList[i].score = entries[i].getScore();
            }
            if (cb != null) {
                cb(playerList);
            }
        });
    }

}


/**
 * 
**/
FB_SDK.prototype.postRankToMessage = function (type, cb) {
    if (typeof FBInstant === 'undefined') {
        console.log("post rank fail");
    } else {
        var rankName;
        var contextID = FBInstant.context.getID();
        if (contextID != null) {
            contextID = "." + contextID;
        }
        if (type == 1) {
            rankName = rankName_friends;
            if (contextID == null) {
                console.log(FBInstant.context.getType());
                contextID = "";
                return;
            }
        } else if (type == 2) {
            rankName = rankName_world;
            contextID = "";
        } else {
            if (null != cb) {
                cb("wrong type")
            }
            console.log("wrong type");
            return;
        }
        FBInstant.updateAsync({
            action: 'LEADERBOARD',
            name: rankName + contextID
        })
            .then(() => console.log('Update Posted'))
            .catch(error => console.error(error));
    }
}

FB_SDK.prototype.getTime = function (cb) {
    FBInstant.getLeaderboardAsync('time')
        .then(function (leaderboard) {
            return leaderboard.setScoreAsync(9001)
                .then(function (entry) {
                    console.log(entry.getTimestamp()); // 1515806355
                    if (cb != null) {
                        cb(entry.getTimestamp())
                    }
                });
        })
}


/**
 * =========================================================
    * END
 * =========================================================
**/

module.exports = (function () {
    var instance;
    return function () {
        if (!instance) {
            instance = new FB_SDK();
        }
        return instance;
    }
})();


