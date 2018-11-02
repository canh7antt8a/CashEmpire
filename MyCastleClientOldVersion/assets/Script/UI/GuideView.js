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
        hand: {
            default: null,
            type: cc.Node,
        },
        guider: {
            default: null,
            type: cc.Node,
        },
        talkBg: {
            default: null,
            type: cc.Node,
        },
        talkText: {
            default: null,
            type: cc.Label,
        },
        maskContent: {
            default: null,
            type: cc.Node,
        },
        touchMask: {
            default: null,
            type: cc.Node,
        },
        maskLeft: {
            default: null,
            type: cc.Node,
        },
        maskRight: {
            default: null,
            type: cc.Node,
        },
        maskTop: {
            default: null,
            type: cc.Node,
        },
        maskBottom: {
            default: null,
            type: cc.Node,
        },
        guideList: {
            default: null,
            visible: false,
        },
        targetNode: {
            default: null,
            type: cc.Node,
        },
        hands: {
            default: [],
            type: [cc.Node],
            visible: false,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        window.guideScript = this;
    },

    onEnable() {
        this.countTime = 0;
    },

    onDisable() {
        this.touchMask.off(cc.Node.EventType.TOUCH_START);
        this.touchMask.height = 0;
        this.touchMask.active = false;
        this.isGuiding = false;
        var top = this.maskTop.getComponent(cc.Widget);
        top.bottom = 0;
        top.updateAlignment();
        this.hand.active = false;
        this.targetNode = null;
    },

    start() { },

    setStep(idx) {
        cc.sys.localStorage.setItem('guideStep' + idx, 1);
    },

    checkGuide(idx) {
        if (this.guideList == null) {
            resManager.loadConfig("GuideList", function (cof) {
                //获取新手任务数据
                this.guideList = cof.guideList;
                this.checkGuide(idx)
            }.bind(this));
        } else {
            var isPass = cc.sys.localStorage.getItem('guideStep' + idx);
            var oldV = cc.sys.localStorage.getItem('guideStep');
            if (oldV == null || oldV == undefined) {
                oldV = -1;
            }
            oldV = parseInt(oldV);
            if (isPass == 1 || idx <= oldV) {
                return;
            }
            //设置通过
            this.setStep(idx);
            //显示引导
            this.goGuide(idx);
        }
    },

    //引导
    goGuide(idx) {
        viewManager.popView("GuideView", true, function (view) {
            if (idx == 2) {
                mainScript.buyCount.string = "Max";
                mainScript.menuClick(null, "buyCount");
            }
            //小可乐
            if (idx == 5) {
                var oldStore = player.getArrayAll("pProp");
                //仓储更新
                var oldVal = oldStore[1][6];
                if (oldVal < 1) {
                    oldStore[1][6] = oldVal + 1;
                }
                player.itemArraySet("pProp", 1, oldStore[1]);
            }
            //现金道具
            if (idx == 8) {
                var oldStore = player.getArrayAll("pProp");
                //仓储更新
                var oldVal = oldStore[1][3];
                if (oldVal < 1) {
                    oldStore[1][3] = oldVal + 1;
                }
                player.itemArraySet("pProp", 1, oldStore[1]);
            }
            this.guideSteps(idx);
        }.bind(this))
    },

    //引导的步骤
    guideSteps(id) {
        //设置话语
        this.talkText.getComponent("LocalizedLabel").dataID = this.guideList[id].talk;

        //显示界面
        var tView = this.guideList[id].view;
        if (tView != null) {
            viewManager.popView(tView, true, function (view) {
                var script = view.getComponent(tView);
                if (script == null) {
                    script = view.script;
                }
                script.initView(function () {
                    //刨洞
                    this.getTargetShow(id);
                    //将新手引导置顶
                    this.node.setSiblingIndex(this.node.parent.childrenCount);
                }.bind(this))
            }.bind(this))
        } else {
            //刨洞
            this.getTargetShow(id);
        }
        this.node.setSiblingIndex(this.node.parent.childrenCount);
    },

    //显示目标按钮
    getTargetShow(id) {
        var targetNode = null;
        if (this.guideList[id].target != null) {
            var targetNode = cc.find(this.guideList[id].target);
        }

        //点击函数绑定
        this.touchMask.off(cc.Node.EventType.TOUCH_START);
        this.hand.stopAllActions();

        //打洞
        this.getPosition(targetNode, id);

        //绑定点击事件
        if (targetNode == null) {
            this.touchMask.active = true;
            this.touchMask.position = cc.v2(0, 0);
            this.touchMask.width = cc.winSize.width;
            this.touchMask.height = cc.winSize.height;
            this.touchMask.on(cc.Node.EventType.TOUCH_START, function () {
                viewManager.popView("GuideView", false);
            }.bind(this), this);
        } else {
            this.touchMask.active = false;
            targetNode.on("click", function () {
                this.hands[id].destroy();
                viewManager.popView("GuideView", false);
                targetNode._bubblingListeners._callbackTable.click.cancel(1);
            }.bind(this), this);
        }
    },

    //设置开洞位置
    getPosition(target, idx) {
        if (target == null) {
            var left = this.maskLeft.getComponent(cc.Widget);
            left.right = 0/* cc.winSize.width */;
            left.updateAlignment();
            var right = this.maskRight.getComponent(cc.Widget);
            right.left = 0/* cc.winSize.width */;
            right.updateAlignment();
            var top = this.maskTop.getComponent(cc.Widget);
            top.bottom = 0/* cc.winSize.height / 2 */;
            top.updateAlignment();
            var bottom = this.maskBottom.getComponent(cc.Widget);
            bottom.top = 0/* cc.winSize.height / 2 */;
            bottom.updateAlignment();
        } else {
            this.targetNode = target;
            var pos = viewManager.getUIPosition(target, this.maskContent);
            var hand = cc.instantiate(this.hand);
            this.hands[idx] = hand;
            hand.parent = target;
            hand.position = cc.v2(0, 20);
            hand.active = true;
            hand.runAction(
                cc.repeatForever(
                    cc.sequence(
                        cc.moveBy(0.5, cc.p(0, -20)),
                        cc.moveBy(0.5, cc.p(0, 20))
                    )
                )
            );
            if (target != null) {
                this.maskLeft.height = target.height;
                this.maskLeft.y = pos.y;
                var left = this.maskLeft.getComponent(cc.Widget);
                left.right = 0/* (cc.winSize.width / 2 - pos.x + (target.width / 2)) */;
                left.updateAlignment();

                this.maskRight.height = target.height;
                this.maskRight.y = pos.y;
                var right = this.maskRight.getComponent(cc.Widget);
                right.left = 0/* (cc.winSize.width / 2 + pos.x + (target.width / 2)) */;
                right.updateAlignment();

                var top = this.maskTop.getComponent(cc.Widget);
                top.bottom = 0/* (cc.winSize.height / 2 + pos.y + (target.height / 2)) */;
                top.updateAlignment();

                var bottom = this.maskBottom.getComponent(cc.Widget);
                bottom.top = 0/* (cc.winSize.height / 2 - pos.y + (target.height / 2)) */;
                bottom.updateAlignment();
            }
        }
    },

    update(dt) {
    },
});
