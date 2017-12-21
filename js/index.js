//appid 	52295
//secret    e3890efc0d034a0984ab28e74d25df96
// https://route.showapi.com/213-1?keyword=海阔天空
// &page=1&showapi_appid=49945&showapi_test_draft=false
// &showapi_timestamp=20171218111602&showapi_sign=31ed1baa40461bf98900010c2e8f3fde
$(function(){
    document.ondragstart=function() {return false;}
    var $main=$(".rgt-main"),
        $musicList=$("tbody"),
        $block=$(".block"),
        $currentMusic=$(".currentmusic"),
        $search=$("input"),
        $bigpic=$(".top-introduce .currentPicBig"),
        $audio=$("audio"),
        $tbody=$("tbody"),
        pageIndex=1,
        maxpage,
        songname="演员",
        trindex=0,
        timer;//歌曲进度
    //先来一首
    songList(songname,pageIndex)
    console.log($main.height())
    //初始化歌曲列表
    function songList(songName,page) {
        var url="https://route.showapi.com/213-1?keyword="
            +songName+"&page="+page+"&showapi_appid=52295&showapi_test_draft=false&showapi_timestamp="+(new Date()).getTime()+"&showapi_sign=e3890efc0d034a0984ab28e74d25df96";
        $musicList.html("");
        $main.css("top","0")
        $block.css("top","0")
        $.getJSON(url,function (data) {
            //接收数据并处理
            var musicmsg=data.showapi_res_body.pagebean.contentlist;
            //由于数据的问题，判断是否为第一页，是则记录总页数，共有的存到tbody中
            if(page===1){
                maxpage=data.showapi_res_body.pagebean.allPages;
                $tbody.attr({
                    allPages:maxpage
                })
        }
        console.log(data.showapi_res_body)
            // console.log($("tbody").attr("allPages"))
            for(var i=0;i<musicmsg.length;i++){
               var tr= $("<tr>" +
                        "<td>"+Format(i+1)+"</td>" +
                        "<td>"+musicmsg[i].songname+"</td>"+
                        "<td>"+musicmsg[i].singername+"</td>"+
                        "<td>"+musicmsg[i].albumname+"</td>"+
                    "</tr>");
               tr.attr({
                   albumpic_small:musicmsg[i].albumpic_small,
                   albumpic_big:musicmsg[i].albumpic_big,
                   m4a:musicmsg[i].m4a,
                   songname:musicmsg[i].songname,
                   singername:musicmsg[i].singername,
                   trindex:i
               })
               tr.appendTo($musicList).dblclick(function () {
                   //记录当前是哪个tr
                    trindex=$(this).attr("trindex");
                   changeInfo($(this))
                    $(".play").addClass("icon-pause-20").removeClass("icon-bofang");
               })
            }

        })

    }
    //分页事件
    $(function () {
        $(".firstpage").click(function () {
            songList(songname,1)
        })
        $(".nextpage").click(function () {
            songList(songname,pageIndex=++pageIndex>maxpage?maxpage:pageIndex)
        })
        $(".prepage").click(function () {
            songList(songname,pageIndex=--pageIndex<=0?1:pageIndex)
        })
        $(".lastpage").click(function () {
            songList(songname,$tbody.attr("allPages"))
        })
    })
    //注册滚轮事件
    $main.on("mousewheel",function (e,d) {
        e.preventDefault();
        var $Height = $main.height(),
            $pageHeight=$("#container").height(),
            rangeHeight=$Height-$pageHeight,
            $top=parseFloat($main.css("top"));
        if(d<0)
            $top-=10;
        else $top+=10;
        $top=Math.max(-rangeHeight,$top);
        $top=Math.min(0,$top);
        $main.css("top",$top);
        $block.css("top",Math.abs($top)+Math.abs($top)/rangeHeight*($(".scrollblock").height()-$block.height()))
    })
    //输入查找
    $(function () {
        $search.on("keyup",function (e) {
            if(e.keyCode===13){
               songList(this.value,1)
                // console.log($audio[0].duration)
            }
        })
    })

    //播放暂停
    $(".play").on("click",function () {
        playStop($(this))
    })
    $(document).on("keyup",function (e) {
        if(e.keyCode===32)
            playStop($(".play"))
    })
    //播放与暂停
    function playStop(obj){
        obj.toggleClass("icon-pause-20").toggleClass("icon-bofang");
        obj.hasClass("icon-pause-20")?$audio[0].play():$audio[0].pause();

    }
    //上一首下一首
    $(".next").on("click",function () {
        var tr=$tbody.find("tr");
        trindex=++trindex%tr.length;
        changeInfo(tr.eq(trindex));
        $(".play").addClass("icon-pause-20").removeClass("icon-bofang");
    });
    $(".prev").on("click",function () {
        var tr=$tbody.find("tr");
        trindex=--trindex<0?tr.length-1:trindex;
        changeInfo(tr.eq(trindex));
        $(".play").addClass("icon-pause-20").removeClass("icon-bofang");
    })


    //进度条
    $(".redpoint").on("mousedown",function (e) {
        var oldX=e.clientX,
            maxWidth=$(".timeprogrssbar").width(),
            redbarWidth=$(".redbar").width(),
            newX;
        $(document).on("mousemove",function (e) {
                newX=e.clientX;
                var rangeWidth=newX-oldX+redbarWidth;
                if(rangeWidth>maxWidth)
                    return;
                $(".redbar").width(rangeWidth);
        });
        $(document).on("mouseup",function () {
            $audio[0].currentTime = (newX-oldX+redbarWidth)/maxWidth * Math.floor($audio[0].duration);
            $(this).off("mousemove");
            $(this).off("mouseup");
        });
    })
    //音量
    $(".v-redpoint").on("mousedown",function (e) {
        var oldX=e.clientX,
            maxWidth=$(".volumeprogress").width(),
            redbarWidth=$(".v-redbar").width(),
            newX,rangeWidth;
        $(document).on("mousemove",function (e) {
            newX=e.clientX;
            rangeWidth=newX-oldX+redbarWidth;
            if(rangeWidth>maxWidth||rangeWidth<=0)
                return;
            $(".v-redbar").width(rangeWidth);
        });
        $(document).on("mouseup",function () {
            if(rangeWidth<=0)
                $audio[0].volume=0;
            else if(rangeWidth>maxWidth)
                $audio[0].volume=1;
            else
                $audio[0].volume = (newX-oldX+redbarWidth)/maxWidth;
            $(this).off("mousemove");
            $(this).off("mouseup");
            console.log( $audio[0].volume)
        });
    })
    //数字格式化
    function Format(str) {
        return str*1>=0&&str*1<10?"0"+str:str;
    }
    //格式化歌曲时间
    function FormatTime(time) {
        var minute=parseInt(time/60),
            second=time%60;
        return Format(minute)+":"+Format(second);
    }
    //变换大小图片和歌名，歌手
    function changeInfo(obj) {
        var totleTime;
        $currentMusic.find("img").attr("src",obj.attr("albumpic_small"));
        $bigpic.attr("src",obj.attr("albumpic_big"));
        $currentMusic.find(".songname").html(obj.attr("songname"));
        $currentMusic.find(".singername").html(obj.attr("singername"));
        $audio.attr("src",obj.attr("m4a"))[0].play();
        $audio.on("canplay", function(){
            totleTime=parseInt($audio[0].duration);
            $(".totaltime").html(FormatTime(totleTime))
        });
        timer=setInterval(function () {
            var currentTime=parseInt($audio[0].currentTime);
           $(".currentTime").html(FormatTime(currentTime));
            $(".redbar").width(currentTime/totleTime*$(".timeprogrssbar").width())
        },1000)
    }
})