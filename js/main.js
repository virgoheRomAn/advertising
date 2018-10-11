$(function () {
    /**
     * 颜色值转换
     * @type {RegExp}
     */
    //十六进制颜色值的正则表达式
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    /*RGB颜色转换为16进制*/
    String.prototype.colorHex = function () {
        var that = this;
        if (/^(rgb|RGB)/.test(that)) {
            var aColor = that.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
            var strHex = "#";
            for (var i = 0; i < aColor.length; i++) {
                var hex = Number(aColor[i]).toString(16);
                if (hex === "0") {
                    hex += hex;
                }
                strHex += hex;
            }
            if (strHex.length !== 7) {
                strHex = that;
            }
            return strHex;
        } else if (reg.test(that)) {
            var aNum = that.replace(/#/, "").split("");
            if (aNum.length === 6) {
                return that;
            } else if (aNum.length === 3) {
                var numHex = "#";
                for (var i = 0; i < aNum.length; i += 1) {
                    numHex += (aNum[i] + aNum[i]);
                }
                return numHex;
            }
        } else {
            return that;
        }
    };
    /*16进制颜色转为RGB格式*/
    String.prototype.colorRgb = function () {
        var sColor = this.toLowerCase();
        if (sColor && reg.test(sColor)) {
            if (sColor.length === 4) {
                var sColorNew = "#";
                for (var i = 1; i < 4; i += 1) {
                    sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
                }
                sColor = sColorNew;
            }
            //处理六位的颜色值
            var sColorChange = [];
            for (var i = 1; i < 7; i += 2) {
                sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
            }
            return "RGB(" + sColorChange.join(",") + ")";
        } else {
            return sColor;
        }
    };

    //初始化滚动条
    $(".templat-imgs").each(function () {
        $(this).perfectScrollbar();
    });

    //更新 滚动条
    $(window).resize(function () {
        $(".templat-imgs,.content-right-p-right").perfectScrollbar("update");
    }).trigger("resize");

    //左侧菜单
    $(".template-btn").click(function () {
        $(".template-list").toggleClass("active");
        $(this).find("i").toggleClass("fa-angle-double-left");
        if ($(".template-list").hasClass("active")) {
            setTimeout(function () {
                $(".template-btn").animate({"right": "-144px"}, 500);
            }, 500);
        } else {
            $(this).animate({"right": "-30px"}, 0);
        }
    });

    /**
     * 上传音乐
     */
    var _upMusicBtn = $("#uploadMusicInput").get(0);
    var _musicType = ["mp3", "wav"];
    var _music_html = "";
    var _create_music = "";
    //所有音乐默认暂停
    $(".audio").each(function () {
        //this.pause();
        //this.currentTime = 0;
    });
    //音乐弹层
    $("#music span").click(function () {
        $("#musicModal").on('shown.bs.modal', function () {
            $(".music-box ul").perfectScrollbar();
        }).modal();
    });
    //控制播放背景音乐
    $("#music i").click(function () {
        if ($("#audioMusic").get(0) != undefined) {
            if ($("#audioMusic").get(0).paused) {
                $("#audioMusic").get(0).play();
                $(this).attr("class", "fa fa-pause");
            } else {
                $("#audioMusic").get(0).pause();
                $(this).attr("class", "fa fa-play")
            }
        }
    });
    //选择背景音乐
    $(document).on("click", ".music-box li", function () {
        $(this).addClass("active").siblings().removeClass("active");
        if ($("#audioMusic").get(0) != undefined) {
            $("#audioMusic").get(0).pause();
            $("#audioMusic").get(0).currentTime = 0;
        }
        var $this = $(this);
        var _audio = $this.find("audio").get(0);
        if (_audio == undefined) {
            $('.audio').each(function () {
                this.pause();
                this.currentTime = 0;
            });
            console.log("无背景音乐");
        } else {
            if ($(this).hasClass("active")) {
                $('.audio').each(function () {
                    this.pause();
                    this.currentTime = 0;
                });
                setTimeout(function () {
                    _audio.play();
                }, 1);
            }
        }
    });
    //关闭弹层，同时音乐初始为开始状态
    $(".close-btn").click(function () {
        $(".audio").each(function () {
            this.pause();
            this.currentTime = 0;
        });
        $("#musicModal").modal("hide");
        $(".music-box li").removeClass("active");
    });
    //上传音乐HTML
    function addMusicHtml(file, e) {
        // e.target.result是上传文件返回的base64文件
        $(".music-box li").removeClass("active");
        _music_html += file.name;
        _music_html += '        <audio class="audio"><source src="' + e.target.result + '" type="audio/mpeg"></audio>';
        _music_html += '        <i class="fa fa-volume-down" aria-hidden="true"></i>';
        return _music_html;
    }

    //点击上传按钮-音乐
    $("#uploadMusic").click(function () {
        $(_upMusicBtn).click();
    });
    _upMusicBtn.addEventListener("change", function (e) {
        var files = e.target.files || e.dataTransfer.files;
        if (files[0]) {
            if (jQuery.inArray(files[0].type.split("/")[1], _musicType) > -1) {
                var _result_html = "";
                var reader = new FileReader();
                reader.onload = function (e) {
                    _music_html = "";
                    _result_html = addMusicHtml(files[0], e);
                    uploadFiles("music", $("#uploadMusicForm").attr("action"), _result_html, files[0]);
                };
                reader.readAsDataURL(files[0]);
            } else {
                alert('您这个"' + files[0].name + '"类型不符合, 请选择音频格式文件。');
            }
        }
    }, false);
    //确定按钮-音乐
    $(document).on("click", "#musicSure", musicSure);
    function musicSure() {
        $("#audioMusic").remove();
        var _music = $("#music");
        var _index = $(".music-box li.active").index();
        var _dom = $(".music-box li.active a").text();
        var _music_dom = $(".music-box li.active audio");
        if (_index >= 0) {
            if (_index == 0) {
                _music.find("i").attr("class", "fa fa-music");
                _music.find("span").text("背景音乐");
            } else {
                _music.find("i").attr("class", "fa fa-pause");
                _music.find("span").text(_dom.replace(/&nbsp;/g, ""));
                //由于路径不是真实路径，是上传返回的base64数据，导致创建audio时候有点卡顿
                _create_music = document.createElement("audio");
                $(_create_music).attr("id", "audioMusic").html(_music_dom.html()).appendTo($(".preview-cont"));
                $(".audio").each(function () {
                    this.pause();
                    this.currentTime = 0;
                });
                setTimeout(function () {
                    _create_music.play();
                }, 1);
            }
        } else {
            _music.find("i").attr("class", "fa fa-music");
            _music.find("span").text("背景音乐");
        }
        $("#musicModal").modal("hide");
        $(".music-box li").removeClass("active");
    }

    /**
     * 上传视频
     */
    var _upVideoBtn = $("#uploadVideoInput").get(0);
    var _videoType = ["mp4", "swf"];
    var _video_html = "";
    //上传视频HTML
    function addVideoHtml(file, type) {
        var fileImgSrc = "img/upload-img/fileType/";
        if (type == "mp4") {
            fileImgSrc = fileImgSrc + "mp4.png";
        } else if (type == "swf") {
            fileImgSrc = fileImgSrc + "file.png";
        }
        _video_html += '<li class="active">';
        _video_html += '    <a href="javascript:;">';
        _video_html += '        <img data-type="' + type + '" src="' + fileImgSrc + '">';
        _video_html += '        <span class="video-name">' + file.name + '</span>';
        _video_html += '    </a>';
        _video_html += '</li>';
        return _video_html;
    }

    //上传视频弹层
    $("#videoEditor").click(function () {
        $("#videoModal").on('shown.bs.modal', function () {
            $(".video-box ul").perfectScrollbar();
            if (!$(".video-box ul").find("img").hasClass("isLoaded")) {
                lazyImg($(".video-box ul"));
            }
        }).modal();
    });
    //上传视频触发
    $("#uploadVideo").click(function () {
        $(_upVideoBtn).click();
    });
    _upVideoBtn.addEventListener("change", function (e) {
        var files = e.target.files || e.dataTransfer.files;
        if (files[0]) {
            if (jQuery.inArray(files[0].name.split(".")[files[0].name.split(".").length - 1], _videoType) > -1) {
                _video_html = "";
                var _result_html = addVideoHtml(files[0], files[0].name.split(".")[files[0].name.split(".").length - 1]);
                uploadFiles("video", $("#uploadVideoForm").attr("action"), _result_html, files[0]);
            } else {
                alert('您这个"' + files[0].name + '"类型不符合, 请选择视频格式文件。');
            }
        }
    }, false);

    //选择视频
    $(document).on("click", ".video-box li", function () {
        $(this).addClass("active").siblings().removeClass("active");
    });
    //确定按钮-视频
    $(document).on("click", "#videoSure", videoSure);
    function videoSure() {
        //初始化操作菜单
        $(".content-right-menu").show();
        $(".content-right-bg").hide();
        $(".isText,.isImage").hide();
        $(".isVideo").show();
        $(".content-right-header .half-tab:eq(0)").text("视频");
        slideInit($(".preview-m-position.active label.nameText"), $(".preview-m-position.active .preview-m-c"));
        $(".preview-m-position").removeClass("active");
        $(".preview-m-line").hide();

        var _html = "";
        var _videoHtml = "";
        var _video = $(".video-box li.active");
        var _videoSrc = _video.find("input[type='hidden']").val();
        var _videoType = _video.find("img").attr("data-type");
        if (_video.html() != undefined) {
            if (_videoType == "mp4") {
                //建议poster="img/upload-img/fileType/mp4.png"放置一个合理的GIF图片
                _videoHtml += '<video class="video-mp4" autoplay="autoplay" poster="img/upload-img/fileType/mp4.png">';
                _videoHtml += '     <source src="' + _videoSrc + '" type="video/mp4" />';
                _videoHtml += '</video>';
            } else if (_videoType == "swf") {
                _videoHtml += '<object class="video-swf">';
                _videoHtml += '     <param name=movie value="' + _videoSrc + '" >';
                _videoHtml += '     <param name=quality value=High>';
                _videoHtml += '     <embed src="' + _videoSrc + '" quality="high"  type="application/x-shockwave-flash"></embed>';
                _videoHtml += '</object>';
            }


            var _new_video_mp4 = $(".video-mp4");
            //暂停播放的mp4
            if (_new_video_mp4.html() != undefined) {
                _new_video_mp4.get(0).pause();
            }

            _html = previewHtml("video", _videoHtml);
            $(_html).prependTo($(".preview-cont"));

            $("#videoModal").modal("hide");
            $(".video-box li").removeClass("active");
        } else {
            alert("请选择视频文件");
        }
    }

    //操作视频
    $("#playVideo").click(function () {
        var _d = $(".preview-m-zIndex.preview-video").find(".preview-m-position.active");
        var _v = _d.find(".video-mp4");
        if (_v.html() != undefined) {
            if (_v.get(0).paused) {
                _v.get(0).play();
            }
        }
    });
    $("#pauseVideo").click(function () {
        var _d = $(".preview-m-zIndex.preview-video").find(".preview-m-position.active");
        var _v = _d.find(".video-mp4");
        if (_v.html() != undefined) {
            if (!_v.get(0).paused) {
                _v.get(0).pause();
            }
        }
    });

    /**
     *
     * @param type  上传类型
     * @param url   上传路径
     * @param html  添加到页面的HTML
     * @param file  上传文件
     */
    function uploadFiles(type, url, html, file) {
        var xhr = new XMLHttpRequest();
        //进度
        xhr.addEventListener("progress", function (e) {
            if (type == "music") {
                $(".music-box li:eq(0)").after('<li class="upload_music active"><a href="javascript:;"><p class="music-progress progress-bar progress-bar-striped active"><label></label><span></span></p></a></li>');
                $(".music-progress label").animate({"width": parseInt(e.loaded / e.total * 100) + '%'}, 300);
                $(".music-progress span").text(parseInt(e.loaded / e.total * 100) + '%');
                $(document).off("click", "#musicSure", musicSure);
            } else if (type == "video") {
                $(".video-box ul").prepend('<li class="upload_video"><a href="javascript:;"><p class="video-propress"><label></label><span></span></p></a></li>');
                $(".upload_video label").animate({"width": parseInt(e.loaded / e.total * 100) + '%'}, 300);
                $(".upload_video span").text(parseInt(e.loaded / e.total * 100) + '%');
                $(document).off("click", "#videoSure", videoSure);
            }
        }, false);
        //成功
        xhr.addEventListener("load", function (e) {
            if (type == "music") {
                console.log("上传音频成功，成功返回数据：" + xhr.response);
                setTimeout(function () {
                    $(".music-progress").fadeOut();
                    if ($("#audioMusic").get(0) != undefined) {
                        $("#audioMusic").get(0).pause();
                        $("#audioMusic").get(0).currentTime = 0;
                    }
                    $(".music-box li.upload_music a").prepend(html);
                    $(".audio").each(function () {
                        this.pause();
                        this.currentTime = 0;
                    });
                    $(".music-box li.upload_music a audio")[0].play();
                    $(".music-box li").removeClass("upload_music");
                    $(document).on("click", "#musicSure", musicSure);

                    //接收成功数据的位置

                }, 300);
            } else if (type == "video") {
                console.log("上传视频成功，成功返回数据：" + xhr.response);
                setTimeout(function () {
                    $(".upload_video").remove();
                    $(".video-box li").removeClass("active");
                    $(".video-box ul").prepend(html);
                    $(document).on("click", "#videoSure", videoSure);

                    //接收成功数据的位置
                    var _video_src = "";
                    //静态样式
                    if (file.name.split(".")[file.name.split(".").length - 1] == "mp4") {
                        _video_src = "video/mp4.mp4";
                    } else {
                        _video_src = "video/swf.swf";
                    }
                    //上面只是静态为了演示可以上传两种格式的文件
                    //动态修改 _video_src，判断上传的文件的src。上传成功后请修改此处。
                    $(".video-box li.active a").append('<input class="hidden" type="hidden" value="' + _video_src + '">');
                }, 300);
            }
        }, false);
        //失败
        xhr.addEventListener("error", function (e) {
            if (type == "music") {
                console.log("音乐上传失败，失败原因：" + xhr.response);
            } else if (type == "video") {
                console.log("视频上传失败，失败原因：" + xhr.response);
            }
        }, false);
        xhr.open("POST", url, true);
        //发送的数据，可以修改成form表单，按需求修改
        xhr.send(null);
    }

    //还原弹出框modal
    function resetModal() {
        $("#select_img li:eq(0)").addClass("active").attr("aria-expanded", true).siblings().removeClass("active").attr("aria-expanded", false);
        $("#material_img").addClass("active");
        $("#upload_img").removeClass("active");
    }

    /**
     * 上传图片初始化-zyupload
     */
    uploadImgFiles();
    function uploadImgFiles() {
        $("#zyupload").zyUpload({
            width: "100%",                 // 宽度
            height: "100%",                 // 宽度
            itemWidth: "106px",                 // 文件项的宽度
            itemHeight: "106px",                 // 文件项的高度
            url: "uploadHtml.html",  // 上传文件的路径
            fileType: ["jpg", "png", "jpeg", "gif"],// 上传文件的类型
            fileSize: 51200000,                // 上传文件的大小
            multiple: true,                    // 是否可以多个文件上传
            dragDrop: true,                    // 是否可以拖动上传文件
            tailor: false,                    // 是否可以裁剪图片
            del: true,                    // 是否可以删除文件
            finishDel: false,  				  // 是否在上传文件完成后删除预览
            /* 外部获得的回调接口 */
            onSelect: function (selectFiles, allFiles) {
                console.log(selectFiles);
            },
            onDelete: function (file, files) {
            },
            onSuccess: function (file, response) {
                console.log(file);
            },
            onFailure: function (file, response) {
            },
            onComplete: function (response) {
                _selectImg_("upLoad", ".upload_append_list");
            }
        });
    }

    //初始化裁剪
    tailorFun($("#jcrop_target"));

    //全局变量
    //var _thisImg_data = [];
    //var _thisText_data = [];
    var _lazyDom_ = $(".material-cont.active");
    var uploadType = "";
    var isCurrentEle = "";
    var _def_color = "#333333";
    var _isCurrent = false;
    var animateTimes = {
        speed: 1,
        delay: 0.6,
        allTimes: 0
    };
    var ele_Area = {};


    //上传图片
    $("#imgEditor").on("click", function () {
        if (!$("#imgModal").hasClass("in")) {
            showModal();
            uploadType = "img";
        }
    });
    //更换图片
    $("#changeImg").on("click", function () {
        if (!$("#imgModal").hasClass("in")) {
            showModal();
            uploadType = "chImg";
        }
    });
    //更换背景
    $("#changeBg").on("click", function () {
        if (!$("#imgModal").hasClass("in")) {
            showModal();
            uploadType = "bg";
        }
    });

    //选项卡
    $("#select_img a").click(function (e) {
        e.preventDefault();
        $(this).tab('show');
        if (!_lazyDom_.find("img").hasClass("isLoaded")) {
            lazyImg(_lazyDom_);
        }
    });
    $(".material-menu li").click(function () {
        var i = $(this).index();
        var j = parseInt($(this).attr("data-infor"));
        $(this).addClass("active").attr("data-infor", "1").siblings().removeClass("active").attr("data-infor", "0");
        $(".material-tab>.material-cont").eq(i).addClass("active").siblings().removeClass("active");
        var $tag = $(".material-tab>.material-cont").eq(i);
        if (j == 0) {
            if (!$tag.find("img").hasClass("isLoaded")) {
                lazyImg($tag);
            }
        }
    });

    //选择照片
    _selectImg_("locationImg", ".material-cont");

    //确定使用
    $("#ensureBtn").on("click", function () {
        _checkImg_(uploadType);
        $("#imgModal").modal("hide");
    });

    //背景颜色
    $(".theme-color label").each(function (i) {
        if (i == ($(".theme-color label").length - 1)) {
            var _css_ = ["backgroundColor"];
            colorPicker("#bgColor", ".app-content-bg", _css_);
        } else {
            $(this).click(function () {
                var _newColor_ = $(this).attr("data-color");
                $(".app-content-bg").css("backgroundColor", _newColor_);
            });
        }
    });
    //移除背景
    $("#removeBg").click(function () {
        $("#jcImg,.app-jc-cont").empty();
    });
    //背景透明
    $("#opacityControl").each(function () {
        silderSelect(0, this, ".app-jc-cont", [{name: "opacity", units: "", _units: "%"}]);
    });

    //属性切换
    $(".half-tab").each(function () {
        $(this).click(function () {
            $(".content-right-p-right").perfectScrollbar("destroy");
            $(".content-right-p-right").perfectScrollbar();
            var _i = $(this).index();
            $(this).addClass("active").siblings().removeClass("active");
            $(this).parents("ul").nextAll(".content-right-p-right").find(".content-right-cont").eq(_i).show().siblings().hide();
            if (_i == 1) {
                sumAllTimes();
            }
        });
    });

    //选择动画
    $("#selectAnimate li").click(function () {
        $(this).find("span").addClass("active");
        $(this).siblings().find("span").removeClass("active");
        $(".preview-mouse-nav").hide();
        _sel_animate(".preview-m-position.active .preview-m-c", $(this).attr("data-animate"));
    });
    function _sel_animate(tag, ani) {
        var _speed = $(tag).attr("data-speed") == undefined ? animateTimes.speed : parseFloat($(tag).attr("data-speed"));
        var _delay = $(tag).attr("data-delay") == undefined ? animateTimes.delay : parseFloat($(tag).attr("data-delay"));
        if (!$(tag).is(":animated")) {
            $(tag).prev(".preview-m-line").hide();
            $(tag).addClass("animated").children().addClass("isImgAnimated");
            $(tag).addClass("isAnimated").css({
                "animation": "" + ani + " " + _speed + "s ease " + _delay + "s both running"
            }).attr("data-animate-name", ani);
        }
        $(".isAnimated").on("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oAnimationend animationend", function () {
            if ($(this).parents(".preview-m-position").hasClass("active")) {
                $(this).prev(".preview-m-line").show();
            }
            $(this).children().removeClass("isImgAnimated");
            $(this).removeClass("animated");
            $(this).removeClass("isAnimated").css({"animation": ""});
        });
    }

    //计算时长
    function sumAllTimes() {
        var sum = 0;
        $(".preview-m-position").each(function () {
            var _speed = $(this).find(".preview-m-c").attr("data-speed") == undefined ? animateTimes.speed : parseFloat($(this).find(".preview-m-c").attr("data-speed"));
            var _delay = $(this).find(".preview-m-c").attr("data-delay") == undefined ? animateTimes.delay : parseFloat($(this).find(".preview-m-c").attr("data-delay"));
            sum += (_speed + _delay);
        });
        $("#sumTimes").text(sum.toFixed(2) + "s");
    }

    /**
     * 公共方法
     * @type {number}
     */

    //懒加载
    function lazyImg(dom) {
        $("img.lazy").lazyload({
            placeholder: "img/loading.gif",
            effect: "fadeIn",
            container: dom
        }).on("load", function () {
            $(this).addClass("isLoaded");
        });
    }

    //显示遮罩
    function showModal() {
        resetModal();
        $("#imgModal").on('shown.bs.modal', function () {
            if (!_lazyDom_.find("img").hasClass("isLoaded")) {
                lazyImg(_lazyDom_);
            }
        }).modal();

        $(".material-cont,.upload_preview").perfectScrollbar();
    }

    //裁剪
    function tailorFun(img) {
        var jcrop_api, boundx, boundy, w, h;
        var WIDTH = 240;
        var HEIGHT = 240;
        var _img_w, _img_h;
        var _img = new Image();
        var $previewCon = $(".app-jc-cont");
        var $previewImg = $(".app-jc-cont img");
        w = $previewCon.width();
        h = $previewCon.height();

        _img.src = $(img).attr("src");
        _img.onload = function () {
            _img_w = $(img).width();
            _img_h = $(img).height();
            if (_img_w > _img_h) {
                $(img).css({
                    "width": WIDTH + "px",
                    "height": WIDTH / _img_w * _img_h + "px"
                });
            } else {
                $(img).css({
                    "height": HEIGHT + "px",
                    "width": HEIGHT / _img_h * _img_w + "px"
                });
            }
            $(img).Jcrop({
                onChange: showPreview,
                onSelect: showPreview,
                onRelease: hidePreview,
                aspectRatio: w / h,
                bgColor: '#ffffff',
                bgOpacity: 0.7
            }, function () {
                var bounds = this.getBounds();
                boundx = bounds[0];
                boundy = bounds[1];
                jcrop_api = this;

                jcrop_api.setSelect([0, 0, boundx, boundy]);
            });
            function showPreview(coords) {
                if (parseInt(coords.w) > 0) {
                    var rx = w / coords.w;
                    var ry = h / coords.h;
                    $previewImg.css({
                        width: Math.round(rx * boundx) + 'px',
                        height: Math.round(ry * boundy) + 'px',
                        marginLeft: '-' + Math.round(rx * coords.x) + 'px',
                        marginTop: '-' + Math.round(ry * coords.y) + 'px'
                    }).show();
                }
            }

            function hidePreview() {
                $previewImg.stop().fadeOut('fast');
            }
        };
    }

    //确定
    function _checkImg_(type) {
        var img = $("a[data-select='1']").find("img");
        if (img.attr("src") == undefined) {
            return;
        }
        switch (type) {
            case "img":
                $(".preview-m-position").removeClass("active");
                $(".preview-m-line").hide();
                $(".isText,.isVideo").hide();
                $(".isImage").show();
                $(".content-right-header .half-tab:eq(0)").text("属性");
                var _html = previewHtml("img", img);
                var $tag_dom = $(".preview-cont");
                $tag_dom.prepend(_html);
                $(".content-right-menu").show();
                $(".content-right-bg").hide();
                slideInit($(".preview-m-position.active img.newImg"), $(".preview-m-position.active .preview-m-c"));
                sumAllTimes();
                $(".content-right-p-right").perfectScrollbar();
                break;
            case "bg":
                var _app_bg = $(".app-jc-cont"), _jc_img = $("#jcImg");
                if (img.length >= 1) {
                    _jc_img.empty();
                    _jc_img.append('<img id="jcrop_target" src="' + img.attr("src") + '">');
                    _app_bg.empty();
                    _app_bg.append('<img src="' + img.attr("src") + '">');
                    var _img_ = $("#jcrop_target");
                    tailorFun(_img_);
                } else {
                    alert("您还没有选择图片，请先选择图片！");
                }
                break;
            case "chImg":
                $(".preview-m-position.active").css({
                    "width": $(".preview-m-position.active").width(),
                    "height": $(".preview-m-position.active").height()
                }).find("img").attr("src", img.attr("src")).css({
                    "width": $(".preview-m-position.active").attr("data-w"),
                    "height": $(".preview-m-position.active").attr("data-h")
                });
                break;
        }
    }

    //选中图片
    function _selectImg_(type, dom) {
        $("a[data-select='1']").attr("data-select", "0").css("border", "");
        if (type == "upLoad") {
            $(dom).eq(0).find("a").attr("data-select", "1").css("border", "1px solid #009DE0");
        }
        $(dom).each(function () {
            var _this = this;
            $(_this).find("a").click(function () {
                $("a[data-select='1']").attr("data-select", "0").css("border", "");
                $(this).attr("data-select", "1").css("border", "1px solid #009DE0");
            });
        });
    }

    //颜色选择器
    function colorPicker(dom, tag, newCss) {
        $(dom).colpick({
            layout: 'hex',
            submit: 0,
            colorScheme: 'dark',
            height: 270,
            color: _def_color,
            onChange: function (hsb, hex, rgb, el, bySetColor) {
                var _new_color = "#" + hex;
                for (var i = 0; i < newCss.length; i++) {
                    if (!$(dom).hasClass("color8")) {
                        $(dom).css("backgroundColor", _new_color);
                        $(tag).attr("data-color", _new_color);
                        _textObj._color = _new_color;
                    }
                    $(tag).css(newCss[i], _new_color)
                }
                if (!bySetColor) $(el).val(_new_color);
            }
        }).keyup(function () {
            $(this).colpickSetColor(this.value);
        });
    }

    //滑动选择
    function silderSelect(val, dom, tag, newCss) {
        $(dom).css({
            width: '65%',
            'float': 'left',
            'marginLeft': '8px',
            'marginTop': '12px'
        }).slider({
            value: val,
            range: "min",
            min: parseInt($(dom).nextAll(".hidden").attr("data-min")),
            max: parseInt($(dom).nextAll(".hidden").attr("data-max")),
            animate: true,
            slide: function (event, ui) {     //滑动 回调
                for (var i = 0; i < newCss.length; i++) {
                    var _val = 0, _val_ = 0;
                    _val_ = ui.value;
                    if (newCss[i].name == "opacity") {
                        _val = (parseInt($(dom).nextAll(".hidden").attr("data-max")) - ui.value) / 100;
                        $(tag).css(newCss[i].name, _val + newCss[i].units);
                    } else if (newCss[i].name == "border-radius") {
                        _val = ui.value;
                        $(tag).attr("data-radius", ui.value);
                        $(tag).css(newCss[i].name, _val + newCss[i].units);
                    } else if (newCss[i].name == "box-shadow") {
                        _val = "#000000 0px 0px " + ui.value;
                        $(tag).attr("data-shadow", ui.value);
                        $(tag).css(newCss[i].name, _val + newCss[i].units);
                    } else if (newCss[i].name == "transform") {
                        _val = "rotate(" + ui.value + "deg)";
                        $(tag).attr("data-rotate", ui.value);
                        $(tag).css(newCss[i].name, _val + newCss[i].units);
                        //外接
                        if (ui.value == 0 || ui.value == 360) {
                            $(tag).removeClass("rotated");
                        } else {
                            $(tag).addClass("rotated");
                        }

                        //var _t = parseInt($(tag).parents(".preview-m-position.active").css("top"));
                        //var _l = parseInt($(tag).parents(".preview-m-position.active").css("left"));
                        var _w = parseInt($(tag).parents(".preview-m-position.active").attr("data-w"));
                        var _h = parseInt($(tag).parents(".preview-m-position.active").attr("data-h"));
                        var _a = ui.value;
                        var _poAry = outerRectangle(_w, _h, _a);
                        //if($(tag).parents(".preview-m-zIndex").hasClass("preview-text")){
                        //    var _ele=$(tag).parents(".preview-m-position");
                        //    var _size = _ele.find("label.nameText").attr("data-size") != undefined ? parseInt(_ele.find("label.nameText").attr("data-size")) : _textObjInit._size;
                        //    var _lineHeight = _ele.find("label.nameText").attr("data-lineHeight") != undefined ? parseFloat(_ele.find("label.nameText").attr("data-lineHeight")) : _textObjInit._lineHeight;
                        //    //$(tag).width(_w);
                        //    console.log(_size,_lineHeight,textHeight(_ele,_size,_lineHeight));
                        //    //$(tag).height(textHeight(_ele,_size,_lineHeight));
                        //}else{
                        //    $(tag).width(_w);
                        //    $(tag).height(_h);
                        //}
                        //$(tag).parents(".preview-m-position.active").css({
                        //    "width": _poAry._width + "px",
                        //    "height": _poAry._height + "px"
                        //});
                        //$(tag).parents(".preview-m-position.active").find(".preview-m-line").css({
                        //    "top": _poAry._top + "px",
                        //    "left": _poAry._left + "px"
                        //});
                        //$("#eleHeight,#eleHeight2").val(_poAry._height + "px");
                        //$("#eleWidth,#eleWidth2").val(_poAry._width + "px");
                        //$("#eleTop,#eleTop2").val((_t + _poAry._top) + "px");
                        //$("#eleLeft,#eleLeft2").val((_l + _poAry._left) + "px");
                        ele_Area._width = _poAry._width;
                        ele_Area._height = _poAry._height;
                        ele_Area._top = _poAry._top;
                        ele_Area._left = _poAry._left;
                        ele_Area._ang = ui.value;

                    } else if (newCss[i].name == "animate-speed") {
                        _val = ui.value / 10;
                        _val_ = ui.value / 10;
                        $(tag).attr("data-speed", _val);
                    } else if (newCss[i].name == "animate-delay") {
                        _val = ui.value / 10;
                        _val_ = ui.value / 10;
                        $(tag).attr("data-delay", _val);
                    } else {
                        _val = ui.value;
                        $(tag).css(newCss[i].name, _val + newCss[i].units);
                    }
                    $(this).nextAll(".opacity-text").val(_val_ + newCss[i]._units);
                    sumAllTimes();
                }
            }
        });
    }

    //初始化滑块
    function slideInit(_tag1, _tag2) {
        $("#opacityControl2,#opacityControl3").each(function () {
            var _n_val = 0;
            if (_tag1.css("opacity") != undefined) {
                _n_val = (100 - parseFloat(_tag1.css("opacity")) * 100);
            } else {
                _n_val = 0;
            }
            silderSelect(_n_val, this, _tag1, [{
                name: "opacity",
                units: "",
                _units: "%"
            }]);
            $(this).next(".opacity-text").val(_n_val + "%");
        });
        $("#radiusControl").each(function () {
            var _n_val = 0;
            if (_tag1.attr("data-radius") != undefined) {
                _n_val = parseInt(_tag1.attr("data-radius"));
            } else {
                _n_val = 0;
            }
            silderSelect(_n_val, this, _tag1, [{
                name: "border-radius",
                units: "%",
                _units: "%"
            }]);
            $(this).next(".opacity-text").val(_n_val + "%");
        });
        $("#shadowControl").each(function () {
            var _n_val = 0;
            if (_tag1.attr("data-shadow") != undefined) {
                _n_val = parseInt(_tag1.attr("data-shadow"));
            } else {
                _n_val = 0;
            }
            silderSelect(_n_val, this, _tag1, [{
                name: "box-shadow",
                units: "px",
                _units: "px"
            }]);
            $(this).next(".opacity-text").val(_n_val + "px");
        });
        $("#rotateControl,#rotateControl2").each(function () {
            var _n_val = 0;
            if (_tag1.parents(".preview-m-position.active").attr("data-rotate") != undefined) {
                _n_val = parseInt(_tag1.parents(".preview-m-position.active").attr("data-rotate"));
            } else {
                _n_val = 0;
            }
            silderSelect(_n_val, this, _tag1.parents(".preview-m-position.active"), [{
                name: "transform",
                units: "",
                _units: "deg"
            }]);
            $(this).next(".opacity-text").val(_n_val + "deg");
        });
        //动作
        $("#speedControl").each(function () {
            var _n_val = 0;
            if (_tag2.attr("data-speed") != undefined) {
                _n_val = parseFloat(_tag2.attr("data-speed")) * 10;
            } else {
                _n_val = 10;
            }
            silderSelect(_n_val, this, _tag2, [{
                name: "animate-speed",
                units: "s",
                _units: "s"
            }]);
            $(this).next(".opacity-text").val(_n_val / 10 + "s");
        });
        $("#delayControl").each(function () {
            var _n_val = 0;
            if (_tag2.attr("data-delay") != undefined) {
                _n_val = parseFloat(_tag2.attr("data-delay")) * 10;
            } else {
                _n_val = 6;
            }
            silderSelect(_n_val, this, _tag2, [{
                name: "animate-delay",
                units: "s",
                _units: "s"
            }]);
            $(this).next(".opacity-text").val(_n_val / 10 + "s");
        });
        if (_tag2.attr("data-animate-name") != undefined) {
            $("#selectAnimate li").each(function () {
                if ($(this).attr("data-animate") == _tag2.attr("data-animate-name")) {
                    $(this).find("span").addClass("active");
                    $(this).siblings().find("span").removeClass("active");
                }
            });
        } else {
            $("#selectAnimate span").removeClass("active");
            $("#selectAnimate li[data-animate='fadeIn']").find("span").addClass("active");
        }
    }

    //结束

    /**
     * 外接矩形
     */
    function outerRectangle(w, h, a) {
        var _area = {};
        var _w, _h, _a;
        if (0 <= a && a <= 90) {
            _a = a;
            _w = w;
            _h = h;
        } else if (a > 90 && a <= 180) {
            _a = a - 90;
            _w = h;
            _h = w;
        } else if (a > 180 && a <= 270) {
            _a = a - 180;
            _w = w;
            _h = h;
        } else if (a > 270 && a <= 360) {
            _a = a - 270;
            _w = h;
            _h = w;
        }
        _area._width = parseInt(_w * (Math.round(Math.cos(_a * Math.PI / 180) * 1000000) / 1000000) + _h * (Math.round(Math.sin(_a * Math.PI / 180) * 1000000) / 1000000));
        _area._height = parseInt(_h * (Math.round(Math.cos(_a * Math.PI / 180) * 1000000) / 1000000) + _w * (Math.round(Math.sin(_a * Math.PI / 180) * 1000000) / 1000000));
        _area._top = parseInt(h / 2 - parseInt(_h * (Math.round(Math.cos(_a * Math.PI / 180) * 1000000) / 1000000) + _w * (Math.round(Math.sin(_a * Math.PI / 180) * 1000000) / 1000000)) / 2);
        _area._left = parseInt(w / 2 - parseInt(_w * (Math.round(Math.cos(_a * Math.PI / 180) * 1000000) / 1000000) + _h * (Math.round(Math.sin(_a * Math.PI / 180) * 1000000) / 1000000)) / 2);
        return _area;
    }

    function angleCount(ang) {
        var _ang;
        if (0 <= ang && ang <= 90) {
            _ang = ang;
        } else if (ang > 90 && ang <= 180) {
            _ang = ang - 90;
        } else if (ang > 180 && ang <= 270) {
            _ang = ang - 180;
        } else if (ang > 270 && ang <= 360) {
            _ang = ang - 270;
        }
        var ang_val = {};
        ang_val._cos = Math.round(Math.cos(_ang * Math.PI / 180) * 1000000) / 1000000;
        ang_val._sin = Math.round(Math.sin(_ang * Math.PI / 180) * 1000000) / 1000000;
        return ang_val;
    }

    /**
     * 文字操作
     */
    //初始化字体样式
    var _textObj = {};
    var _textObjInit = {
        _size: 40,
        _text: "请输入文本",
        _align: "center",
        _color: "#333333",
        _lineHeight: 1.5,
        _fontWeight: "400",
        _fontStyle: "normal",
        _textDecoration: "none",
        _isMarquee: "noMar",
        _isLoops: "isLoop",
        _anTime: 10
    };
    var _isOne = false;
    //绑定事件
    $("#textEditor").on("click", addHtml);
    //初始化文字属性
    function textPropInit(name, color, size, lineH, fWeight, fStyle, tDecoration, tAlign) {
        $("#nameText").val(name);
        $("#textColor").css("backgroundColor", color).colpickSetColor(color, true);
        $("#textSize").html(size + 'px  <span class="caret"></span>');
        $("#textLineHeight").html(lineH + '倍  <span class="caret"></span>');
        if (fWeight == "400") {
            $(".textType:eq(0)").removeClass("active");
        } else {
            $(".textType:eq(0)").addClass("active");
        }
        if (fStyle == "normal") {
            $(".textType:eq(1)").removeClass("active");
        } else {
            $(".textType:eq(1)").addClass("active");
        }
        if (tDecoration == "none") {
            $(".textType:eq(2)").removeClass("active");
        } else {
            $(".textType:eq(2)").addClass("active");
        }
        $(".textAlign").removeClass("active");
        switch (tAlign) {
            case "left":
                $(".textAlign:eq(0)").addClass("active");
                break;
            case "center":
                $(".textAlign:eq(1)").addClass("active");
                break;
            case "right":
                $(".textAlign:eq(2)").addClass("active");
                break;
        }
    }

    //输入
    $("#nameText").keyup(function () {
        var _ele = $(".preview-m-position.active");
        var _val = $(this).val();
        var _size = _ele.find("label.nameText").attr("data-size") != undefined ? parseInt(_ele.find("label.nameText").attr("data-size")) : _textObjInit._size;
        var _lineHeight = _ele.find("label.nameText").attr("data-lineHeight") != undefined ? parseFloat(_ele.find("label.nameText").attr("data-lineHeight")) : _textObjInit._lineHeight;
        _ele.find("label.nameText span").text(_val);
        var _h = textHeight(_ele, _size, _lineHeight);
        $("#eleHeight2").val(_h + "px");
        _textObj._text = _val;
        _textObj._lineHeight = _lineHeight;
    });

    //改变字体大小
    $(".textSizeMenu li").each(function () {
        $(this).click(function () {
            var _ele = $(".preview-m-position.active");
            var _text = $(this).text();
            var _val = parseInt(_text);
            $(this).parent().prev().html(_text + '   <span class="caret"></span>');
            var _h = textHeight(_ele, _val, _textObj._lineHeight);
            $("#eleHeight2").val(_h + "px");
            _textObj._size = _val;
        });
    });
    $(".textLineMenu li").each(function () {
        $(this).click(function () {
            var _ele = $(".preview-m-position.active");
            var _text = $(this).text();
            var _val = parseFloat(_text).toFixed(1);
            $(this).parent().prev().html(_text + '   <span class="caret"></span>');
            var _h = textHeight(_ele, _textObj._size, _val);
            $("#eleHeight2").val(_h + "px");
            _textObj._lineHeight = _val;
        });
    });

    //字体样式
    $("a.textType").click(function (i) {
        var _i = $(this).index();
        var _data = ["data-fWeight", "data-fStyle", "data-tDecoration"];
        var _types = ["font-weight", "font-style", "text-decoration"];
        var _result = ["400", "normal", "none"];
        var _ele = $(".preview-m-position.active");
        var _val = $(this).find("i").attr("class").split("-");
        if ($(this).hasClass("active")) {
            _ele.find("label.nameText").css(_types[_i], _result[_i]).attr(_data[_i], _result[_i]);
        } else {
            _ele.find("label.nameText").css(_types[_i], _val[_val.length - 1]).attr(_data[_i], _val[_val.length - 1]);
        }
        _textObj._fontWeight = _ele.find("label.nameText").css("font-weight");
        _textObj._fontStyle = _ele.find("label.nameText").css("font-style");
        _textObj._textDecoration = _ele.find("label.nameText").css("text-decoration");
        $(this).toggleClass("active");
    });

    //字体方向
    $("a.textAlign").click(function () {
        var _ele = $(".preview-m-position.active");
        var _val = $(this).find("i").attr("class").split("-");
        _ele.find("label.nameText").css("text-align", _val[_val.length - 1]).attr("data-align", _val[_val.length - 1]);
        _textObj._align = _val[_val.length - 1];
        $("a.textAlign").removeClass("active");
        $(this).toggleClass("active");
    });

    //字体颜色
    $("#textColor").each(function () {
        var _css_ = ["color"];
        colorPicker(this, ".preview-m-position.active label.nameText", _css_);
    });

    function textHeight(tag, n, ln) {
        tag.find("label.nameText").css({"font-size": n + "px", "line-height": ln}).attr({
            "data-lineHeight": ln,
            "data-size": n
        });
        var _h = tag.find("label.nameText").height();
        tag.css("height", _h + "px").attr("data-h", _h + "px");
        //tag.find("label.nameText").css("height", _h + "px");
        return _h;
    }

    function addHtml() {
        _isOne = true;
        $(".preview-m-position").removeClass("active");
        $(".preview-m-line").hide();
        $(".content-right-menu").show();
        $(".content-right-bg").hide();
        $(".isText").show();
        $(".isImage,.isVideo").hide();
        $(".content-right-header .half-tab:eq(0)").text("文字");
        var _html = previewHtml("text", _textObjInit);
        var $tag_dom = $(".preview-cont");
        $tag_dom.prepend(_html);
        //初始化文字信息
        //var _this_id = $(".preview-m-zIndex.preview-text").attr("data-id");
        //_thisText_data.push({
        //    id: _this_id,
        //    cont: _textObjInit
        //});
        //console.log(_thisText_data);
        textPropInit(_textObjInit._text, _textObjInit._color, _textObjInit._size, _textObjInit._lineHeight, _textObjInit._fontWeight, _textObjInit._fontStyle, _textObjInit._textDecoration, _textObjInit._align);
        //初始化跑马灯
        _isOpen = false;
        $(".sliderBtn a").text("开启跑马灯");
        $(".marquee-setting").hide();
        //初始化滑块
        slideInit($(".preview-m-position.active label.nameText"), $(".preview-m-position.active .preview-m-c"));
        $(".content-right-p-right").perfectScrollbar();
        sumAllTimes();
    }

    //设置跑马灯
    var _timer_interval = "", _isOpen = false, _isLoop = true, _times = 10;
    $(".sliderBtn a").click(function () {
        var _ele = $(".preview-m-position.active");
        var _tag = $(".marquee-setting");
        var _size = _ele.find("label.nameText").attr("data-size") != undefined ? parseInt(_ele.find("label.nameText").attr("data-size")) : _textObj._size;
        var _lineHeight = _ele.find("label.nameText").attr("data-lineHeight") != undefined ? parseFloat(_ele.find("label.nameText").attr("data-lineHeight")) : _textObj._lineHeight;
        _ele.find("label.nameText").toggleClass("marquee");
        _tag.toggle();

        //跑马灯开关
        if (_isOpen) {
            $(this).text("开启跑马灯");
            _isOpen = false;
            _textObj._isMarquee = false;
            clearInterval(parseInt(_ele.find("label.nameText").attr("data-interval")));
            _ele.find("label.nameText").css("left", "0px").attr("data-marquee", "noMar");
            _ele.find(".preview-m-c").css("overflow", "");
        } else {
            $(this).text("关闭跑马灯");
            _isOpen = true;
            _textObj._isMarquee = true;
            _ele.find(".preview-m-c").css("overflow", "hidden");
            var $tag = $("#textMarquee");
            var _newTimes = _ele.find("label.nameText").attr("data-isAnimate") == undefined ? _textObjInit._anTime : parseInt(_ele.find("label.nameText").attr("data-isAnimate"));
            var _newLoops = _ele.find("label.nameText").attr("data-isLoop") == undefined ? _textObjInit._isLoops : _ele.find("label.nameText").attr("data-isLoop");
            _ele.find("label.nameText").attr("data-marquee", "isMar");
            _ele.find("label.nameText").attr("data-isAnimate", _newTimes);
            _ele.find("label.nameText").attr("data-isLoop", _newLoops);

            if (_newLoops == "isLoop") {
                $(".marquee-type:eq(0) input").prop("checked", true);
                $(".marquee-type:eq(1) input").prop("checked", false);
            } else {
                $(".marquee-type:eq(0) input").prop("checked", false);
                $(".marquee-type:eq(1) input").prop("checked", true);
            }

            $tag.css({
                width: '65%',
                'float': 'left',
                'marginLeft': '8px',
                'marginTop': '12px'
            }).slider({
                value: _newTimes,
                range: "min",
                min: parseInt($tag.nextAll(".hidden").attr("data-min")),
                max: parseInt($tag.nextAll(".hidden").attr("data-max")),
                animate: true,
                slide: function (event, ui) {     //滑动 回调
                    var _ele_ = $(".preview-m-position.active").find("label.nameText");
                    _textObj._anTime = ui.value;
                    $(this).nextAll(".opacity-text").val(ui.value + "s");
                    _times = ui.value;
                    _ele_.attr("data-isAnimate", ui.value);
                    clearInterval(parseInt(_ele_.attr("data-interval")));
                    marqueeText(_ele_, "left", _times);
                }
            }).nextAll(".opacity-text").val(_newTimes + "s");
            marqueeText(_ele.find("label.nameText"), "left", _newTimes);
        }

        var _h = textHeight(_ele, _size, _lineHeight);
        $("#eleHeight2").val(_h + "px");
    });
    $(".marquee-type input").click(function () {
        var _ele = $(".preview-m-position.active");
        var _i = $(this).parents(".marquee-type").index();
        if (_i == 0) {
            _textObj._isLoops = true;
            _ele.find("label.nameText").attr("data-isLoop", "isLoop");
        } else {
            _textObj._isLoops = false;
            _ele.find("label.nameText").attr("data-isLoop", "noLoop");
        }
        var _new_times = _ele.find("label.nameText").attr("data-isAnimate") == undefined ? _textObjInit._anTime : parseInt(_ele.find("label.nameText").attr("data-isAnimate"));
        clearInterval(parseInt(_ele.find("label.nameText").attr("data-interval")));
        marqueeText(_ele.find("label.nameText"), "left", _new_times);
    });

    //跑马灯
    function marqueeText(tag, slideDir, time) {
        var _new_width;
        _timer_interval = setInterval(function () {
            var _left = parseInt($(tag).css("left"));
            var _p_width = $(tag).parents(".preview-m-c").width();
            var _width = $(tag).find("span").width();
            _new_width = _p_width >= _width ? _p_width : _width;
            switch (slideDir) {
                case "left":
                    if (_left < 0 && Math.abs(_left) > _new_width) {
                        $(tag).css("left", _p_width + "px");
                        if (tag.attr("data-isLoop") != "isLoop") {
                            $(tag).css("left", "0px");
                            clearInterval(parseInt(tag.attr("data-interval")));
                        }
                    } else {
                        $(tag).css("left", (_left - 1) + "px");
                    }
                    break;
                case "right":
                    console.log("暂无");
                    break;
            }
        }, time);
        $(tag).attr("data-interval", _timer_interval);
    }

    /**
     * 鼠标移动、拖拽、右键
     * @type {{}}
     * @private
     */
    var _mouse = {},
        _state = {},
        _target,
        _old_target,
        _target_img,
        _isMouseRight = false,
        _isDrop = false,
        _isMove = false;

    //绑定事件
    $(document).on("mousedown", ".preview-m-position", startMove);
    $(document).on("mousedown", ".preview-m-position", startResize);
    $(document).on("mousedown", ".preview-m-position", mouseRight);

    /**
     * 添加HTML
     */
    function previewHtml(type, obj) {
        _i++;
        var _html = "";
        var _type_html = "";
        var _text_html = "";
        var _w = 0, _h = 0, _t, _l;
        switch (type) {
            case "text":
                tag_i++;
                _html += '<div class="preview-m-zIndex preview-text"  data-ID="Text' + tag_i + '" style="z-index: ' + _i + '" data-clicked=0>';
                _type_html += '<div class="p-line-btn btn-w"></div>';
                _type_html += '<div class="p-line-btn btn-e"></div>';
                _text_html += '<label class="nameText" style="color:' + obj._color + '; font-size:' + obj._size + 'px; text-align:' + obj._align + '; line-height:' + obj._lineHeight + '"><span>' + obj._text + '</span></label>';

                //初始化
                _w = "350px";
                _h = "60px";
                _t = "100px";
                _l = "100px";
                break;
            case "img":
                _type_html += '<div class="p-line-btn btn-nw"></div>';
                _type_html += '<div class="p-line-btn btn-w"></div>';
                _type_html += '<div class="p-line-btn btn-sw"></div>';
                _type_html += '<div class="p-line-btn btn-n"></div>';
                _type_html += '<div class="p-line-btn btn-s"></div>';
                _type_html += '<div class="p-line-btn btn-ne"></div>';
                _type_html += '<div class="p-line-btn btn-e"></div>';
                _type_html += '<div class="p-line-btn btn-se"></div>';
                _html += '<div class="preview-m-zIndex preview-img-headImg" style="z-index: ' + _i + '" data-clicked=0>';
                _text_html += '<img class="newImg" src="' + obj.attr("src") + '">';

                //初始化
                _w = obj.width() * 2 + "px";
                _h = obj.height() * 2 + "px";
                _t = "100px";
                _l = "100px";
                break;
            case "video":
                _html += '<div class="preview-m-zIndex preview-video" style="z-index: ' + _i + '" data-clicked=0>';
                _type_html += '<div class="p-line-btn btn-nw"></div>';
                _type_html += '<div class="p-line-btn btn-sw"></div>';
                _type_html += '<div class="p-line-btn btn-ne"></div>';
                _type_html += '<div class="p-line-btn btn-se"></div>';
                _text_html += obj;

                //初始化
                _w = "768px";
                _h = "500px";
                _t = "0px";
                _l = "0px";
                break;
        }


        $("#eleWidth,#eleWidth2").val(_w);
        $("#eleHeight,#eleHeight2").val(_h);
        $("#eleTop,#eleTop2").val(_t);
        $("#eleLeft,#eleLeft2").val(_l);
        _html += '    <div class="preview-m-position active" style="top:' + _t + ';  left:' + _l + ';width: ' + _w + '; height:' + _h + '" data-w="' + _w + '" data-h="' + _h + '" data-t="50px" data-l="50px">';
        _html += '        <div class="preview-m-line">';
        _html += '            <div class="p-line p-line-top"></div>';
        _html += '            <div class="p-line p-line-left"></div>';
        _html += '            <div class="p-line p-line-bto"></div>';
        _html += '            <div class="p-line p-line-right"></div>';
        _html += _type_html;
        _html += '        </div>';
        _html += '        <div class="preview-m-c">';
        _html += _text_html;
        _html += '        </div>';
        _html += '    </div>';
        _html += '</div>';
        return _html;
    }

    /**
     * 鼠标右键
     */
    $(document).on("contextmenu", function (e) {
        var ev = e || window.event;
        var target = ev.target || ev.srcElement;
        if ($(target).parents(".preview-app").hasClass("preview-app") || $(target).parents("div").hasClass("preview-mouse-nav")) {
            ev.preventDefault();
            return false;
        }
        return true;
    });
    function mouseRight(e) {
        var ev = e || window.event;
        ev.stopPropagation();
        ev.preventDefault();
        var _m_x = (ev.clientX || ev.pageX) + $(window).scrollLeft();
        var _m_y = (ev.clientY || ev.pageY) + $(window).scrollTop();
        var top = _m_y - $(".preview-app").offset().top + 1;
        var left = _m_x - $(".preview-app").offset().left + 1;
        if (ev.which == 3) {
            _isMouseRight = true;
            isCurrentEle = $(ev.target).parents(".preview-m-position");
            _target_dom._dom = $(ev.target).parents(".preview-m-zIndex");
            _target_dom._index = _target_dom._dom.index();
            $(".preview-mouse-nav").css({
                top: top * 2 + "px",
                left: left * 2 + "px"
            }).show();
            if ($(".preview-m-zIndex").length == 1) {
                $(".preview-mouse-nav li").addClass("none-click");
                $(".preview-mouse-nav li:eq(4)").removeClass("none-click");
            } else {
                switch ((parseInt(_target_dom._dom.css("z-index")))) {
                    case _def_zIndex + $(".preview-m-zIndex").length - 1:
                        $(".preview-mouse-nav li").removeClass("none-click");
                        $(".preview-mouse-nav li:eq(0),.preview-mouse-nav li:eq(2)").addClass("none-click");
                        break;
                    case _def_zIndex:
                        $(".preview-mouse-nav li").removeClass("none-click");
                        $(".preview-mouse-nav li:eq(1),.preview-mouse-nav li:eq(3)").addClass("none-click");
                        break;
                    default :
                        $(".preview-mouse-nav li").removeClass("none-click");
                        break;
                }
            }
        } else {
            $(".preview-mouse-nav").hide();
        }
    }

    /**
     * 操作菜单显示
     */
    $(document).click(function () {
        $(document).on("click", documentHideHandle);
    });
    function documentHideHandle(e) {
        var ev = e || window.event;
        ev.stopPropagation();
        if (ev.which != 3) {
            $(".preview-mouse-nav").hide();
        }
        if ($(ev.target).hasClass("content-mid") || $(ev.target).hasClass("preview-cont")) {
            $(".content-right-menu").hide();
            $(".content-right-bg").show();
            $(".preview-m-line").hide();
        }
    }

    /**
     * 右键菜单
     */
    var _target_dom = {}, _def_zIndex = 30, _i = 29, tag_i = 0;
    $(".preview-mouse-nav li").each(function (i) {
        switch (i) {
            case 0:
                $(this).on("click", 1, moveTop);
                break;
            case 1:
                $(this).on("click", 1, moveBto);
                break;
            case 2:
                $(this).on("click", 2, moveTop);
                break;
            case 3:
                $(this).on("click", 2, moveBto);
                break;
            case 4:
                $(this).on("click", deleteDom);
                break;
        }
    });
    function _dom_zIndex(zIndex) {
        var _dom = "";
        $(".preview-m-zIndex").each(function () {
            if (parseInt($(this).css("z-index")) == zIndex) {
                _dom = this;
            }
        });
        return _dom;
    }

    function moveTop(e) {
        var _zIndex = parseInt(_target_dom._dom.css("z-index")) + 1;
        var $dom = $(_dom_zIndex(_zIndex));
        if (!$(this).hasClass("none-click")) {
            if (e.data == 1) {
                if ($dom == undefined) {
                    return false;
                } else {
                    _target_dom._dom.css("z-index", $dom.css("z-index"));
                    $dom.css("z-index", _zIndex - 1);
                }
            } else if (e.data == 2) {
                var max_zIndex = _def_zIndex + $(".preview-m-zIndex").length - 1;
                var _this_zIndex = parseInt(_target_dom._dom.css("z-index"));
                _target_dom._dom.css("z-index", max_zIndex);
                _target_dom._dom.siblings().each(function () {
                    if (parseInt($(this).css("z-index")) > _this_zIndex) {
                        $(this).css("z-index", parseInt($(this).css("z-index")) - 1);
                    }
                });
                $(".preview-mouse-nav li:eq(0),.preview-mouse-nav li:eq(2)").addClass("none-click");
            }
        }
    }

    function moveBto(e) {
        var _zIndex = parseInt(_target_dom._dom.css("z-index")) - 1;
        var $dom = $(_dom_zIndex(_zIndex));
        if (!$(this).hasClass("none-click")) {
            if (e.data == 1) {
                if ($dom == undefined) {
                    return false;
                } else {
                    _target_dom._dom.css("z-index", $dom.css("z-index"));
                    $dom.css("z-index", _zIndex + 1);
                }
            } else if (e.data == 2) {
                var _this_zIndex = parseInt(_target_dom._dom.css("z-index"));
                _target_dom._dom.css("z-index", _def_zIndex);
                _target_dom._dom.siblings().each(function () {
                    if (parseInt($(this).css("z-index")) < _this_zIndex) {
                        $(this).css("z-index", parseInt($(this).css("z-index")) + 1);
                    }
                });
                $(".preview-mouse-nav li:eq(1),.preview-mouse-nav li:eq(3)").addClass("none-click");
            }
        }
    }

    function deleteDom() {
        _i = _i - 1;
        if (_i == 29) {
            $(".content-right-menu").hide();
            $(".content-right-bg").show();
        }
        var _this_zIndex = parseInt(_target_dom._dom.css("z-index"));
        _target_dom._dom.siblings().each(function () {
            if (parseInt($(this).css("z-index")) > _this_zIndex) {
                $(this).css("z-index", parseInt($(this).css("z-index")) - 1);
            }
        });
        if (_target_dom._dom.hasClass("preview-text")) {
            $("#checkText").hide();
        } else {
            $("#checkImg").hide();
        }
        _target_dom._dom.remove();
    }

    /**
     * 移动
     * @param e
     */


    function startMove(e) {
        var ev = e || window.event;
        ev.stopPropagation();
        ev.preventDefault();
        //选中元素
        var _tag, _tag1, _tag2, _tag3;
        $(".preview-m-position").removeClass("active");
        $(".preview-m-line").hide();
        if ($(ev.target).hasClass("preview-m-position")) {
            _tag = $(ev.target);
            $(ev.target).addClass("active");
        } else if ($(ev.target).hasClass("isImgAnimated")) {
            _tag = $(ev.target).parents(".preview-m-position");
            _tag.addClass("active");
        } else {
            _tag = $(ev.target).parents(".preview-m-position");
            _tag.addClass("active");
            //显示线
            _tag.find(".preview-m-line").show();
        }
        _isCurrent = true;
        _tag1 = _tag.find("img");
        _tag2 = _tag.find(".preview-m-c");
        _tag3 = _tag.find("label.nameText");


        if (_tag.parents(".preview-m-zIndex").hasClass("preview-text")) {
            $(".isText").show();
            $(".isImage,.isVideo").hide();
            $(".content-right-header .half-tab:eq(0)").text("文字");
            slideInit(_tag3, _tag2);

            //初始化文字界面
            //文字属性
            var _textName = _tag.find("label.nameText span").text() == _textObjInit._text ? _textObjInit._text : _tag.find("label.nameText span").text();
            var _color = _tag.find("label.nameText").css("color").colorHex() == _textObjInit._color ? _textObjInit._color : _tag.find("label.nameText").css("color").colorHex();
            var _size = parseInt(_tag.find("label.nameText").css("font-size")) == _textObjInit._size ? _textObjInit._size : parseInt(_tag.find("label.nameText").css("font-size"));
            var _lineHeight = _tag.find("label.nameText").attr("data-lineHeight") == undefined ? _textObjInit._lineHeight : parseFloat(_tag.find("label.nameText").attr("data-lineHeight")).toFixed(1);
            var _fontWeight = _tag.find("label.nameText").attr("data-fWeight") == undefined ? _textObjInit._fontWeight : _tag.find("label.nameText").attr("data-fWeight");
            var _fontStyle = _tag.find("label.nameText").attr("data-fStyle") == undefined ? _textObjInit._fontStyle : _tag.find("label.nameText").attr("data-fStyle");
            var _textDecoration = _tag.find("label.nameText").attr("data-tDecoration") == undefined ? _textObjInit._textDecoration : _tag.find("label.nameText").attr("data-tDecoration");
            var _align = _tag.find("label.nameText").attr("data-tAlign") == undefined ? _textObjInit._align : _tag.find("label.nameText").attr("data-tAlign");
            textPropInit(_textName, _color, _size, _lineHeight, _fontWeight, _fontStyle, _textDecoration, _align);
            //结束
            //文字跑马灯
            var _isMarquee = _tag.find("label.nameText").attr("data-marquee") == undefined ? _textObjInit._isMarquee : _tag.find("label.nameText").attr("data-marquee");
            var _isLoops = _tag.find("label.nameText").attr("data-isLoop") == undefined ? _textObjInit._isLoops : _tag.find("label.nameText").attr("data-isLoop");
            var _anTime = _tag.find("label.nameText").attr("data-isAnimate") == undefined ? _textObjInit._anTime : parseInt(_tag.find("label.nameText").attr("data-isAnimate"));
            if (_isMarquee != "isMar") {
                _isOpen = false;
                $(".sliderBtn a").text("开启跑马灯");
                $(".marquee-setting").hide();
            } else {
                _isOpen = true;
                $(".sliderBtn a").text("关闭跑马灯");
                $(".marquee-setting").show();
                $("#textMarquee").slider({value: _anTime}).next().val(_anTime + "s");
                if (_isLoops == "isLoop") {
                    $(".marquee-type:eq(0) input").prop("checked", true);
                    $(".marquee-type:eq(1) input").prop("checked", false);
                } else {
                    $(".marquee-type:eq(0) input").prop("checked", false);
                    $(".marquee-type:eq(1) input").prop("checked", true);
                }
            }
            //结束
        } else if (_tag.parents(".preview-m-zIndex").hasClass("preview-img-headImg")) {
            $(".isText,.isVideo").hide();
            $(".isImage").show();
            $(".content-right-header .half-tab:eq(0)").text("属性");
            //点击初始化滑块
            slideInit(_tag1, _tag2);
        } else {
            $(".isText,.isImage").hide();
            $(".isVideo").show();
            $(".content-right-header .half-tab:eq(0)").text("视频");
            slideInit(_tag1, _tag2);
        }

        //操作界面
        $(".content-right-menu").show();
        $(".content-right-bg").hide();
        //if (_tag.find(".preview-m-c").children().hasClass("rotated")) {
        //    $("#eleTop,#eleTop2").val((parseInt(_tag.css("top")) + ele_Area._top) + "px");
        //    $("#eleLeft,#eleLeft2").val((parseInt(_tag.css("left")) + ele_Area._left) + "px");
        //} else {
        //    $("#eleTop,#eleTop2").val(_tag.css("top"));
        //    $("#eleLeft,#eleLeft2").val(_tag.css("left"));
        //}
        $("#eleTop,#eleTop2").val(_tag.css("top"));
        $("#eleLeft,#eleLeft2").val(_tag.css("left"));
        $("#eleWidth,#eleWidth2").val(_tag.width() + "px");
        $("#eleHeight,#eleHeight2").val(_tag.height() + "px");
        //结束

        saveEventState(ev);
        if (_tag.hasClass("rotated")) {
            _state._left = parseInt(_tag.attr("data-l"));
            _state._top = parseInt(_tag.attr("data-t"));
        }
        if (_tag.hasClass("active")) {
            if ($(ev.target).hasClass("preview-m-line")
                || $(ev.target).hasClass("newImg")
                || $(ev.target).hasClass("preview-m-c")
                || $(ev.target).parents("label").hasClass("nameText")
                || $(ev.target).hasClass("video-mp4")
                || $(ev.target).hasClass("video-swf")) {
                _isMove = true;
                _isDrop = false;
                _isMouseRight = false;

                $(document).on("mousemove", moving);
                $(document).on("mouseup", endMove);
            }
        }
    }

    function moving(e) {
        var ev = e || window.event;
        ev.stopPropagation();
        ev.preventDefault();
        if (_isMove) {
            var mouse_mx = (ev.clientX || ev.pageX) + $(window).scrollLeft();
            var mouse_my = (ev.clientY || ev.pageY) + $(window).scrollTop();
            var new_left, new_top;
            new_left = parseInt(mouse_mx - ( _state.mouse_sx - _state._left ));
            new_top = parseInt(mouse_my - ( _state.mouse_sy - _state._top ));
            if (!_isMouseRight) {
                $(".preview-m-position.active").css({
                    top: new_top * 2 + "px",
                    left: new_left * 2 + "px"
                }).attr({
                    "data-t": new_top + "px",
                    "data-l": new_left + "px"
                });
                $("#eleTop,#eleTop2").val(new_top * 2 + "px");
                $("#eleLeft,#eleLeft2").val(new_left * 2 + "px");
            }
        }
    }

    function endMove(e) {
        var ev = e || window.event;
        ev.stopPropagation();
        ev.preventDefault();
        $(document).off('mouseup', endMove);
        $(document).off('mousemove', moving);
    }

    /**
     * 拖拽
     * @param e
     */
    function startResize(e) {
        var ev = e || window.event;
        ev.stopPropagation();
        ev.preventDefault();

        if ($(ev.target).parents(".preview-m-position").hasClass("active")) {
            if ($(ev.target).hasClass("p-line-btn")) {
                _isMove = false;
                _isDrop = true;
                _target = $(ev.target).parents(".preview-m-position");
                _target_img = _target.find("img");
                _old_target = $(ev.target);

                $(document).on("mousemove", resizing);
                $(document).on("mouseup", endResize);
            }
        }
    }

    function resizing(e) {
        var ev = e || window.event;
        ev.stopPropagation();
        ev.preventDefault();
        _mouse.mx = (ev.clientX || ev.pageX) + $(window).scrollLeft();
        _mouse.my = (ev.clientY || ev.pageY) + $(window).scrollTop();

        if (_isDrop) {
            var $new_tag = $(_old_target);
            var _this_width, _this_height, _this_top, _this_left;
            var _new_top, _new_left, _new_width, _new_height;

            _this_width = _state._width;
            _this_height = _state._height;
            _this_top = _state._top;
            _this_left = _state._left;

            var _ratio = _this_width / _this_height;
            if ($new_tag.hasClass("btn-n")) {    //上方按钮
                _mouse.ey = _state.mouse_sy - _mouse.my;
                _new_height = _mouse.ey * 2 + _this_height;
                _new_top = _this_top - _mouse.ey;
                if (_new_height > 0) {
                    result(_this_width, _new_height, _new_top, _this_left);
                }
            } else if ($new_tag.hasClass("btn-e")) {    //右方按钮
                _mouse.ex = _mouse.mx - _state.mouse_sx;
                _new_width = _mouse.ex * 2 + _this_width;
                _new_height = _this_height;

                if ($new_tag.parents(".preview-m-zIndex").hasClass("preview-text")) {
                    if ((_mouse.ex + _this_width) < 80) {
                        _new_width = 80;
                    } else {
                        _new_width = _mouse.ex * 2 + _this_width;
                    }
                    _new_height = textHeight($new_tag.parents(".preview-m-position"), $new_tag.parents(".preview-m-zIndex").find("label.nameText").attr("data-size"));
                } else {
                    _new_width = _mouse.ex * 2 + _this_width;
                    _new_height = _this_height;
                }
                if (_new_width > 80) {
                    result(_new_width, _new_height, _this_top, _this_left);
                }
            } else if ($new_tag.hasClass("btn-s")) {    //下方按钮
                _mouse.ey = _mouse.my - _state.mouse_sy;
                _new_height = _mouse.ey * 2 + _this_height;
                result(_this_width, _new_height, _this_top, _this_left);
            } else if ($new_tag.hasClass("btn-w")) {    //左侧按钮
                _mouse.ex = _state.mouse_sx - _mouse.mx;
                _new_left = _this_left - _mouse.ex;

                if ($new_tag.parents(".preview-m-zIndex").hasClass("preview-text")) {
                    if ((_mouse.ex + _this_width) < 80) {
                        _new_width = 80;
                    } else {
                        _new_width = _mouse.ex * 2 + _this_width;
                    }
                    _new_height = textHeight($new_tag.parents(".preview-m-position"), $new_tag.parents(".preview-m-zIndex").find("label.nameText").attr("data-size"));
                    if (_new_width > 80) {
                        result(_new_width, _new_height, _this_top, _new_left);
                    }
                } else {
                    _new_width = _mouse.ex * 2 + _this_width;
                    _new_height = _this_height;
                    if (_new_width > 0) {
                        result(_new_width, _new_height, _this_top, _new_left);
                    }
                }
            } else if ($new_tag.hasClass("btn-se")) {   //右下按钮
                _mouse.ex = _mouse.mx - _state.mouse_sx;
                _mouse.ey = _mouse.my - _state.mouse_sy;
                _new_height = _mouse.ey * 2 + _this_height;
                _new_width = parseInt(_new_height * _ratio);
                result(_new_width, _new_height, _this_top, _this_left);
            } else if ($new_tag.hasClass("btn-nw")) {   //左上按钮
                _mouse.ex = _state.mouse_sx - _mouse.mx;
                _mouse.ey = _state.mouse_sy - _mouse.my;
                _new_width = _mouse.ex * 2 + _this_width;
                _new_height = parseInt(_new_width / _ratio);
                if (_new_width > 0) {
                    _new_top = _this_top - parseInt(_mouse.ex / _ratio);
                    _new_left = _this_left - _mouse.ex;
                    result(_new_width, _new_height, _new_top, _new_left);
                }
            } else if ($new_tag.hasClass("btn-sw")) {   //左下按钮
                _mouse.ex = _mouse.mx - _state.mouse_sx;
                _mouse.ey = _mouse.my - _state.mouse_sy;
                _new_height = _mouse.ey * 2 + _this_height;
                _new_width = parseInt(_new_height * _ratio);
                if (_new_width > 0) {
                    _new_left = _this_left - parseInt(_mouse.ey * _ratio);
                    result(_new_width, _new_height, _this_top, _new_left);
                }
            } else if ($new_tag.hasClass("btn-ne")) {   //右上按钮
                _mouse.ex = _mouse.mx - _state.mouse_sx;
                _mouse.ey = _state.mouse_sy - _mouse.my;
                _new_width = _mouse.ex * 2 + _this_width;
                _new_height = parseInt(_new_width / _ratio);
                if (_new_width > 0) {
                    _new_top = _this_top - parseInt(_mouse.ex / _ratio);
                    result(_new_width, _new_height, _new_top, _this_left);
                }
            }
        }
    }

    function endResize(e) {
        var ev = e || window.event;
        ev.stopPropagation();
        ev.preventDefault();
        $(document).off('mouseup', endResize);
        $(document).off('mousemove', resizing);
        $(document).off("click", documentHideHandle);
    }

    /**
     * 显示
     * @param width
     * @param height
     * @param top
     * @param left
     */
    function result(width, height, top, left) {
        if (parseInt(width) >= 2 && parseInt(height) >= 2) {
            var _rotateEle = $(_target).find(".preview-m-c");
            if (!_rotateEle.children().hasClass("rotated")) {       //没有旋转

                $("#eleTop,#eleTop2").val(parseInt(top) * 2 + "px");
                $("#eleLeft,#eleLeft2").val(parseInt(left) * 2 + "px");
                $("#eleWidth,#eleWidth2").val(parseInt(width) + "px");
                $("#eleHeight,#eleHeight2").val(parseInt(height) + "px");
                $(_target).css({
                    width: parseInt(width) + "px",
                    height: parseInt(height) + "px",
                    top: 2 * parseInt(top) + "px",
                    left: 2 * parseInt(left) + "px"
                }).attr({
                    "data-w": parseInt(width) + "px",
                    "data-h": parseInt(height) + "px"
                });
                $(_target_img).css({
                    width: parseInt(width) + "px",
                    height: parseInt(height) + "px"
                });
            } else {        //产生旋转之后

                $("#eleTop,#eleTop2").val((parseInt(top) * 2 + ele_Area._top) + "px");
                $("#eleLeft,#eleLeft2").val((parseInt(left) * 2 + ele_Area._left) + "px");
                $("#eleWidth,#eleWidth2").val(parseInt(width) + "px");
                $("#eleHeight,#eleHeight2").val(parseInt(height) + "px");
                $(_target).css({
                    width: parseInt(width) + "px",
                    height: parseInt(height) + "px",
                    top: 2 * parseInt(top) + "px",
                    left: 2 * parseInt(left) + "px"
                }).attr({
                    "data-w": parseInt(width) + "px",
                    "data-h": parseInt(height) + "px"
                });
                $(_target_img).css({
                    width: parseInt(width) + "px",
                    height: parseInt(height) + "px"
                });
            }

        }
    }

    /**
     * 保存状态
     * @param e
     */
    function saveEventState(e) {
        var _tag_;
        if ($(e.target).hasClass("preview-m-position")) {
            _tag_ = $(e.target);
        } else {
            _tag_ = $(e.target).parents(".preview-m-position");
        }
        _state._left = parseInt(_tag_.offset().left - $(".preview-cont").offset().left);
        _state._top = parseInt(_tag_.offset().top - $(".preview-cont").offset().top);
        _state._width = parseInt(_tag_.width());
        _state._height = parseInt(_tag_.height());
        _state.mouse_sx = parseInt((e.clientX || e.pageX ) + $(window).scrollLeft());
        _state.mouse_sy = parseInt((e.clientY || e.pageY) + $(window).scrollTop());
        _state.evnt = e;
    }


    //预览
    $("#previewHtmlBtn").click(function () {
        var p_html = "";
        var _p_cont = $(".content-mid");
        p_html += '<div id="new_preview" style="z-index: 1000;">' + _p_cont.html() + '</div>';
        $(document.body).append('<div id="previewEle" style="position: absolute; top: 0; left: 0; z-index: 999; width: 100%; height: 100%; background: rgba(0,0,0,0.7)">' + p_html + '<a id="closePreview" style="position: absolute; top: 0; right: 0; z-index: 1000;" href="javascript:;"><img src="img/close.png"></a></div>');

        //预览HTML
        var new_preview = $("#new_preview");

        //检测是否含有跑马灯
        _p_cont.find(".nameText").each(function () {
            if ($(this).hasClass("marquee")) {
                var _i = $(this).parents(".preview-m-zIndex").index();
                var _newEle = new_preview.find(".preview-m-zIndex").eq(_i).find("label.nameText");
                marqueeText(_newEle, "left", parseInt($(this).attr("data-isAnimate")));
            }
        });

        //检测元素是否含有动画
        _p_cont.find(".preview-m-c").each(function () {
            if ($(this).attr("data-animate-name") != null && $(this).attr("data-animate-name") != "noAnimate") {
                var _i = $(this).parents(".preview-m-zIndex").index();
                var _newEle = new_preview.find(".preview-m-zIndex").eq(_i).find(".preview-m-c");
                _sel_animate(_newEle, $(this).attr("data-animate-name"));
            }
        });

        //关闭所有video，audio
        _p_cont.find(".video-mp4").each(function () {
            this.pause();
        });
        if ($("#audioMusic").html() != undefined) {
            $("#audioMusic").get(0).play();
            $("#audioMusic").get(0).currentTime = 0;
        }

        new_preview.find(".app-content-box").css("overflow", "hidden");
        new_preview.find(".preview-m-line").remove();
        new_preview.find(".preview-m-position").removeClass("active").css("cursor", "inherit");
        $(document).off("mousedown", ".preview-m-position", startMove);
        $(document).off("mousedown", ".preview-m-position", startResize);
        $(document).off("mousedown", ".preview-m-position", mouseRight);
    });

    $(document).on("click", "#closePreview", closePreview);
    function closePreview() {
        //开启当前播放的video，audio
        var _p_cont = $(".content-mid");
        _p_cont.find(".preview-m-position.active").find(".video-mp4").each(function () {
            this.play();
        });
        if ($("#audioMusic").html() != undefined) {
            $("#audioMusic").get(0).play();
            $("#audioMusic").get(0).currentTime = 0;
        }

        $("#previewEle").remove();
        $(document).on("mousedown", ".preview-m-position", startMove);
        $(document).on("mousedown", ".preview-m-position", startResize);
        $(document).on("mousedown", ".preview-m-position", mouseRight);
    }

    //保存数据
    $("#saveDataBtn").click(function () {
        var _result_DATA = {
            _textData: [],
            _imgData: [],
            _videoData: [],
            _backgroundImg: [],
            _backgroundAudio: "",
            _animateTimes: 0
        };
        var _parEle = $(".preview-m-zIndex");
        _result_DATA._animateTimes = $("#sumTimes").text();
        _result_DATA._backgroundAudio = $("#audioMusic source").attr("src");
        _result_DATA._backgroundImg.imgSrc = $(".app-jc-cont img") == undefined ? undefined : $(".app-jc-cont img").attr("src");
        _result_DATA._backgroundImg.imgWidth = $(".app-jc-cont img") == undefined ? undefined : $(".app-jc-cont img").css("width");
        _result_DATA._backgroundImg.imgHeight = $(".app-jc-cont img") == undefined ? undefined : $(".app-jc-cont img").css("height");
        _result_DATA._backgroundImg.imgMarTop = $(".app-jc-cont img") == undefined ? undefined : $(".app-jc-cont img").css("margin-top");
        _result_DATA._backgroundImg.imgMarLeft = $(".app-jc-cont img") == undefined ? undefined : $(".app-jc-cont img").css("margin-left");
        _parEle.each(function () {
            if ($(this).hasClass("preview-text")) {
                _result_DATA._textData.push({
                    cont: $(this).find("label.nameText span").text(),
                    size: $(this).find("label.nameText").css("font-size"),
                    color: $(this).find("label.nameText").css("color"),
                    textAlign: $(this).find("label.nameText").css("text-align"),
                    lineHeight: $(this).find("label.nameText").attr("data-lineHeight") == undefined ? "1.5倍" : $(this).find("label.nameText").attr("data-lineHeight"),
                    fontWeight: $(this).find("label.nameText").css("font-weight") == undefined ? 400 : $(this).find("label.nameText").css("font-weight"),
                    textDecoration: $(this).find("label.nameText").css("text-decoration") == undefined ? "none" : $(this).find("label.nameText").css("text-decoration"),
                    fontStyle: $(this).find("label.nameText").css("font-style") == undefined ? "normal" : $(this).find("label.nameText").css("font-style"),
                    opacity: $(this).find("label.nameText").css("opacity") == undefined ? 0 : $(this).find("label.nameText").css("opacity"),
                    rotate: $(this).find(".preview-m-position").attr("data-rotate") == undefined ? "0deg" : parseInt($(this).find(".preview-m-position").attr("data-rotate")) + "deg",
                    width: $(this).find(".preview-m-position").css("width"),
                    height: $(this).find(".preview-m-position").css("height"),
                    top: $(this).find(".preview-m-position").css("top"),
                    left: $(this).find(".preview-m-position").css("left"),
                    zIndex: $(this).css("z-index"),
                    isMarquee: $(this).find("label.nameText").hasClass("marquee") ? true : false,
                    isLoop: $(this).find("label.nameText").attr("data-isLoop") == undefined ? "noLoop" : $(this).find("label.nameText").attr("data-isLoop"),
                    isMarAniTime: $(this).find("label.nameText").attr("data-isAnimate") == undefined ? "10s" : $(this).find("label.nameText").attr("data-isAnimate"),
                    animateName: $(this).find(".preview-m-c").attr("data-animate-name") == undefined ? "none" : $(this).find(".preview-m-c").attr("data-animate-name"),
                    animateSpeed: $(this).find(".preview-m-c").attr("data-speed") == undefined ? "1s" : $(this).find(".preview-m-c").attr("data-speed") + "s",
                    animateDelay: $(this).find(".preview-m-c").attr("data-delay") == undefined ? "0.6s" : $(this).find(".preview-m-c").attr("data-delay") + "s"
                });
            } else if ($(this).hasClass("preview-img-headImg")) {
                _result_DATA._imgData.push({
                    src: $(this).find("img.newImg").attr("src"),
                    radius: $(this).find("img.newImg").css("border-radius"),
                    shadow: $(this).find("img.newImg").attr("data-shadow") == undefined ? "0px" : parseInt($(this).find("img.newImg").attr("data-shadow")) + "px",
                    opacity: $(this).find("label.nameText").css("opacity") == undefined ? 0 : $(this).find("label.nameText").css("opacity"),
                    rotate: $(this).find(".preview-m-position").attr("data-rotate") == undefined ? "0deg" : parseInt($(this).find(".preview-m-position").attr("data-rotate")) + "deg",
                    width: $(this).find(".preview-m-position").css("width"),
                    height: $(this).find(".preview-m-position").css("height"),
                    top: $(this).find(".preview-m-position").css("top"),
                    left: $(this).find(".preview-m-position").css("left"),
                    zIndex: $(this).css("z-index"),
                    animateName: $(this).find(".preview-m-c").attr("data-animate-name") == undefined ? "none" : $(this).find(".preview-m-c").attr("data-animate-name"),
                    animateSpeed: $(this).find(".preview-m-c").attr("data-speed") == undefined ? "1s" : $(this).find(".preview-m-c").attr("data-speed") + "s",
                    animateDelay: $(this).find(".preview-m-c").attr("data-delay") == undefined ? "0.6s" : $(this).find(".preview-m-c").attr("data-delay") + "s"
                });
            }
        });

        console.log(_result_DATA);
    });
});
