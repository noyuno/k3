"use strict";

(function(){
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

    var keyword;
    var data

    var print = function () {
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
                var startstyle = "";
                var startmessage2 = "";

                if (vv["Warn"] == 1) {
                    startstyle = "#CC6666";
                }

                if (enddt - nowdt < 0) {
                    return
                } else if (startdt > nowdt && 
                    nowdt > soondt) {
                    startstyle = "#B294BB";
                    startmessage2 = " - 放送開始"
                } else if (nowdt - startdt > 0) {
                    startstyle = "#F0C674";
                    startmessage2 = " - 放送中"
                }
                if (startmessage2 == "") {
                    var start = "次の番組は" + zerofill(startdt.getMonth() + 1) + "/" +
                        zerofill(startdt.getDate()) + " " +
                        zerofill(startdt.getHours()) + ":" +
                        zerofill(startdt.getMinutes());
                } else {
                    var start =
                        zerofill(startdt.getHours()) + ":" +
                        zerofill(startdt.getMinutes());
                }

                $("#anime-banner").html(
                    start + "から" + vv["ChName"] + "<br>" + vv["Title"]);
                $("#anime-title").text("Anime" + startmessage2);
                return false;
            });
        });
    };

    $.get('/data/anime-keyword', function (k) {
        keyword = $.grep(k.split(/\n/), function (e) { return e !== ""; });
        $.getJSON("/data/anime.json", function (d) {
            data = d;
            print();
            window.setInterval(print, 1000 * 60);
        });
    });
})();

