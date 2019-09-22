// https://qun.qq.com/member.html#gid=<QQ群号>
function load_qun_members(gid, start, cb)
{
    var lists = [];
    QunHandler.request({
        url: "https://qun.qq.com/cgi-bin/qun_mgr/search_group_members", 
        type: "POST",
        dataType: "json",
        data: {
                gc: gid,
                st: start,
                end: start + 20,
                sort: 0
            },
        success: function(data)
        {
            if (0 == data.ec) {
                if (data.mems === undefined)
                {
                    cb(lists);
                } else 
                {
                    for (var i = 0; i < data.mems.length; i++) lists.push(data.mems[i]);
                    load_qun_members(gid, start + 21, function(next_list)
                    {
                        for (var i = 0; i < next_list.length; i++) lists.push(next_list[i]);
                        cb(lists);
                    });
                }
            }
        }
    });
}
load_qun_members(<QQ群号>, 0, function(members){ console.log(JSON.stringify(members)); });






// http://qqweb.qq.com/qtfp/qrcode.html?type=&_wv=7&i=<QQ QUN活动 ID>&share=copy_m
var qun_member = [];    // 从qun.qq.com结果复制
var members = {};
for (var i = 0; i < qun_member.length; i++) members[qun_member[i].uin] = qun_member[i];
function load_list(from, cb)
{
    var lists = [];
    $.ajax({
        url: "/cgi-bin/qqactivity/get_activity_member_list",
        data: {
            type: 1,
            from: from,
            number: 50,
            id: Lin.getParameter(window.location.href, "i"),
            bkn: Lin.encryptSkey(Lin.getCookie("skey"))
        },
        type: "POST",
        dataType: "json",
        success: function(e) {
            if (0 == e.ec) {
                // lists.concat(e.list);
                for (var i = 0; i < e.list.length; i++) lists.push(e.list[i]);
                if (e.is_end)
                {
                    cb(lists);
                } else
                {
                    load_list(e.next, function(next_list)
                    {
                        for (var i = 0; i < next_list.length; i++) lists.push(next_list[i]);
                        cb(lists);
                    });
                }
            } else{
                alert("获取参加人员失败，请稍后再试")
            }
        },
        error: function() {
            alert("获取参加人员失败，请稍后再试");
        }
    });
}
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
var uinList = {};
var ignoreList = [];
load_list(0, function(lists){
    for (var i = 0; i < lists.length; i++)
    {
        uinList[lists[i].uin] = lists[i].name;
    }
    console.log("报名人数：",Object.keys(uinList).length);
});







// 全部加载完成后执行的抽取代码
var getReplyCount = 100;    // 中奖人数
var shuffleList = shuffle(Object.keys(uinList));
for (var i = 0; i < getReplyCount && i < Object.keys(uinList).length; i++)
{
    var ignoreResult = false;
    var qin = shuffleList[i];
    if (ignoreList.indexOf(qin) != -1) { getReplyCount++; continue; }
    // 限制入群时间
    if (members[qin].join_time > (new Date("2019-09-15 00:00:00").getTime() / 1000)) { console.error(uinList[shuffleList[i]]+" 【QQ:"+shuffleList[i]+"】入群太晚! 入群天数：", Math.floor((new Date().getTime()/1000 - members[qin].join_time)/86400)); ignoreResult = true; }
    // 限制最后发言时间
    if (members[qin].last_speak_time < (new Date("2019-08-15 00:00:00").getTime() / 1000)) { console.error(uinList[shuffleList[i]]+" 【QQ:"+shuffleList[i]+"】一直不说话! 不说话天数：", Math.floor((new Date().getTime()/1000 - members[qin].last_speak_time)/86400)); ignoreResult = true; }
    // 限制等级
    // if (members[qin].lv.level < 6) ignoreResult = true;

    ignoreList.push(shuffleList[i]);
    if (ignoreResult)
    {
        getReplyCount++;
        continue;
    }
    console.info("恭喜@"+uinList[shuffleList[i]]+" 【QQ:"+shuffleList[i]+"】中奖");
}