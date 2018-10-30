cc.Class({
    extends: cc.Component,

    properties: {
        //声音源
        audioSource: {
            type: cc.AudioSource,
            default: null,
            visible: false,
        },
        //音效开关
        isOpen: {
            default: true,
            visible: false,
        },
        //背景音效开关
        isBgOpen: {
            default: true,
            visible: false,
        },
        //语音开关
        isVoiceOpen: {
            default: true,
            visible: false,
        },
    },

    // LIFE-CYCLE CALLBACKS: 

    onLoad(){
        this.audioSource = this.node.getComponent(cc.AudioSource);
        window.soundManager = this;
    },

    //播放音效
    playSound: function (soundtype) {
        if (this.isOpen) {
            if(resManager != null){
                resManager.loadClip(soundtype, function (clip) {
                    if(clip!=null){
                        cc.audioEngine.play(clip, false, 1);
                    }else{
                        console.log(soundtype+" soundClip not exist!");
                    }
                }.bind(this));
            }else{
                console.log("resManeger not exist!(资源管理器不存在！)");
            }
        }
    },
    //播放背景音效
    playBg: function () {
        if (this.isBgOpen) {
            this.audioSource.play();
        } else {
            this.audioSource.stop();
        }
    },
    //设置背景音效开关
    setBgOpen: function (isOpen) {
        this.isBgOpen = isOpen;
        if (this.isBgOpen) {
            try {
                if (str != null) {
                    HiboGameJs.mute(0)
                }
            } catch (e) {

            }

        } else {
            try {
                if (str != null) {
                    HiboGameJs.mute(1)
                }
            } catch (e) {

            }
        }
        this.playBg();
    },
    //设置音效开关
    setIsOpen: function (isOpen) {
        this.isOpen = isOpen;
        if (this.isOpen) {
            try {
                if (str != null) {
                    HiboGameJs.mute(0)
                }
            } catch (e) {

            }

        } else {
            try {
                if (str != null) {
                    HiboGameJs.mute(1)
                }
            } catch (e) {
            }
        }
    },
    //设置语音开关
    setVoiceIsOpen: function (isOpen) {
        this.isVoiceOpen = isOpen;
        if (isOpen) {
            try {
                if (str != null) {
                    HiboGameJs.enableMic(0)
                }
            } catch (e) {

            }
        } else {
            try {
                if (str != null) {
                    HiboGameJs.enableMic(1)
                }
            } catch (e) {

            }
        }

    },
});
