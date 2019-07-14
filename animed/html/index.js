"use strict";

var zerofill = function (i) {
    var s = String(i);
    if (s.length == 1) {
        return "0" + s;
    } else {
        return s;
    }
};

var slim = function (s, n) {
    var t = 0;
    var i = 0;
    for ( ; i < s.length && t < n; i++) {
        var c = s.charCodeAt(i);
        if ( (c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
            t += 1;
        } else {
            t += 2;
        }
    }
    return s.substr(0, i);
};

var keyword = [];
var data;
var notifyarray = [];

var print = function () {
    var table = $('<table id="anime-list" />');
    $("<tr style='font-weight: bold; text-align: center' />")
        .append($("<td/>").text("開始"))
        .append($("<td/>").text("チャネル"))
        .append($("<td/>").text("タイトル"))
        .append($("<td/>").text("サブタイトル")).appendTo(table);

    $.each(data, function(k, v) {
        $.each(v, function (kk, vv) {
            if (vv["Title"] == undefined) {
                return
            }
            var matched = false;
            for (var ki = 0; ki < keyword.length; ki++) {
                if (vv["Title"].indexOf(keyword[ki]) != -1) {
                    // match
                    matched = true;
                    break
                }
            }
            if (!matched) {
                return
            }

            var startdt = new Date(vv["StTime"] * 1000);
            var enddt = new Date(vv["EdTime"] * 1000);
            var nowdt = new Date();
            var soondt = new Date(startdt.getTime());
            soondt.setMinutes(soondt.getMinutes() - 2);
            var startstyle = "<td />";
            var startmessage = "";

            if (vv["Warn"] == 1) {
                startstyle = "<td style='color: #CC6666'/>";
            }
            
            if (enddt - nowdt < 0) {
                return
            } else if (startdt > nowdt && 
                nowdt > soondt) {
                startstyle = "<td style='color: #B294BB' />";
                startmessage = "SOON"
                // notification
                if (notifyarray.indexOf(vv["PID"]) == -1) {
                    notifyarray.push(vv["PID"]);
                    var text = "まもなく" + vv["ChName"] + "で「" + vv["Title"] + "」";
                    if (vv["Count"] != null) {
                        text += "#" + vv["Count"];
                    }
                    var n = new Notification(text + "が始まります");
                    setTimeout(n.close.bind(n), 10 * 1000);
                }
            } else if (nowdt - startdt > 0) {
                startstyle = "<td style='color: #F0C674' />";
                startmessage = "ONAIR"
            }
            if (startmessage == "") {
                var start = zerofill(startdt.getMonth() + 1) + "/" +
                    zerofill(startdt.getDate()) + " " +
                    zerofill(startdt.getHours()) + ":" +
                    zerofill(startdt.getMinutes());
            } else {
                var start = startmessage + " " +
                    zerofill(startdt.getHours()) + ":" +
                    zerofill(startdt.getMinutes());
            }

            var subtitle = "";
            if (vv["Count"] == null) {
                if (vv["SubTitle"] == null) {
                    subtitle = "";
                } else {
                    subtitle = vv["SubTitle"];
                }
            } else {
                if (vv["SubTitle"] == null) {
                    subtitle = "#" + vv["Count"];
                } else {
                    subtitle = "#" + vv["Count"] + " " + vv["SubTitle"];
                }
            }

            $('<tr/>')
                .append($(startstyle).text(start))
                .append($("<td />").text(vv["ChName"]))
                .append($("<td/>")
                    .append("<a href='http://cal.syoboi.jp/tid/" + 
                    vv["TID"] + "#" + vv["PID"] + "'" + 
                    "style='color: #81A2BE'>" +
                    vv["Title"] + "</a>"))
                .append($("<td />").text(subtitle))
                .appendTo(table);
        });
    });
    $("#anime").empty();
    $(table).appendTo("#anime");
};

$.get('/data/anime-keyword', function (k) {
    keyword = $.grep(k.split(/\n/), function (e) { return e !== ""; });
    $.getJSON("/data/anime.json", function (d) {
        data = d;
        print();
    });
});

function search() {
    var input = $("#search");
    var filter = input.val().toLowerCase();
    var table = $("#anime-list");
    var tr = $("#anime-list tr");
    var c = 0;

    for (var i = 1; i < tr.length; i++) {
        var matched = false;
        for (var col = 1; col < 4; col++) {
            var td = tr[i].getElementsByTagName("td")[col];
            if (td) {
                if (td.textContent.toLowerCase().indexOf(filter) > -1) {
                    matched = true;
                    break;
                }
            } 
        }
        if (matched) {
            tr[i].style.display = "";
            c++;
        } else {
            tr[i].style.display = "none";
        }
    }
    if (c == 0) {
        $("#search-not-found").css("display", "");
    } else {
        $("#search-not-found").css("display", "none");
    }
}

var notify;

(function(){
    window.Notification.requestPermission();
    $("#search").focus();
    window.setInterval(function () {
        print();
        search();
    }, 1000 * 60);
})();


