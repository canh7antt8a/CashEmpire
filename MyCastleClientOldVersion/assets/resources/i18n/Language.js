'use strict';

if (!window.i18n) {
    window.i18n = {};
}

if (!window.i18n.languages) {
    window.i18n.languages = {};
}

//英语
window.i18n.languages['en'] = {
    // write your key value pairs here
    "lang": {
        "shopTitel": "BOOST",
        //商品已存在提示
        "shopExistWarm": "You already has it!",
        "shopNoMoney": "No enough cash!",
        //商店商品类型
        "shopType0": "Permanent",
        "shopType1": "OneTime",
        "shopType2": "License",
        //商品名
        "shopTransientBuff3": "Lottery",
        "shopTransientBuff4": "Super lottery",
        "shopTransientBuff5": "Renaming card",
        "shopTransientBuff6": "Energy drink S",
        "shopTransientBuff9": "Marketing Handbook",
        "shopTransientBuff10": "GuGu chicken Childhood",
        "shopTransientBuff13": "Fighting chicken",
        "shopTransientBuff14": "Marge chicken",
        //商品描述
        "shopTransientBuffDesc3": "Get 1800s income.",
        "shopTransientBuffDesc4": "Get 15000s income.",
        "shopTransientBuffDesc5": "Change your nickname.",
        "shopTransientBuffDesc6": "1 hours revenue X2.",
        "shopTransientBuffDesc9": "1 hours revenue X4.",
        "shopTransientBuffDesc10": "1 hours revenue X10.",
        "shopTransientBuffDesc13": "1 hours revenue X20.",
        "shopTransientBuffDesc14": "1 hours revenue X50.",

        //榜单的按钮
        "rankWorldBtn": "Wrold",
        "rankFriendBtn": "Friend",
        "rankTitel": "RANKING",

        //充值界面
        "rechargeTitel": "RECHARGE",
        "shopCurTitel": "Currency",
        "shopGiftTitel": "Gift",
        "rechargeGet": "GET",
        "rechargeFree": "FREE",
        "rechargeFreeDesc0": "Share to get 25 diamonds",
        "rechargeFreeDesc1": "Watch AD to get 25 diamonds",
        "rechargeFreeLimit": "Once a day,you already get it!",
        //物品描述
        "rechargeCur0": "Recharge 300 diamonds.",
        "rechargeCur1": "Recharge 900 diamonds.",
        "rechargeCur2": "Recharge 1800 diamonds.",
        "rechargeCur3": "Recharge 3600 diamonds.",
        "rechargeCur4": "Recharge 9000 diamonds.",
        "rechargeCur5": "Recharge 18000 diamonds.",
        "rechargeCur6": "This money is just a cup of water.",
        "rechargeCur7": "It is still a poor class.",
        "rechargeCur8": "In the end, it's a bit of money.",
        "rechargeCur9": "Out of poverty.",
        "rechargeCur10": "Look, I have become a millionaire.",
        "rechargeCur11": "I am very rich.",

        //信息界面
        "infoTital": "STATISTICS",
        "pName": "Name",
        "curMoney": "Money",
        "todayMoney": "Today's Income",
        "totalMoney": "Total Income",
        "bestMoney": "Highest Assets",
        "gameTime": "Game Length",
        "prestige": "Prestige Value",
        "prestigeBuf": "Prestige Effect",
        "achievement": "Achievement",
        "infoNoRenameCard": "You don't have Renaming card!",

        //设置界面
        "settingTitel": "SETTING",
        "langTitel": "Language",
        "musicTitel": "Music:",
        "soundTitel": "Sound:",

        //家园界面
        "homeTitel": "WAREHOUSE",
        "homeType0": "PermanentBuff",
        "homeType1": "Type2",
        "propUsing": "using",
        "homeUse": "USE",
        "storeUsing": "All ready use same type",

        //成就界面
        "achievementTitel": "MILEPOST",
        "achieveTitel": "No Pain,No Gain",
        "achieveType0": "MILEPOST",
        "achieveType1": "ACHIEVE",
        "milepostDesc": "Revenue time -50%",
        "milepostAllDesc": "Next level, all floor Profit x2 again",

        //成就描述
        "aDesc0": "Hire 1 manager.",
        "aDesc1": "Upgrade 5 times shop.",
        "aDesc2": "Upgrade 3 times manager.",
        "aDesc3": "Own 100 cash.",
        "aDesc4": "Open 2 shops.",
        "aDesc5": "Upgrade 25 times shop.",
        "aDesc6": "Own 1000 cash.",
        "aDesc7": "Open 3 shops.",
        "aDesc8": "Own 10K cash.",
        "aDesc9": "Upgrade 50 times shop.",
        "aDesc10": "Hire 2 managers.",
        "aDesc11": "Upgrade 6 times manager.",
        "aDesc12": "Upgrade 75 times shop.",
        "aDesc13": "Open 4 shops.",
        "aDesc14": "Own 100K cash.",
        "aDesc15": "Hire 3 managers.",
        "aDesc16": "Upgrade 9 times manager.",
        "aDesc17": "Upgrade 100 times shop.",
        "aDesc18": "Upgrade 12 times manager.",
        "aDesc19": "Upgrade 125 times shop.",
        "aDesc20": "Upgrade 18 times manager.",
        "aDesc21": "Upgrade 150 times shop.",
        "aDesc22": "Open 5 shops.",
        "aDesc23": "Hire 4 managers.",
        "aDesc24": "Upgrade 24 times manager.",
        "aDesc25": "Upgrade 175 times shop.",
        "aDesc26": "Own 1000K cash.",
        "aDesc27": "Hire 5 managers.",
        "aDesc28": "Upgrade 30 times manager.",
        "aDesc29": "Open 6 shops.",
        "aDesc30": "Own 10M cash.",
        "aDesc31": "Hire 6 managers.",
        "aDesc32": "Upgrade 36 times manager.",
        "aDesc33": "Own 50M cash.",
        "aDesc34": "Upgrade 200 times shop.",
        "aDesc35": "Open 7 shops.",
        "aDesc36": "Own 100M cash.",
        "aDesc37": "Hire 7 managers.",
        "aDesc38": "Upgrade 42 times manager.",
        "aDesc39": "Own 150M cash.",
        "aDesc40": "Sell building to famous 1 times.",

        //声望界面
        "prestigeTitel": "PRESTIGE",
        "prestigeDesc": "The more famous , the more cash!",
        "preName": "Name:",
        "preVal": "PRESTIGE VALUE",
        "allPre": "MaxPre:",
        "prestigeType0": "OBTAIN",
        "prestigeType1": "SKILL",
        "prestigeUseDesc": "This will reduce your prestige,would you watch AD to save prestige?",
        "prestigeNoVideo": "Use prestige",


        //声望技能名称
        "preSkillName0": "Loudspeaker",
        "preSkillName1": "Advertisement",
        "preSkillName2": "Celebrity",
        //声望技能描述
        "preSkillDesc0": "During skill, all the shops get 2 times earnings.",
        "preSkillDesc1": "During skill, all the shops get 3 times earnings.",
        "preSkillDesc2": "During skill, all the shops get 4 times earnings.",
        //声望选项名称
        "preName0": "Charity events",
        "preName1": "Media promotion",
        //声望选项描述
        "preDesc0": "Donations to charity, get some good reputation.",
        "preDesc1": "Spend a lot of money and promote yourself through the media.",


        //facebook操作失败界面
        "videoFail": "video play fail",
        "shareFail": "share fail",
        "failTitel": "FAIL",
        "retry": "Okay",

        //管理员界面
        "managerTitel": "MANAGER",
        "managerName": "Name:",
        "managerUse": "Appointment",
        "managerTrain": "Train",
        "managerFire": "Fire",
        "managerSkillCD": "Skill CD:",
        "managerWithdraw": "Withdraw",
        "noManager": "You need a Manager!",
        "activeSkill": "Active Skill",
        "managerTitalText": "Let's Upgrade the building!",

        //管家描述
        "mDesc0": "A man who has been in the shopping mall for years.",
        "mDesc1": "This is a man of great taste.",
        "mDesc2": "The name sounds romantic.",
        "mDesc3": "I am not a football star.",
        "mDesc4": "This person looks very eloquent.",
        "mDesc5": "Let's mark it.",
        "mDesc6": "Actually, I can dance very well.",
        "mDesc7": "Don't be afraid. He's not a killer.",
        "mDesc8": "Well! Buddy! Am I cute?",
        "mDesc9": "Are you interested in listening to my singing?",

        //管家技能描述
        "mSDesc0": "Increase in revenue.",
        "mSDesc1": "Reduce shop upgrade consumption.",
        "mSDesc2": "Reduced revenue time.",
        "mSDesc3": "Reduced revenue time.",
        "mSDesc4": "Increase in revenue.",
        "mSDesc5": "Reduce shop upgrade consumption.",
        "mSDesc6": "Increase in revenue.",
        "mSDesc7": "Reduced revenue time.",
        "mSDesc8": "Reduce shop upgrade consumption.",
        "mSDesc9": "Reduce shop upgrade consumption.",

        //管理员训练界面
        "trainTItel": "TRAIN",
        "trainManagement": "Skill LV:",
        "trainEfficiency": "CD Time LV:",
        "trainSocialContact": "Effect Time LV:",

        //选取店铺界面
        "sureStore": "OPEN",

        //离线收益界面
        "offlineTitel": "Hi Boss!",
        "offlineDesc": "When you leave, we still work hard to earn money!",
        "offlineReceive": "Receive",
        "offlineDouble": "Double income",

        //重生界面
        "rebornTalk": "You already can famous to get prestige!",
        "rebornPrestige": "PrestigeChange",
        "rebornPerProfit": "Profit per Prestige:",
        "rebornPrestigeProfit": "ProfitChange",
        "rebornGet": "This time you will get ",
        "rebornFamous": "Famous",
        "rebornText": "No,Thanks",
        "rebornBuff": "Watch AD to add 10% prestige?",

        //飞行礼包界面
        "flyGiftMonDesc": "You are so lucky,watch AD to double reward?",
        "flyGiftDiaDesc": "Good chance,share to get diamond!",

        //通用
        "milepostTipsText": "Income X2",
        //退出字
        "exitText": "EXIT",
        //分享字
        "shareText": "SHARE",
        "watchText": "WATCH",
        "noThanksText": "NO,THANKS",
        "okText": "OK",
        "receiveText": "RECEIVE",
        "noText": "NO",
        "watchOut": "ATTENTION",
        "adBuffDesc": "Revenue X2",
        "goSpin": "Watch AD to Spin",
        "iosNoRechage": "IOS no support recharge now.",
        "errorTime": "Your system time is wrong,check it and restart.",

        //加载界面
        "loadingText0": "Talking and laughing with Beer Gates.",
        "loadingText1": "Let me wake up the employees who are still sleeping.",
        "loadingText2": "Refused Butfat's video call.",
        "loadingText3": "Repair the door that was broken by the job seeker.",
        "loadingText4": "We are walking the dog for you.",
        "loadingText5": "Grinding coffee beans for you.",

        //世界界面
        "needPrestige": "Prestige over:",
        "selectWorld": "Get in",
        "countryName0": "THAILAND",
        "countryName1": "JAPAN",
        "countryName2": "CHINA",
        "countryName3": "ITALY",
        "countryName4": "SINGAPORE",
        "countryName5": "INDIA",
        "countryName6": "KOREA",
        "countryName7": "",
        "countryName8": "",
        "countryName9": "",
    }
};

//中文
window.i18n.languages['zh'] = {
    // write your key value pairs here
    "lang": {

    }
};

//西班牙语
window.i18n.languages['es'] = {
    // write your key value pairs here
    "lang": {

    }
};

//印度语
window.i18n.languages['in'] = {
    // write your key value pairs here
    "lang": {

    }
};

//葡萄牙语
window.i18n.languages['pt'] = {
    // write your key value pairs here
    "lang": {

    }

};