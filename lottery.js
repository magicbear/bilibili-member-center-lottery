var getReplyCount = 10;
var avid = 57733423;

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
var uidLists = {};
$.getJSON("/x/web/replies?order=ctime&filter=-1&is_hidden=0&type=1&oid="+avid+"&pn=1&ps=1000", function(data) {
    for (var i = 0; i < data.data.length; i++)
    {
        if (data.data[i].relation == 2)
        {
            uidLists[data.data[i].mid] = data.data[i].replier;
        }
    }
    var shuffleList = shuffle(Object.keys(uidLists));
    for (var i = 0; i < getReplyCount; i++)
    {
        console.log("恭喜@"+uidLists[shuffleList[i]]+" 【"+shuffleList[i]+"】中奖");
    }
});