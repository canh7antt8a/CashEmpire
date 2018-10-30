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
        //对应的key储存对应界面的idx
        idxList: {
            default: {},
            visible: false,
        },
        //特效界面
        effectView: {
            default: null,
            type: cc.Node,
            visible: false,
        },
        //特效物体储存
        effectList: {
            default: [],
            type: [cc.Node],
            visible: false,
        },
        //粒子物体储存
        particleList: {
            default: [],
            type: [cc.Node],
            visible: false,
        },
        //计时事件
        eventList: {
            default: null,
            visible: false,
        },
    },
    onLoad() {
        window.effectManager = this;
        

    },

    start() {
        //设置特效界面
        if (this.effectView == null) {
            this.effectView = new cc.Node("EffectView");
            this.effectView.width = cc.winSize.width;
            this.effectView.height = cc.winSize.height;
            this.effectView.parent = cc.director.getScene().getChildByName('Canvas');
            this.effectView.setSiblingIndex(this.effectView.parent.childrenCount);
            this.effectView.zIndex = 10001;
            this.effectView.position = cc.v2(0, 0);
        }
        resManager.loadPrefab("MoneyParticle", function (prefab) {
            this.particleList[0] = cc.instantiate(prefab);
            this.particleList[0].parent = this.effectView;
        }.bind(this))

    },

    // update (dt) {},

    //奖励动画效果
    flyReward(num, name, target, start, cb) {
        soundManager.playSound("getCoin");
        //起点
        let begin = cc.v2(0, 0);;
        if (start != null) {
            begin = start.parent.convertToWorldSpaceAR(start.position);
            begin = this.effectView.convertToNodeSpaceAR(begin);
        }

        //终点
        let dis = cc.v2(0, 500);
        if (target != null) {
            dis = target.parent.convertToWorldSpaceAR(target.position);
            dis = this.effectView.convertToNodeSpaceAR(dis);
        }

        resManager.loadSprite("ui." + name, function (spriteFrame) {
            for (var i = 0; i < num; i++) {
                var reward = this.effectList.pop();
                if (reward == null) {
                    reward = new cc.Node(i);
                }
                reward.active = false;
                var sprite = reward.getComponent(cc.Sprite);
                if (sprite == null) {
                    sprite = reward.addComponent(cc.Sprite);
                }
                reward.parent = this.effectView;
                reward.position = begin;
                sprite.spriteFrame = spriteFrame;
                this.flyAnim(reward, dis, cb, i);
            }
        }.bind(this));
    },

    //飞行移动动作
    flyAnim(reward, dis, cb, i) {
        reward.active = true;
        reward.scale = 0;
        this.scheduleOnce(function () {
            reward.runAction(
                cc.spawn(
                    cc.moveTo(0.8, cc.v2(dis.x, dis.y)),
                    cc.sequence(
                        cc.scaleTo(0.4, 1.1),
                        cc.scaleTo(0.4, 0),
                        //用于只执行一次的
                        cc.callFunc(function () {
                            if (cb != null) {
                                cb()
                            }
                            this.effectList.push(reward);
                        }.bind(this), this)
                    )
                )
            );
        }.bind(this), i * 0.1);
    },

    //左右摇摆晃动
    shake(node) {
        node.runAction(cc.repeatForever(cc.sequence(
            cc.rotateTo(0.1, 5).easing(cc.easeIn(2)),
            cc.rotateTo(0.2, -5).easing(cc.easeIn(2)),
            cc.rotateTo(0.2, 5).easing(cc.easeIn(2)),
            cc.rotateTo(0.1, 0).easing(cc.easeIn(2)),
            cc.delayTime(0.5)
        )));
    },

    //模拟心跳
    scaleUpAndDowm(node) {
        node.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.scaleTo(0.3, 1.1).easing(cc.easeIn(2)),
                    cc.scaleTo(0.6, 0.9).easing(cc.easeIn(2)),
                    cc.scaleTo(0.6, 1.1).easing(cc.easeIn(2)),
                    cc.scaleTo(0.6, 0.9).easing(cc.easeIn(2)),
                )
            )
        );
    },

    //
    particleShow(node, i) {
        var effect = cc.instantiate(this.particleList[i]);
        effect.parent = this.effectView;
        var pos = viewManager.getUIPosition(node, this.effectView);
        effect.position = pos;
        effect.active = true;
    },

});
