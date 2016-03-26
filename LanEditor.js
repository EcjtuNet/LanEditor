var LanEditor = {

    //构造函数，初始化变量，注册按键监听
    init: function(arguments) {
        if("undefined" == typeof(arguments) || "undefined" == typeof(arguments.textelem) ){
            return {
                status: false,
                message: "你至少需要指定LanEditor使用的textelem"
            };
        }
        if("function" != typeof($)) {
            return {
                status: false,
                message: "LanEditor使用$符访问jQuery，而在此页面没有检测到jQuery"
            };
        }
        var arg = arguments;
        //初始化语法高亮
        hljs.initHighlightingOnLoad();
        //初始化markdown渲染器
        this.converter = new Showdown.converter();
        //编辑框id
        this.textelem = arg.textelem;
        this.showelem = "undefined" == typeof(arg.showelem) ? null : arg.showelem;
        //编辑框对象
        this.TextElem = $("#" + this.textelem);
        $("body").append(
            "<div class=\"_Keyword\" id=\"_Keyword\"><ul id=\"_KeywordLi\"></ul></div>" +
            '<div class="_LanEditorBg" id="_LanEditorBg">' +
            '</div>' +
            '<div class="_LEBorder" id="_LEBorder">' +
            '<ul class="_LEMenuList">' +
            '<li class="_MenuListSe">文件列表</li>' +
            '<li class="_MenuListSet">选项设置</li>' +
            '</ul>' +
            '<div class="_LEContent">' +
            '<div id="_LEFilelist">' +
            '<p>' +
            '<input type="text" id="_LENName">' +
            '<span id="_LEFNB">新建</span>' +
            '</p>' +
            '<ul>' +
            '</ul>' +
            '</div>' +
            '<div id="_LESetting">' +
            '<ul>' +
            '<li id="OpenSKL">' +
            '<span class="_LESName">开启关键字提示</span>' +
            '<span class="_LESCon"><span></span></span>' +
            '</li>' +
            '<li id="OpenSKLAni">' +
            '<span class="_LESName">开启提示框动画</span>' +
            '<span class="_LESCon"><span></span></span>' +
            '</li>' +
            '<li id="OpenMenuAni">' +
            '<span class="_LESName">开启菜单动画</span>' +
            '<span class="_LESCon"><span></span></span>' +
            '</li>' +
            '<li id="OpenAutoSymbol">' +
            '<span class="_LESName">开启符号补全</span>' +
            '<span class="_LESCon"><span></span></span>' +
            '</li>' +
            '</ul>' +
            '</div>' +
            '</div>' +
            '</div>'
        );
        //初始化菜单对象
        this.Menu.MenuObj = $("#_LEBorder");
        //初始化背景对象
        this.Background.BackObj = $("#_LanEditorBg");
        this.SKLelem = $("#_Keyword");
        this._timer = {};
        //对editor元素样式进行默认设置
        (function(TextElem) {
            TextElem.css({
                "box-sizing": "border-box",
                "overflow": "auto",
                "font-size": "16px",
                "font-family": "Menlo, Monaco, Consolas, Courier New, monospace",
                "font-weight": 1.3,
                "outline": "none",
                "background-color": "#23241f",
                "color": "#f8f8f2"
            });
        })(this.TextElem);
        //注册监听
        var TextElem = document.getElementById(this.textelem);
        if ("undefined" != typeof TextElem.addEventListener) {
            window.addEventListener("keydown", function(event) {
                var TextElem = LanEditor.TextElem;
                LanEditor.Menu.Toggle.call(LanEditor.Menu, event);
                LanEditor.KeyRewrite(event, TextElem);
                for(var i = 0; i < LanEditor.Fn.FnSet.keydown.length; i++) {
                    LanEditor.Fn.FnSet.keydown[i](event, TextElem);
                }
            }, true);
            TextElem.addEventListener("keyup", function(event) {
                var TextElem = LanEditor.TextElem;
                LanEditor.AutoCompleteSymbol(event, TextElem);
                LanEditor.AutoCompleteKeyword(event, TextElem);
                for(var i = 0; i < LanEditor.Fn.FnSet.keyup.length; i++) {
                    LanEditor.Fn.FnSet.keyup[i](event, TextElem);
                }
                // 自动保存文件
                if(LanEditor.SetPara.PluginsMode == false){
                    LanEditor.File.SaveFile();
                }
                // 渲染md
                LanEditor.DelayTillLast.call(LanEditor, "RenderHTML", LanEditor.RenderHTML, 300);
            }, false);
            document.getElementById("_LEFNB").addEventListener("click", function() {
                LanEditor.File.NewFile($("#_LENName").val());
                LanEditor.File.Refresh($("#_LEFilelist ul"));
            }, false);
            document.getElementById("_LENName").addEventListener("keyup", function(event) {
                if(event.which == 13){
                    LanEditor.File.NewFile($("#_LENName").val());
                    $("#_LENName").val("");
                    LanEditor.File.Refresh($("#_LEFilelist ul"));
                }
            }, false);
        } else if ("undefined" != typeof TextElem.attachEvent) {
            window.attachEvent("keydown", function(event) {
                var TextElem = LanEditor.TextElem;
                LanEditor.Menu.Toggle.call(LanEditor.Menu, event);
                LanEditor.KeyRewrite(event, TextElem);
                for(var i = 0; i < LanEditor.Fn.FnSet.keydown.length; i++) {
                    LanEditor.Fn.FnSet.keydown[i](event, TextElem);
                }
            });
            TextElem.attachEvent("keyup", function(event) {
                var TextElem = LanEditor.TextElem;
                LanEditor.AutoCompleteSymbol(event, TextElem);
                LanEditor.AutoCompleteKeyword(event, TextElem);
                for(var i = 0; i < LanEditor.Fn.FnSet.keyup.length; i++) {
                    LanEditor.Fn.FnSet.keyup[i](event, TextElem);
                }
                if(LanEditor.SetPara.PluginsMode == false){
                    LanEditor.File.SaveFile();
                }
                LanEditor.DelayTillLast.call(LanEditor, "RenderHTML", LanEditor.RenderHTML);
            }, 300);
            document.getElementById("_LEFNB").attachEvent("click", function() {
                LanEditor.File.NewFile($("#_LENName").val());
                LanEditor.File.Refresh($("#_LEFilelist ul"));
            });
            document.getElementById("_LENName").attachEvent("click", function(event) {
                LanEditor.File.NewFile($("#_LENName").val());
                $("#_LENName").val("");
                LanEditor.File.Refresh($("#_LEFilelist ul"));
            });
        } else {
            alert("此浏览器太老，建议用chrome浏览器");
        }
        //初始化提示框对象参数
        this.SKLPara.Set(false, 0, 0);
        TextElem.focus();
        //---------------------------文件列表事件代理
        $("#_LEFilelist ul").delegate("span", "click", function(e) {
            // 打开文件
            if ($(e.target).hasClass("_LEFName")) {
                var filename = $(e.target).text();
                var content = LanEditor.File.GetFileContent(filename);
                var time;
                for (varname in localStorage) {
                    if (varname.split("$")[0].length == 10 && varname.split("$")[1] == filename) {
                        time = varname.split("$")[0];
                        break;
                    }
                }
                LanEditor.TextElem.val(content);
                LanEditor.File.CurOpenFile.name = filename;
                LanEditor.File.CurOpenFile.content = content;
                LanEditor.File.CurOpenFile.time = time;
                LanEditor.RenderHTML();
            // 导出markdown文件
            } else if ($(e.target).hasClass("_LEFM")) {
                var filename = $(e.target).prev().text();
                var content = LanEditor.File.GetFileContent(filename);
                LanEditor.File.ExportMD(content);
            // 导出HTML文件
            } else if ($(e.target).hasClass("_LEFH")) {
                var filename = $(e.target).prev().prev().text();
                var content = LanEditor.File.GetFileContent(filename);
                LanEditor.File.ExportHTML(content);
            // 删除文件
            } else if ($(e.target).hasClass("_LEFD")) {
                var filename = $(e.target).prev().prev().prev().text();
                // 删除的是否是当前正在编辑的文件
                if (filename == LanEditor.File.CurOpenFile.name) {
                    LanEditor.File.CurOpenFile.name = null;
                    LanEditor.File.CurOpenFile.content = null;
                    LanEditor.File.CurOpenFile.time = null;
                }
                LanEditor.File.DeleteFileFromLocal(filename);
                LanEditor.File.Refresh($("#_LEFilelist ul"));
            }
        });
        //----------------------------菜单选项卡事件
        $("._MenuListSe").click(function(e) {
            $(this).css("background-color", "#948266");
            $("._MenuListSet").css("background-color", "#aa9b83");
            $("#_LEFilelist").css("display", "block");
            $("#_LESetting").css("display", "none");
        });
        $("._MenuListSet").click(function(e) {
            $(this).css("background-color", "#948266");
            $("._MenuListSe").css("background-color", "#aa9b83");
            $("#_LEFilelist").css("display", "none");
            $("#_LESetting").css("display", "block");
        });
        //-----------------------------选项设置事件代理
        $("#_LESetting ul").delegate("li", "click", function(e) {
            var IdName = $(this).attr("id");
            switch (IdName) {
                case "OpenSKL":
                    if (LanEditor.SetPara.OpenSKL == 1) {
                        LanEditor.SetPara.OpenSKL = 0;
                        $("._LESCon", $(this)).css("background-color", "#dcdada").children().css("left", "1px");
                    } else {
                        LanEditor.SetPara.OpenSKL = 1;
                        $("._LESCon", $(this)).css("background-color", "#4dc4f5").children().css("left", "21px");
                    }
                    break;
                case "OpenSKLAni":
                    if (LanEditor.SetPara.OpenSKLAni == 1) {
                        LanEditor.SetPara.OpenSKLAni = 0;
                        $("._LESCon", $(this)).css("background-color", "#dcdada").children().css("left", "1px");
                        $("#_Keyword").css("transition", "0s");
                    } else {
                        LanEditor.SetPara.OpenSKLAni = 1;
                        $("._LESCon", $(this)).css("background-color", "#4dc4f5").children().css("left", "21px");
                        $("#_Keyword").css("transition", "0.3s");
                    }
                    break;
                case "OpenMenuAni":
                    if (LanEditor.SetPara.OpenMenuAni == 1) {
                        LanEditor.SetPara.OpenMenuAni = 0;
                        $("._LESCon", $(this)).css("background-color", "#dcdada").children().css("left", "1px");
                        $("#_LEBorder").css("transition", "0s");
                        $("#_LanEditorBg").css("transition", "0s");
                    } else {
                        LanEditor.SetPara.OpenMenuAni = 1;
                        $("._LESCon", $(this)).css("background-color", "#4dc4f5").children().css("left", "21px");
                        $("#_LEBorder").css("transition", "1s");
                        $("#_LanEditorBg").css("transition", "0.8s");
                    }
                    break;
                case "OpenAutoSymbol":
                    if (LanEditor.SetPara.OpenAutoSymbol == 1) {
                        LanEditor.SetPara.OpenAutoSymbol = 0;
                        $("._LESCon", $(this)).css("background-color", "#dcdada").children().css("left", "1px");
                    } else {
                        LanEditor.SetPara.OpenAutoSymbol = 1;
                        $("._LESCon", $(this)).css("background-color", "#4dc4f5").children().css("left", "21px");
                    }
                    break;
            }
            LanEditor.SetPara.Save();
        });
        //加载设置
        this.SetPara.Load();
        this.SetPara.PluginsMode = "undefined" == typeof(arg.PluginsMode) ? false : arg.PluginsMode;
        this.SetPara.OpenSKL = "undefined" == typeof(arg.OpenSKL) ? this.SetPara.OpenSKL : arg.OpenSKL;
        this.SetPara.OpenSKLAni = "undefined" == typeof(arg.OpenSKLAni) ? this.SetPara.OpenSKLAni : arg.OpenSKLAni;
        this.SetPara.OpenAutoSymbol = "undefined" == typeof(arg.OpenAutoSymbol) ? this.SetPara.OpenAutoSymbol : arg.OpenAutoSymbol;
        this.SetPara.OpenMenuAni = "undefined" == typeof(arg.OpenMenuAni) ? this.SetPara.OpenMenuAni : arg.OpenMenuAni;
        this.SetPara.Apply();
        return {
            status: true
        };
    },
    //延迟执行最后一次调用的函数
    DelayTillLast: function(id, fn, wait) {
        if (this._timer[id]) {
            window.clearTimeout(this._timer[id]);
            delete this._timer[id];
        }

        return this._timer[id] = window.setTimeout(function() {
            fn.call(LanEditor);
            delete LanEditor._timer[id];
        }, wait);
    },
    //渲染HTML
    RenderHTML: function() {
        if(this.showelem == null) {
            return false;
        }
        var html = this.converter.makeHtml(this.TextElem.val());
        for(var i = 0; i < this.Fn.FnSet.render.length; i++) {
            html = this.Fn.FnSet.render[i](html) || html;
        }
        $("#" + this.showelem).html(html);
        $('pre code', $("#" + this.showelem)).each(function(i, block) {
            hljs.highlightBlock(block);
        });
        return true;
    },
    //获取渲染后的HTML
    GetRenderHTML: function() {
        var html = this.converter.makeHtml(this.TextElem.val());
        for(var i = 0; i < this.Fn.FnSet.render.length; i++) {
            html = this.Fn.FnSet.render[i](html) || html;
        }
        var VirtualDIV = $("<div></div>");
        VirtualDIV.html(html);
        $("pre code", VirtualDIV).each(function(i, block) {
            hljs.highlightBlock(block);
        });
        html = VirtualDIV.html();
        return html;
    },
    //设置提示框对象参数
    SKLPara: {
        //是否显示
        show: null,
        //候选列表总数
        count: null,
        //当前选中的序号,以0开始
        cs: null,
        //匹配关键字的长度，如果为0，则表示不需要匹配
        SWL: 0,
        //匹配到的结果集
        ResultSet: [],
        Set: function(show, count, cs) {
            this.show = show;
            this.count = count;
            this.cs = cs;
            $("._SKLi" + cs).addClass("_limatch");
        },
        //获取提示框对象参数
        Get: function() {
            return LanEditor.SKLPara;
        },
        SetShow: function(show) {
            this.show = show;
        },
        SetCount: function(count) {
            this.count = count;
        },
        SetCS: function(cs, up) {
            $("._SKLi" + this.cs).removeClass("_limatch");
            this.cs = cs;
            $("._SKLi" + cs).addClass("_limatch");
            var SKLheight = parseInt($("#_Keyword").css("height"));
            var SKLScrollHeight = $("#_Keyword")[0].scrollHeight;
            var SKLScrollTop = $("#_Keyword").scrollTop();
            if (cs == 0) {
                $("#_Keyword").scrollTop(0);
            } else if (cs == this.count - 1) {
                $("#_Keyword").scrollTop(SKLScrollHeight);
            } else if (up == true) {
                if (cs * 18 < SKLScrollTop) {
                    var diff = SKLScrollTop - cs * 18;
                    $("#_Keyword").scrollTop(SKLScrollTop - diff);
                }
            } else if ("undefined" == typeof up) {
                if ((cs + 1) * 18 > SKLScrollTop + SKLheight) {
                    var diff = (cs + 1) * 18 - (SKLScrollTop + SKLheight);
                    $("#_Keyword").scrollTop(SKLScrollTop + diff);
                }
            }

        }
    },
    //关键字自动补全，keyup阶段执行
    AutoCompleteKeyword: function(event, TextElem) {
        if (LanEditor.SetPara.OpenSKL == 0) {
            return;
        }
        var e = event;
        var SKLelem = $("#_Keyword");
        if (e.which == 38 || e.which == 40) {
            return;
        }
        if (e.which!=8 && e.which!=189 &&(e.which < 65 && e.which > 57 || e.which > 90 || e.which < 48) ) {
            SKLelem.css({
                "opacity": 0,
                "z-index": -20
            });
            LanEditor.SKLPara.SetShow(false);
            return;
        }
        //要匹配的单词
        var word = "";
        //查找光标前面的单词
        var i = 1;
        var pchar = TextElem.iGetPosStr(-i).charAt(0);
        while (pchar != "" && pchar != "(" && pchar != ")" && pchar != ";") {
            if (i > TextElem.val().length) {
                break;
            }
            if (pchar >= "a" && pchar <= "z" || pchar >= "A" && pchar <= "Z" || pchar == "_" || pchar == "-") {
                i++;
            } else {
                break;
            }
            pchar = TextElem.iGetPosStr(-i).charAt(0);
        }
        if (i > 1) {
            word = TextElem.iGetPosStr(-(i - 1));
            LanEditor.ShowKeywordList(word);
        } else {
            SKLelem.css({
                "opacity": 0,
                "z-index": -20
            });
            LanEditor.SKLPara.SetShow(false);
        }
    },
    //显示关键字提示列表
    ShowKeywordList: function(word) {
        var TextElem = this.TextElem;
        var SKLelem = this.SKLelem;
        var cursorpos = CursorPos.GetCursorPos(document.getElementById(this.textelem));
        var scrolltop = TextElem.scrollTop();
        var left = cursorpos.left + 2;
        var top = cursorpos.top - scrolltop + 18;
        //查找匹配的单词结果
        var resultset = this.SearchKeyword(word);
        //查找单词为空，不显示提示列表
        if (resultset.length <= 0) {
            SKLelem.css({
                "opacity": 0,
                "z-index": -20
            });
            LanEditor.SKLPara.SetShow(false);
            return;
        }
        //拼接HTML代码
        var KeyCount = 0;
        var html = "";
        for (key in resultset) {
            //过滤键名
            if (!isNaN(key)) {
                continue;
            }
            for (var i = 0; i < resultset[key].length; ++i) {
                html += "<li class=\"_SKLi" + KeyCount + "\">" + resultset[key][i] + "</li>";
                KeyCount++;
            }
        }
        $("#_KeywordLi").html(html);
        LanEditor.SKLPara.Set(true, KeyCount, 0);
        var SKLheight = (KeyCount > 10 ? 180 : KeyCount * 18);
        var SKLwidth = parseInt(SKLelem.css("width"));
        //editor元素距body顶部的高度
        var TextElemTop = CursorPos._offset(document.getElementById(LanEditor.textelem)).top;
        var TextElemLeft = CursorPos._offset(document.getElementById(LanEditor.textelem)).left;
        var TextElemHeight = parseInt(TextElem.css("height"));
        var TextElemWidth = parseInt(TextElem.css("width"));
        // 判断提示框是否超出下边界，是则调整在光标的上边
        if (top + SKLheight > TextElemTop + TextElemHeight) {
            top = top - SKLheight - 18;
        }
        // 判断提示框是否超出右边界，是则调整在光标的左边
        if (left + SKLwidth > TextElemLeft + TextElemWidth) {
            left = left - SKLwidth;
        }
        // console.log("height -> " + height + " SKLheight -> " + SKLheight);
        // 显示提示框
        SKLelem.css({
            "opacity": 1,
            "z-index": 20,
            "left": left,
            "top": top,
            "height": SKLheight
        });
        // console.log(" cursorpos -> "+ cursorpos);
        // console.log(" top -> " + top + " scrolltop -> " + scrolltop + " cursortop -> " + cursorpos.top);
    },
    SearchKeyword: function(word) {
        var flag = false;
        var resultset = new Array();
        // 全局的resultset,并且不含正则替换后的值
        this.SKLPara.ResultSet = new Array();
        this.SKLPara.SWL = word.length;
        var KeywordSet = this.Keyword.Set;
        for (key in KeywordSet) {
            resultset.push(key);
            resultset[key] = new Array();
            for (var i = 0; i < KeywordSet[key].length; ++i) {
                // console.log("in " + Keyword[key][i] + " search -> " + word + " search reg ->" + "/" + word + "/i search flag -> " + Keyword[key][i].search("/" + word + "/i"));
                var reg = new RegExp("(" + word + ")", "gi");
                if (KeywordSet[key][i].search(reg) > -1) {
                    this.SKLPara.ResultSet.push(KeywordSet[key][i]);
                    resultset[key].push(KeywordSet[key][i].replace(reg, "<span class=\"_KeyHL\">$1</span>"));
                    flag = true;
                }
            }
        }
        return flag ? resultset : [];
    },
    //符号自动补全，keyup阶段执行
    AutoCompleteSymbol: function(event, TextElem) {
        if (LanEditor.SetPara.OpenAutoSymbol == 0) {
            return;
        }
        var e = event;
        //按回车缩进和上一行相同的间距
        if (e.which == 13) {
            if (LanEditor.SKLPara.show == true) {
                return;
            }
            // 获取上一行的缩进个数
            var space = TextElem.iGetSpaceNum();
            //如果是成对{}按回车键，则多加4个空格缩进
            var isfunc = false;
            var pre = TextElem.iGetPosStr(-2);
            if (pre == "{\n") {
                space += 4;
                isfunc = true;
            }
            for (var i = 0; i < space; ++i) {
                TextElem.iAddField(" ");
            }
            var pos = TextElem.iGetFieldPos();
            var insertStr = "";
            if (isfunc) {
                TextElem.iAddField("\n");
                for (var i = 0; i < space - 4; ++i) {
                    insertStr += " ";
                }
            }
            TextElem.iAddField(insertStr);
            TextElem.iSelectField(pos);
        } else if (e.shiftKey && e.which == 57) { // ( 左括号自动补全
            if(TextElem.iGetPosStr(-1) == "("){
                TextElem.iAddField(")");
            }else{
                TextElem.iAddField("）");
            }
            TextElem.iSelectField(TextElem.iGetFieldPos() - 1);
        } else if (e.shiftKey && e.which == 48) { // ) 右括号判断是否成对匹配
            var pre = TextElem.iGetPosStr(-2);
            var next = TextElem.iGetPosStr(1);
            if (pre == "()" && next == ")" || pre == "（）" && next == "）") {
                TextElem.iDelField(1);
                TextElem.iSelectField(TextElem.iGetFieldPos() + 1);
            }
        } else if (e.shiftKey && e.which == 219) { // { 左大括号自动补全
            TextElem.iAddField("}");
            TextElem.iSelectField(TextElem.iGetFieldPos() - 1);
        } else if (e.shiftKey && e.which == 221) { // } 右大括号判断是否成对匹配
            var pre = TextElem.iGetPosStr(-2);
            var next = TextElem.iGetPosStr(1);
            if (pre == "{}" && next == "}") {
                TextElem.iDelField(-1);
            }
        } else if (e.which == 219) { // [ 左中括号自动补全
            if (TextElem.iGetPosStr(-1) == "[") {
                TextElem.iAddField("]");
            } else {
                TextElem.iAddField("】");
            }
            TextElem.iSelectField(TextElem.iGetFieldPos() - 1);
        } else if (e.which == 221) { // ] 右中括号判断是否成对匹配
            var pre = TextElem.iGetPosStr(-2);
            var next = TextElem.iGetPosStr(1);
            if ((pre == "[]" || pre == "【】") && (next == "]" || next == "】")) {
                TextElem.iDelField(-1);
            }
        } else if (e.shiftKey && e.which == 188) { // < 左尖括号自动补全
            if (TextElem.iGetPosStr(-1) == "<") {
                TextElem.iAddField(">");
            } else {
                TextElem.iAddField("》");
            }
            TextElem.iSelectField(TextElem.iGetFieldPos() - 1);
        } else if (e.shiftKey && e.which == 190) { // > 右尖括号判断是否成对匹配
            var pre = TextElem.iGetPosStr(-2);
            var next = TextElem.iGetPosStr(1);
            if ((pre == "<>" || pre == "《》") && (next == ">" || next == "》")) {
                TextElem.iDelField(-1);
            }
        } else if (!e.shiftKey && e.which == 222) { // ' 左单引号自动补全
            if (TextElem.iGetPosStr(-1) == "'") {
                TextElem.iAddField("'");
            } else {
                TextElem.iAddField('’');
            }
            TextElem.iSelectField(TextElem.iGetFieldPos() - 1);
        } else if (e.shiftKey && e.which == 222) { // “ 左双引号自动补全
            if (TextElem.iGetPosStr(-1) == '"') {
                TextElem.iAddField('"');
            } else {
                TextElem.iAddField('”');
            }
            TextElem.iSelectField(TextElem.iGetFieldPos() - 1);
        }
    },
    //重写按键功能，在keydown阶段执行
    KeyRewrite: function(event, TextElem) {
        var e = event;
        //阻止Tab事件，换成4个空格
        if (e.which == 9) {
            e.preventDefault();
            TextElem.iAddField("    ");
        //退格键删除多个空格
        } else if (e.which == 8) {
            //只有光标前一个字符是空格的时候才要判断是否删除多个空格
            if (TextElem.iGetPosStr(-1) == " ") {
                e.preventDefault();
                //查找前面有多少个空格
                var i = 1;
                while (TextElem.iGetPosStr(-i).charAt(0) == " " && TextElem.iGetPosStr(-i).charAt(0) != "\n" && TextElem.iGetPosStr(-i).charAt(0) != "\r\n" && TextElem.iGetPosStr(-i).charAt(0) != "") {
                    i++;
                    if (i > TextElem.val().length) {
                        break;
                    }
                }
                if (i - 1 < 4) {
                    TextElem.iDelField(1);
                } else if ((i - 1) % 4 == 0) {
                    for (var i = 0; i < 4; ++i) {
                        TextElem.iDelField(1);
                    }
                } else {
                    var del = (i - 1) % 4;
                    for (var i = 0; i < del; ++i) {
                        TextElem.iDelField(1);
                    }
                }
            }
        //显示提示框时上下键选择列表项
        } else if (e.which == 38) {
            if (LanEditor.SKLPara.show == true) {
                e.preventDefault();
                if (LanEditor.SKLPara.cs == 0) {
                    LanEditor.SKLPara.SetCS(LanEditor.SKLPara.count - 1);
                } else if (LanEditor.SKLPara.cs > 0) {
                    LanEditor.SKLPara.SetCS(LanEditor.SKLPara.cs - 1, true);
                }
            }
        //重写下键
        } else if (e.which == 40) {
            if (LanEditor.SKLPara.show == true) {
                e.preventDefault();
                if (LanEditor.SKLPara.cs == LanEditor.SKLPara.count - 1) {
                    LanEditor.SKLPara.SetCS(0);
                } else if (LanEditor.SKLPara.cs < LanEditor.SKLPara.count - 1) {
                    LanEditor.SKLPara.SetCS(LanEditor.SKLPara.cs + 1);
                }
            }
        //重写enter键
        } else if (e.which == 13) {
            if (LanEditor.SKLPara.show == true) {
                e.preventDefault();
                TextElem.iDelField(LanEditor.SKLPara.SWL);
                TextElem.iAddField(LanEditor.SKLPara.ResultSet[LanEditor.SKLPara.cs]);
            }
        }
        // console.log("keyCode -> " + e.which);
    },
    //------------------------------------------------------文件对象
    File: {
        CurOpenFile: {
            name: null,
            time: null,
            content: null
        },
        // 保存为md文件
        ExportMD: function(md) {
            var fileName = prompt("保存为Markdown文件，请输入文件名", "新建Markdown文件");
            if (fileName == null || fileName == "") {
                return;
            }
            for(var i = 0; i < LanEditor.Fn.FnSet.expertmd.length; i++) {
                md = LanEditor.Fn.FnSet.expertmd[i](md) || md;
            }
            this.ExportFile(fileName + ".md", md);
        },
        // 保存为HTML文件
        ExportHTML: function(md) {
            var fileName = prompt("保存为HTML文件，请输入文件名", "新建HTML文件");
            if (fileName == null || fileName == "") {
                return;
            }
            var HTML_temp_content = '<!DOCTYPE html>' +
                '<html lang="zh-CN">' +
                '<head><meta charset="UTF-8">' +
                '<style type="text/css">' +
                'h1,h2,h3,h4,h5,h6,p,blockquote{margin:0;padding:0}' +
                'body{font-family:"Helvetica Neue",Helvetica,"Hiragino Sans GB",Arial,sans-serif;font-size:13px;line-height:18px;color:#737373;margin:10px 13px 10px 13px}' +
                'a{color:#0069d6}a:hover{color:#0050a3;text-decoration:none}' +
                'a img{border:0}p{margin-bottom:9px}h1,h2,h3,h4,h5,h6{color:#404040;line-height:36px}h1{margin-bottom:18px;font-size:30px}h2{font-size:24px}h3{font-size:18px}' +
                'h4{font-size:16px}h5{font-size:14px}h6{font-size:13px}hr{margin:0 0 19px;border:0;border-bottom:1px solid #ccc}' +
                'blockquote{padding:13px 13px 21px 15px;margin-bottom:18px;font-family:georgia,serif;font-style:italic}' +
                'blockquote:before{content:"C";font-size:40px;margin-left:-10px;font-family:georgia,serif;color:#eee}' +
                'blockquote p{font-size:14px;font-weight:300;line-height:18px;margin-bottom:0;font-style:italic}code,pre{font-family:Monaco,Andale Mono,Courier New,monospace}' +
                'code{background-color:#fee9cc;color:rgba(0,0,0,0.75);padding:1px 3px;font-size:12px;-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px}' +
                'pre{display:block;padding:14px;margin:0 0 18px;line-height:16px;font-size:11px;border:1px solid #d9d9d9;white-space:pre-wrap;word-wrap:break-word}' +
                'pre code{background-color:#fff;color:#737373;font-size:11px;padding:0}@media screen and (min-width:768px){body{width:748px;margin:10px auto}}</style>';
            HTML_temp_content += '<title>' + fileName + '</title>';
            var html = LanEditor.converter.makeHtml(md);
            for(var i = 0; i < LanEditor.Fn.FnSet.render.length; i++) {
                html = LanEditor.Fn.FnSet.render[i](html) || html;
            }
            HTML_temp_content += '</head><body>' + html + '</body></html>';
            this.ExportFile(fileName + ".html", HTML_temp_content);
        },
        //创建文件下载
        ExportFile: function(fileName, content) {
            var aLink = document.createElement('a');
            var blob = new Blob([content]);
            var evt = document.createEvent("HTMLEvents");
            //initEvent 不加后两个参数在FF下会报错, 感谢 Barret Lee 的反馈
            evt.initEvent("click", false, false);
            aLink.download = fileName;
            aLink.href = URL.createObjectURL(blob);
            aLink.dispatchEvent(evt);
        },
        //存储文件到localstorage
        SaveFileToLocal: function(fileName, content) {
            if ("undefined" == localStorage) {
                return "LocalStorage not support";
            }
            if (fileName == null || content == null) {
                return "param wrong";
            }
            var filename = LanEditor.Time.GetTimestamp() + "$" + fileName;
            for (varname in localStorage) {
                if (varname.split("$")[0].length == 10 && varname.split("$")[1] == fileName) {
                    filename = varname.split("$")[0] + "$" + fileName;
                }
            }
            localStorage.setItem(filename, content);
            return "OK";
        },
        // 从localstorage删除文件
        DeleteFileFromLocal: function(fileName) {
            for (varname in localStorage) {
                if (varname.split("$")[0].length == 10 && varname.split("$")[1] == fileName) {
                    localStorage.removeItem(varname);
                    return true;
                }
            }
            return false;
        },
        // 获取文件列表
        GetFileList: function() {
            var filelist = new Array();
            var temp;
            for (varname in localStorage) {
                temp = varname.split("$")[0];
                // 判断当前变量是否是文件名
                if (temp.length == 10 && !isNaN(temp)) {
                    filelist.push({
                        name: varname.split("$")[1],
                        time: temp
                    });
                } else {
                    continue;
                }
            }
            return filelist;
        },
        // 获取文件
        GetFileContent: function(fileName) {
            for (varname in localStorage) {
                if (varname.split("$")[0].length == 10 && varname.split("$")[1] == fileName) {
                    return localStorage.getItem(varname);
                }
            }
            return false;
        },
        // 创建新文件
        NewFile: function(filename) {
            if (filename == "" || filename == null) {
                alert("无效的文件名");
                return false;
            }
            var result = this.SaveFileToLocal(filename, "");
            if (result == "OK") {
                return true;
            } else if (result == "LocalStorage not support") {
                alert("您的浏览器不支持永久存储，请使用chrome以获得最佳体验");
                return false;
            } else if (result == "param wrong") {
                alert("无效的文件名，请尝试更换文件名");
                return false;
            }
        },
        // 保存当前文件
        SaveFile: function() {
            var md = LanEditor.TextElem.val();
            if(md == ""){
                return;
            }
            // 当前文件还没命名，提示输入文件名
            if (LanEditor.File.CurOpenFile.name == null) {
                var flag = confirm("当前文件未保存,是否保存?");
                if (flag) {
                    var filename = prompt("请输入文件名", "新建MD文件");
                    if (filename == null || filename == "") {
                        return;
                    }
                    LanEditor.File.CurOpenFile.name = filename;
                    LanEditor.File.CurOpenFile.time = LanEditor.Time.GetTimestamp();
                    LanEditor.File.CurOpenFile.content = md;
                    LanEditor.File.SaveFileToLocal(filename, md);
                }
                return;
            }
            LanEditor.File.CurOpenFile.content = md;
            LanEditor.File.SaveFileToLocal(LanEditor.File.CurOpenFile.name, md);
        },
        // 显示文件列表
        ShowFileList: function(ShowObj) {
            var filelist = this.GetFileList();
            var html = "";
            for (var i = 0; i < filelist.length; ++i) {
                html += '<li>';
                html += '<span class="_LEFName" title="' + filelist[i].name + '">' + filelist[i].name + '</span>';
                html += '<span class="_LEFM" title="导出Markdown文件到本地">MD</span>';
                html += '<span class="_LEFH" title="导出HTML文件到本地">HTML</span>';
                html += '<span class="_LEFD" title="删除文件">删除</span>';
                html += '<span class="_LEFT" title="创建日期: ' + LanEditor.Time.GetTimeString(filelist[i].time) + '">' + LanEditor.Time.GetTimeString(filelist[i].time).substr(5, 5) + '</span>';
                html += '</li>';
            }
            ShowObj.html(html);
        },
        // 刷新文件列表
        Refresh: function(ShowObj) {
            this.ShowFileList(ShowObj);
        }
    },
    //菜单对象
    Menu: {
        IsShow: false,
        MenuObj: null,
        //切换显示状态,@call(LanEditor.Menu, Event)
        Toggle: function(e) {
            if(LanEditor.SetPara.PluginsMode == true){
                return ;
            }
            //重写ESC键
            if (e.which == 27) {
                e.preventDefault();
                if (this.IsShow) {
                    // console.log("menu -> hide");
                    LanEditor.Background.Show(false);
                    this.Show(false);
                } else {
                    // console.log("menu -> show");
                    LanEditor.Background.Show(true);
                    this.Show(true);
                    LanEditor.File.ShowFileList($("#_LEFilelist ul"));
                }
            }
        },
        //设置是否显示菜单，true显示，false不显示
        Show: function(IsShow) {
            this.MenuObj.queue([]);
            if (IsShow) {
                this.MenuObj.queue(function() {
                    LanEditor.Menu.IsShow = true;
                    $(this).css("display", "block");
                    $(this).delay(1).dequeue();
                });
                this.MenuObj.queue(function() {
                    $(this).css("height", "320px");
                    $(this).dequeue();
                });

            } else {
                if (LanEditor.SetPara.OpenMenuAni) {
                    this.MenuObj.queue(function() {
                        LanEditor.Menu.IsShow = false;
                        $(this).css("height", "30px");
                        $(this).delay(900).dequeue();
                    });
                    this.MenuObj.queue(function() {
                        $(this).css("display", "none");
                        $(this).dequeue();
                    });
                } else {
                    this.MenuObj.queue(function() {
                        LanEditor.Menu.IsShow = false;
                        $(this).css({
                            "height": "30px",
                            "display": "none"
                        });
                        $(this).delay(900).dequeue();
                    });
                }
            }
        }
    },
    //背景遮罩层对象
    Background: {
        IsShow: false,
        BackObj: null,
        //切换显示状态
        Toggle: function() {
            this.BackObj.queue([]);
            if (this.IsShow) {
                this.BackObj.queue(function() {
                    LanEditor.Background.IsShow = false;
                    $(this).css("opacity", 0);
                    $(this).delay(800).dequeue();
                });
                this.BackObj.queue(function() {
                    $(this).css("display", "none");
                    $(this).dequeue();
                });
            } else {
                this.BackObj.queue(function() {
                    LanEditor.Background.IsShow = true;
                    $(this).css("display", "block");
                    $(this).delay(1).dequeue();
                });
                this.BackObj.queue(function() {
                    $(this).css("opacity", 0.8);
                    $(this).dequeue();
                });
            }
        },
        //是否显示背景遮罩层 false不显示，true显示
        Show: function(IsShow) {
            if (IsShow) {
                this.IsShow = false;
            } else {
                this.IsShow = true;
            }
            this.Toggle();
        }
    },
    //时间对象
    Time: {
        GetTimestamp: function() {
            return Math.round(new Date().getTime() / 1000);
        },
        GetTimeString: function(timestamp) {
            var timestamp = new Date(timestamp * 1000);
            return timestamp.toLocaleString();
        }
    },
    //设置系统参数
    SetPara: {
        //提示框
        OpenSKL: null,
        //提示框动画
        OpenSKLAni: null,
        //菜单动画
        OpenMenuAni: null,
        //符号自动匹配
        OpenAutoSymbol: null,
        //插件模式，只能在初始化时由参数指定
        PluginsMode: false,
        //加载设置
        Load: function() {
            this.OpenSKL = parseInt(localStorage.OpenSKL || 1);
            this.OpenSKLAni = parseInt(localStorage.OpenSKLAni || 1);
            this.OpenMenuAni = parseInt(localStorage.OpenMenuAni || 1);
            this.OpenAutoSymbol = parseInt(localStorage.OpenAutoSymbol || 1);
        },
        //保存设置
        Save: function() {
            localStorage.OpenSKL = this.OpenSKL;
            localStorage.OpenSKLAni = this.OpenSKLAni;
            localStorage.OpenMenuAni = this.OpenMenuAni;
            localStorage.OpenAutoSymbol = this.OpenAutoSymbol;
        },
        //立马应用设置
        Apply: function() {
            $("#OpenSKL ._LESCon", $("#_LESetting")).css(function(para) {
                if (para == 1) {
                    $("#OpenSKL ._LESCon", $("#_LESetting")).children().css("left", "21px");
                    return {
                        "background-color": "#4dc4f5"
                    };
                }
                return {
                    "background-color": "#dcdada"
                };
            }(this.OpenSKL));
            $("#OpenSKLAni ._LESCon", $("#_LESetting")).css(function(para) {
                if (para == 1) {
                    $("#OpenSKLAni ._LESCon", $("#_LESetting")).children().css("left", "21px");
                    return {
                        "background-color": "#4dc4f5"
                    };
                }
                return {
                    "background-color": "#dcdada"
                };
            }(this.OpenSKLAni));
            $("#OpenMenuAni ._LESCon", $("#_LESetting")).css(function(para) {
                if (para == 1) {
                    $("#OpenMenuAni ._LESCon", $("#_LESetting")).children().css("left", "21px");
                    return {
                        "background-color": "#4dc4f5"
                    };
                }
                $("#_LEBorder").css("transition", "0s");
                return {
                    "background-color": "#dcdada"
                };
            }(this.OpenMenuAni));
            $("#OpenAutoSymbol ._LESCon", $("#_LESetting")).css(function(para) {
                if (para == 1) {
                    $("#OpenAutoSymbol ._LESCon", $("#_LESetting")).children().css("left", "21px");
                    return {
                        "background-color": "#4dc4f5"
                    };
                }
                return {
                    "background-color": "#dcdada"
                };
            }(this.OpenAutoSymbol));
        }
    },
    //扩展函数功能
    Fn: {
        FnSet: {
            keydown: [],
            keyup: [],
            render: [],
            expertmd: []
        },
        register: function(type, fn){
            for(FnName in fn) {
                if(type == "keydown") {
                    this.FnSet.keydown.push(fn[FnName]);
                }else if(type == "keyup") {
                    this.FnSet.keyup.push(fn[FnName]);
                }else if(type == "render") {
                    this.FnSet.render.push(fn[FnName]);
                }else if(type == "expertmd") {
                    this.FnSet.expertmd.push(fn[FnName]);
                }else{
                    console.log("function "+FnName+"() not extend");
                }
            }
        }
    },
    //关键词提示信息
    Keyword: {
        //关键字集合
        Set: {

        },
        //关键字扩展
        extend: function(keyword) {
            for (KeyName in keyword) {
                if("undefined" == typeof(this.Set[KeyName])) {
                    this.Set[KeyName] = new Array();
                }
                this.Set[KeyName] = this.Set[KeyName].concat( keyword[KeyName] );
            }
        }
    }
};

/* ----------------------------获取光标在文本框的位置-----------------------------------
 *
 * 获取输入光标在页面中的坐标 
 * 此代码段可以单独使用
 * 也可在引入LanEditor的页面全局使用
 * 使用方法 CursorPos.GetCursorPos(HTMLElement)
 * @param {HTMLElement} 输入框元素 
 * @return {Object} 返回left和top,bottom 
 *
 * ------------------------------------------------------------------------------------*/

var CursorPos = {
    GetCursorPos: function(elem) {
        if (document.selection) { //IE Support 
            elem.focus();
            var Sel = document.selection.createRange();
            return {
                left: Sel.boundingLeft,
                top: Sel.boundingTop,
                bottom: Sel.boundingTop + Sel.boundingHeight
            };
        } else {
            var that = this;
            var cloneDiv = '{$clone_div}',
                cloneLeft = '{$cloneLeft}',
                cloneFocus = '{$cloneFocus}',
                cloneRight = '{$cloneRight}';
            var none = '<span style="white-space:pre-wrap;"> </span>';
            var div = elem[cloneDiv] || document.createElement('div'),
                focus = elem[cloneFocus] || document.createElement('span');
            var text = elem[cloneLeft] || document.createElement('span');
            var offset = that._offset(elem),
                index = this._getFocus(elem),
                focusOffset = {
                    left: 0,
                    top: 0
                };
            if (!elem[cloneDiv]) {
                elem[cloneDiv] = div, elem[cloneFocus] = focus;
                elem[cloneLeft] = text;
                div.appendChild(text);
                div.appendChild(focus);
                document.body.appendChild(div);
                focus.innerHTML = '|';
                focus.style.cssText = 'display:inline-block;width:0px;overflow:hidden;z-index:-100;word-wrap:break-word;word-break:break-all;';
                div.className = this._cloneStyle(elem);
                div.style.cssText = 'visibility:hidden;display:inline-block;position:absolute;z-index:-100;word-wrap:break-word;word-break:break-all;overflow:hidden;';
            };
            div.style.left = this._offset(elem).left + "px";
            div.style.top = this._offset(elem).top + "px";
            var strTmp = elem.value.substring(0, index).replace(/</g, '<').replace(/>/g, '>').replace(/\n/g, '<br/>').replace(/\s/g, none);
            text.innerHTML = strTmp;
            focus.style.display = 'inline-block';
            try {
                focusOffset = this._offset(focus);
            } catch (e) {};
            focus.style.display = 'none';
            return {
                left: focusOffset.left,
                top: focusOffset.top,
                bottom: focusOffset.bottom
            };
        }
    },
    // 克隆元素样式并返回类 
    _cloneStyle: function(elem, cache) {
        if (!cache && elem['${cloneName}']) return elem['${cloneName}'];
        var className, name, rstyle = /^(number|string)$/;
        var rname = /^(content|outline|outlineWidth)$/; //Opera: content; IE8:outline && outlineWidth 
        var cssText = [],
            sStyle = elem.style;
        for (name in sStyle) {
            if (!rname.test(name)) {
                val = this._getStyle(elem, name);
                if (val !== '' && rstyle.test(typeof val)) { // Firefox 4 
                    name = name.replace(/([A-Z])/g, "-$1").toLowerCase();
                    cssText.push(name);
                    cssText.push(':');
                    cssText.push(val);
                    cssText.push(';');
                };
            };
        };
        cssText = cssText.join('');
        elem['${cloneName}'] = className = 'clone' + (new Date).getTime();
        this._addHeadStyle('.' + className + '{' + cssText + '}');
        return className;
    },
    // 向页头插入样式 
    _addHeadStyle: function(content) {
        var style = this._style[document];
        if (!style) {
            style = this._style[document] = document.createElement('style');
            document.getElementsByTagName('head')[0].appendChild(style);
        };
        style.styleSheet && (style.styleSheet.cssText += content) || style.appendChild(document.createTextNode(content));
    },
    _style: {},
    // 获取最终样式 
    _getStyle: 'getComputedStyle' in window ? function(elem, name) {
        return getComputedStyle(elem, null)[name];
    } : function(elem, name) {
        return elem.currentStyle[name];
    },
    // 获取光标在文本框的位置 
    _getFocus: function(elem) {
        var index = 0;
        if (document.selection) { // IE Support 
            elem.focus();
            var Sel = document.selection.createRange();
            if (elem.nodeName === 'TEXTAREA') { //textarea 
                var Sel2 = Sel.duplicate();
                Sel2.moveToElementText(elem);
                var index = -1;
                while (Sel2.inRange(Sel)) {
                    Sel2.moveStart('character');
                    index++;
                };
            } else if (elem.nodeName === 'INPUT') { // input 
                Sel.moveStart('character', -elem.value.length);
                index = Sel.text.length;
            }
        } else if (elem.selectionStart || elem.selectionStart == '0') { // Firefox support 
            index = elem.selectionStart;
        }
        return (index);
    },
    // 获取元素在页面中位置 
    _offset: function(elem) {
        var box = elem.getBoundingClientRect(),
            doc = elem.ownerDocument,
            body = doc.body,
            docElem = doc.documentElement;
        var clientTop = docElem.clientTop || body.clientTop || 0,
            clientLeft = docElem.clientLeft || body.clientLeft || 0;
        var top = box.top + (self.pageYOffset || docElem.scrollTop) - clientTop,
            left = box.left + (self.pageXOffset || docElem.scrollLeft) - clientLeft;
        return {
            left: left,
            top: top,
            right: left + box.width,
            bottom: top + box.height
        };
    }
};

/* -----------------------------扩展jquery函数---------------------------------
 *
 * 文本域光标操作（设置光标，选，添，删，取等）
 * 此代码段可单独使用，也可以在引入了LanEditor的页面全局使用
 * 快速开始
 * 1. 引入jquery
 * 2. 把下面的代码单独保存为一个.js文件，在需要的地方引入此文件
 * 3. $(element).iGetFieldPos();//获取光标位置
 *
 * --------------------------------------------------------------------------*/
(function($) {

    $.fn.extend({
        /*
         * 获取光标所在位置
         */
        iGetFieldPos: function() {
            var field = this.get(0);
            if (document.selection) {
                //IE
                $(this).focus();
                var sel = document.selection;
                var range = sel.createRange();
                var dupRange = range.duplicate();
                dupRange.moveToElementText(field);
                dupRange.setEndPoint('EndToEnd', range);
                field.selectionStart = dupRange.text.length - range.text.length;
                field.selectionEnd = field.selectionStart + range.text.length;
            }
            return field.selectionStart;
        },
        /*
         * 选中指定位置内字符 || 设置光标位置
         * --- 从start起选中(含第start个)，到第end结束（不含第end个）
         * --- 若不输入end值，即为设置光标的位置（第start字符后）
         */
        iSelectField: function(start, end) {
            var field = this.get(0);
            //end未定义，则为设置光标位置
            if (arguments[1] == undefined) {
                end = start;
            }
            if (document.selection) {
                //IE
                var range = field.createTextRange();
                range.moveEnd('character', -$(this).val().length);
                range.moveEnd('character', end);
                range.moveStart('character', start);
                range.select();
            } else {
                //非IE
                field.setSelectionRange(start, end);
                $(this).focus();
            }
        },
        /*
         * 选中指定字符串
         */
        iSelectStr: function(str) {
            var field = this.get(0);
            var i = $(this).val().indexOf(str);
            i != -1 ? $(this).iSelectField(i, i + str.length) : false;
        },
        /*
         * 在光标之后插入字符串
         */
        iAddField: function(str) {
            var field = this.get(0);
            var v = $(this).val();
            var len = $(this).val().length;
            if (document.selection) {
                //IE
                $(this).focus()
                document.selection.createRange().text = str;
            } else {
                //非IE
                var selPos = field.selectionStart;
                $(this).val($(this).val().slice(0, field.selectionStart) + str + $(this).val().slice(field.selectionStart, len));
                this.iSelectField(selPos + str.length);
            };
        },
        /*
         * 删除光标前面(+)或者后面(-)的n个字符
         */
        iDelField: function(n) {
            var field = this.get(0);
            var pos = $(this).iGetFieldPos();
            var v = $(this).val();
            //大于0则删除后面，小于0则删除前面
            $(this).val(n > 0 ? v.slice(0, pos - n) + v.slice(pos) : v.slice(0, pos) + v.slice(pos - n));
            $(this).iSelectField(pos - (n < 0 ? 0 : n));
        },
        /*
         * 获取光标前面 || 后面指定个数字符
         * n为负数则获取前面n个字符，正数获取后面n个字符
         */
        iGetPosStr: function(n) {
            var field = this.get(0);
            var pos = $(this).iGetFieldPos();
            var v = $(this).val();
            return (n > 0 ? v.slice(pos, pos + n) : v.slice(pos + n, pos));
        },
        /*
         * 获取前一行的空格缩进个数或是本行前面的空格缩进个数
         * 如果光标前一个字符不是换行\n || \r\n ，则获取本行前面的缩进，否则获取上一行
         */
        iGetSpaceNum: function() {
            var TextElem = $(this);
            var space = 0;
            var i = 1;
            // 如果光标前一个字符是换行，则跳过本行的换行符，查找上一行
            if (TextElem.iGetPosStr(-1) == "\n" || TextElem.iGetPosStr(-1) == "\r\n") {
                i = 2;
            }
            //计算上一行前面的空格缩进个数
            while (TextElem.iGetPosStr(-i).charAt(0) != "\n" && TextElem.iGetPosStr(-i).charAt(0) != "\r\n" && TextElem.iGetPosStr(-i).charAt(0) != "") {
                if (TextElem.iGetPosStr(-i).charAt(0) == " ") {
                    space++;
                } else if (TextElem.iGetPosStr(-i).charAt(0) == "\t") {
                    space += 4;
                } else {
                    space = 0;
                }
                ++i;
                if (i > TextElem.val().length) {
                    break;
                }
            }
            return space;
        }
    });
})(jQuery);

/* showdown source file 06-01-2015 */
var Showdown={extensions:{}},forEach=Showdown.forEach=function(a,b){if("function"==typeof a.forEach)a.forEach(b);else{var c,d=a.length;for(c=0;d>c;c++)b(a[c],c,a)}},stdExtName=function(a){return a.replace(/[_-]||\s/g,"").toLowerCase()};Showdown.converter=function(a){var b,c,d,e=0,f=[],g=[];if("undefined"!=typeof module&&"undefined"!=typeof exports&&"undefined"!=typeof require){var h=require("fs");if(h){var i=h.readdirSync((__dirname||".")+"/extensions").filter(function(a){return~a.indexOf(".js")}).map(function(a){return a.replace(/\.js$/,"")});Showdown.forEach(i,function(a){var b=stdExtName(a);Showdown.extensions[b]=require("./extensions/"+a)})}}if(this.makeHtml=function(a){return b={},c={},d=[],a=a.replace(/~/g,"~T"),a=a.replace(/\$/g,"~D"),a=a.replace(/\r\n/g,"\n"),a=a.replace(/\r/g,"\n"),a="\n\n"+a+"\n\n",a=M(a),a=a.replace(/^[ \t]+$/gm,""),Showdown.forEach(f,function(b){a=l(b,a)}),a=z(a),a=n(a),a=m(a),a=p(a),a=K(a),a=a.replace(/~D/g,"$$"),a=a.replace(/~T/g,"~"),Showdown.forEach(g,function(b){a=l(b,a)}),a},a&&a.extensions){var j=this;Showdown.forEach(a.extensions,function(a){if("string"==typeof a&&(a=Showdown.extensions[stdExtName(a)]),"function"!=typeof a)throw"Extension '"+a+"' could not be loaded.  It was either not found or is not a valid extension.";Showdown.forEach(a(j),function(a){a.type?"language"===a.type||"lang"===a.type?f.push(a):("output"===a.type||"html"===a.type)&&g.push(a):g.push(a)})})}var k,l=function(a,b){if(a.regex){var c=new RegExp(a.regex,"g");return b.replace(c,a.replace)}return a.filter?a.filter(b):void 0},m=function(a){return a+="~0",a=a.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+|(?=~0))/gm,function(a,d,e,f,g){return d=d.toLowerCase(),b[d]=G(e),f?f+g:(g&&(c[d]=g.replace(/"/g,"&quot;")),"")}),a=a.replace(/~0/,"")},n=function(a){a=a.replace(/\n/g,"\n\n");return a=a.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm,o),a=a.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|style|section|header|footer|nav|article|aside)\b[^\r]*?<\/\2>[ \t]*(?=\n+)\n)/gm,o),a=a.replace(/(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,o),a=a.replace(/(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g,o),a=a.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g,o),a=a.replace(/\n\n/g,"\n")},o=function(a,b){var c=b;return c=c.replace(/\n\n/g,"\n"),c=c.replace(/^\n/,""),c=c.replace(/\n+$/g,""),c="\n\n~K"+(d.push(c)-1)+"K\n\n"},p=function(a){a=w(a);var b=A("<hr />");return a=a.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm,b),a=a.replace(/^[ ]{0,2}([ ]?\-[ ]?){3,}[ \t]*$/gm,b),a=a.replace(/^[ ]{0,2}([ ]?\_[ ]?){3,}[ \t]*$/gm,b),a=x(a),a=y(a),a=E(a),a=n(a),a=F(a)},q=function(a){return a=B(a),a=r(a),a=H(a),a=u(a),a=s(a),a=I(a),a=G(a),a=D(a),a=a.replace(/  +\n/g," <br />\n")},r=function(a){var b=/(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--.*?--\s*)+>)/gi;return a=a.replace(b,function(a){var b=a.replace(/(.)<\/?code>(?=.)/g,"$1`");return b=N(b,"\\`*_")})},s=function(a){return a=a.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,t),a=a.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?(.*?(?:\(.*?\).*?)?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,t),a=a.replace(/(\[([^\[\]]+)\])()()()()()/g,t)},t=function(a,d,e,f,g,h,i,j){void 0==j&&(j="");var k=d,l=e,m=f.toLowerCase(),n=g,o=j;if(""==n)if(""==m&&(m=l.toLowerCase().replace(/ ?\n/g," ")),n="#"+m,void 0!=b[m])n=b[m],void 0!=c[m]&&(o=c[m]);else{if(!(k.search(/\(\s*\)$/m)>-1))return k;n=""}n=N(n,"*_");var p='<a href="'+n+'"';return""!=o&&(o=o.replace(/"/g,"&quot;"),o=N(o,"*_"),p+=' title="'+o+'"'),p+=">"+l+"</a>"},u=function(a){return a=a.replace(/(!\[(.*?)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,v),a=a.replace(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,v)},v=function(a,d,e,f,g,h,i,j){var k=d,l=e,m=f.toLowerCase(),n=g,o=j;if(o||(o=""),""==n){if(""==m&&(m=l.toLowerCase().replace(/ ?\n/g," ")),n="#"+m,void 0==b[m])return k;n=b[m],void 0!=c[m]&&(o=c[m])}l=l.replace(/"/g,"&quot;"),n=N(n,"*_");var p='<img src="'+n+'" alt="'+l+'"';return o=o.replace(/"/g,"&quot;"),o=N(o,"*_"),p+=' title="'+o+'"',p+=" />"},w=function(a){function b(a){return a.replace(/[^\w]/g,"").toLowerCase()}return a=a.replace(/^(.+)[ \t]*\n=+[ \t]*\n+/gm,function(a,c){return A('<h1 id="'+b(c)+'">'+q(c)+"</h1>")}),a=a.replace(/^(.+)[ \t]*\n-+[ \t]*\n+/gm,function(a,c){return A('<h2 id="'+b(c)+'">'+q(c)+"</h2>")}),a=a.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm,function(a,c,d){var e=c.length;return A("<h"+e+' id="'+b(d)+'">'+q(d)+"</h"+e+">")})},x=function(a){a+="~0";var b=/^(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;return e?a=a.replace(b,function(a,b,c){var d=b,e=c.search(/[*+-]/g)>-1?"ul":"ol";d=d.replace(/\n{2,}/g,"\n\n\n");var f=k(d);return f=f.replace(/\s+$/,""),f="<"+e+">"+f+"</"+e+">\n"}):(b=/(\n\n|^\n?)(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/g,a=a.replace(b,function(a,b,c,d){var e=b,f=c,g=d.search(/[*+-]/g)>-1?"ul":"ol",f=f.replace(/\n{2,}/g,"\n\n\n"),h=k(f);return h=e+"<"+g+">\n"+h+"</"+g+">\n"})),a=a.replace(/~0/,"")};k=function(a){return e++,a=a.replace(/\n{2,}$/,"\n"),a+="~0",a=a.replace(/(\n)?(^[ \t]*)([*+-]|\d+[.])[ \t]+([^\r]+?(\n{1,2}))(?=\n*(~0|\2([*+-]|\d+[.])[ \t]+))/gm,function(a,b,c,d,e){var f=e,g=b;return g||f.search(/\n{2,}/)>-1?f=p(L(f)):(f=x(L(f)),f=f.replace(/\n$/,""),f=q(f)),"<li>"+f+"</li>\n"}),a=a.replace(/~0/g,""),e--,a};var y=function(a){return a+="~0",a=a.replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/g,function(a,b,c){var d=b,e=c;return d=C(L(d)),d=M(d),d=d.replace(/^\n+/g,""),d=d.replace(/\n+$/g,""),d="<pre><code>"+d+"\n</code></pre>",A(d)+e}),a=a.replace(/~0/,"")},z=function(a){return a+="~0",a=a.replace(/(?:^|\n)```(.*)\n([\s\S]*?)\n```/g,function(a,b,c){var d=b,e=c;return e=C(e),e=M(e),e=e.replace(/^\n+/g,""),e=e.replace(/\n+$/g,""),e="<pre><code"+(d?' class="'+d+'"':"")+">"+e+"\n</code></pre>",A(e)}),a=a.replace(/~0/,"")},A=function(a){return a=a.replace(/(^\n+|\n+$)/g,""),"\n\n~K"+(d.push(a)-1)+"K\n\n"},B=function(a){return a=a.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,function(a,b,c,d){var e=d;return e=e.replace(/^([ \t]*)/g,""),e=e.replace(/[ \t]*$/g,""),e=C(e),b+"<code>"+e+"</code>"})},C=function(a){return a=a.replace(/&/g,"&amp;"),a=a.replace(/</g,"&lt;"),a=a.replace(/>/g,"&gt;"),a=N(a,"*_{}[]\\",!1)},D=function(a){return a=a.replace(/(\*\*|__)(?=\S)([^\r]*?\S[*_]*)\1/g,"<strong>$2</strong>"),a=a.replace(/(\*|_)(?=\S)([^\r]*?\S)\1/g,"<em>$2</em>")},E=function(a){return a=a.replace(/((^[ \t]*>[ \t]?.+\n(.+\n)*\n*)+)/gm,function(a,b){var c=b;return c=c.replace(/^[ \t]*>[ \t]?/gm,"~0"),c=c.replace(/~0/g,""),c=c.replace(/^[ \t]+$/gm,""),c=p(c),c=c.replace(/(^|\n)/g,"$1  "),c=c.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm,function(a,b){var c=b;return c=c.replace(/^  /gm,"~0"),c=c.replace(/~0/g,"")}),A("<blockquote>\n"+c+"\n</blockquote>")})},F=function(a){a=a.replace(/^\n+/g,""),a=a.replace(/\n+$/g,"");for(var b=a.split(/\n{2,}/g),c=[],e=b.length,f=0;e>f;f++){var g=b[f];g.search(/~K(\d+)K/g)>=0?c.push(g):g.search(/\S/)>=0&&(g=q(g),g=g.replace(/^([ \t]*)/g,"<p>"),g+="</p>",c.push(g))}e=c.length;for(var f=0;e>f;f++)for(;c[f].search(/~K(\d+)K/)>=0;){var h=d[RegExp.$1];h=h.replace(/\$/g,"$$$$"),c[f]=c[f].replace(/~K\d+K/,h)}return c.join("\n\n")},G=function(a){return a=a.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g,"&amp;"),a=a.replace(/<(?![a-z\/?\$!])/gi,"&lt;")},H=function(a){return a=a.replace(/\\(\\)/g,O),a=a.replace(/\\([`*_{}\[\]()>#+-.!])/g,O)},I=function(a){return a=a.replace(/<((https?|ftp|dict):[^'">\s]+)>/gi,'<a href="$1">$1</a>'),a=a.replace(/<(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi,function(a,b){return J(K(b))})},J=function(a){var b=[function(a){return"&#"+a.charCodeAt(0)+";"},function(a){return"&#x"+a.charCodeAt(0).toString(16)+";"},function(a){return a}];return a="mailto:"+a,a=a.replace(/./g,function(a){if("@"==a)a=b[Math.floor(2*Math.random())](a);else if(":"!=a){var c=Math.random();a=c>.9?b[2](a):c>.45?b[1](a):b[0](a)}return a}),a='<a href="'+a+'">'+a+"</a>",a=a.replace(/">.+:/g,'">')},K=function(a){return a=a.replace(/~E(\d+)E/g,function(a,b){var c=parseInt(b);return String.fromCharCode(c)})},L=function(a){return a=a.replace(/^(\t|[ ]{1,4})/gm,"~0"),a=a.replace(/~0/g,"")},M=function(a){return a=a.replace(/\t(?=\t)/g,"    "),a=a.replace(/\t/g,"~A~B"),a=a.replace(/~B(.+?)~A/g,function(a,b){for(var c=b,d=4-c.length%4,e=0;d>e;e++)c+=" ";return c}),a=a.replace(/~A/g,"    "),a=a.replace(/~B/g,"")},N=function(a,b,c){var d="(["+b.replace(/([\[\]\\])/g,"\\$1")+"])";c&&(d="\\\\"+d);var e=new RegExp(d,"g");return a=a.replace(e,O)},O=function(a,b){var c=b.charCodeAt(0);return"~E"+c+"E"}},"undefined"!=typeof module&&(module.exports=Showdown),"function"==typeof define&&define.amd&&define("showdown",function(){return Showdown}),"undefined"!=typeof angular&&"undefined"!=typeof Showdown&&!function(a,b){function c(){function a(){var a=new b.converter(c);this.makeHtml=function(b){return a.makeHtml(b)},this.stripHtml=function(a){return String(a).replace(/<[^>]+>/gm,"")}}var c={extensions:[],stripHtml:!0};this.setOption=function(a,b){return c.key=b,this},this.getOption=function(a){return c.hasOwnProperty(a)?c.key:null},this.loadExtension=function(a){return c.extensions.push(a),this},this.$get=function(){return new a}}function d(a){var b=function(b,c){b.$watch("model",function(b){var d;d="string"==typeof b?a.makeHtml(b):typeof b,c.html(d)})};return{restrict:"A",link:b,scope:{model:"=sdModelToHtml"}}}function e(){return function(a){return String(a).replace(/<[^>]+>/gm,"")}}a.provider("$Showdown",c).directive("sdModelToHtml",["$Showdown",d]).filter("sdStripHtml",e)}(angular.module("Showdown",[]),Showdown);

/*highlight.js source file*/
!function(e){"undefined"!=typeof exports?e(exports):(window.hljs=e({}),"function"==typeof define&&define.amd&&define("hljs",[],function(){return window.hljs}))}(function(e){function n(e){return e.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;")}function t(e){return e.nodeName.toLowerCase()}function r(e,n){var t=e&&e.exec(n);return t&&0==t.index}function a(e){return/no-?highlight|plain|text/.test(e)}function i(e){var n,t,r,i=e.className+" ";if(i+=e.parentNode?e.parentNode.className:"",t=/\blang(?:uage)?-([\w-]+)\b/.exec(i))return E(t[1])?t[1]:"no-highlight";for(i=i.split(/\s+/),n=0,r=i.length;r>n;n++)if(E(i[n])||a(i[n]))return i[n]}function o(e,n){var t,r={};for(t in e)r[t]=e[t];if(n)for(t in n)r[t]=n[t];return r}function u(e){var n=[];return function r(e,a){for(var i=e.firstChild;i;i=i.nextSibling)3==i.nodeType?a+=i.nodeValue.length:1==i.nodeType&&(n.push({event:"start",offset:a,node:i}),a=r(i,a),t(i).match(/br|hr|img|input/)||n.push({event:"stop",offset:a,node:i}));return a}(e,0),n}function c(e,r,a){function i(){return e.length&&r.length?e[0].offset!=r[0].offset?e[0].offset<r[0].offset?e:r:"start"==r[0].event?e:r:e.length?e:r}function o(e){function r(e){return" "+e.nodeName+'="'+n(e.value)+'"'}f+="<"+t(e)+Array.prototype.map.call(e.attributes,r).join("")+">"}function u(e){f+="</"+t(e)+">"}function c(e){("start"==e.event?o:u)(e.node)}for(var s=0,f="",l=[];e.length||r.length;){var g=i();if(f+=n(a.substr(s,g[0].offset-s)),s=g[0].offset,g==e){l.reverse().forEach(u);do c(g.splice(0,1)[0]),g=i();while(g==e&&g.length&&g[0].offset==s);l.reverse().forEach(o)}else"start"==g[0].event?l.push(g[0].node):l.pop(),c(g.splice(0,1)[0])}return f+n(a.substr(s))}function s(e){function n(e){return e&&e.source||e}function t(t,r){return new RegExp(n(t),"m"+(e.cI?"i":"")+(r?"g":""))}function r(a,i){if(!a.compiled){if(a.compiled=!0,a.k=a.k||a.bK,a.k){var u={},c=function(n,t){e.cI&&(t=t.toLowerCase()),t.split(" ").forEach(function(e){var t=e.split("|");u[t[0]]=[n,t[1]?Number(t[1]):1]})};"string"==typeof a.k?c("keyword",a.k):Object.keys(a.k).forEach(function(e){c(e,a.k[e])}),a.k=u}a.lR=t(a.l||/\b\w+\b/,!0),i&&(a.bK&&(a.b="\\b("+a.bK.split(" ").join("|")+")\\b"),a.b||(a.b=/\B|\b/),a.bR=t(a.b),a.e||a.eW||(a.e=/\B|\b/),a.e&&(a.eR=t(a.e)),a.tE=n(a.e)||"",a.eW&&i.tE&&(a.tE+=(a.e?"|":"")+i.tE)),a.i&&(a.iR=t(a.i)),void 0===a.r&&(a.r=1),a.c||(a.c=[]);var s=[];a.c.forEach(function(e){e.v?e.v.forEach(function(n){s.push(o(e,n))}):s.push("self"==e?a:e)}),a.c=s,a.c.forEach(function(e){r(e,a)}),a.starts&&r(a.starts,i);var f=a.c.map(function(e){return e.bK?"\\.?("+e.b+")\\.?":e.b}).concat([a.tE,a.i]).map(n).filter(Boolean);a.t=f.length?t(f.join("|"),!0):{exec:function(){return null}}}}r(e)}function f(e,t,a,i){function o(e,n){for(var t=0;t<n.c.length;t++)if(r(n.c[t].bR,e))return n.c[t]}function u(e,n){if(r(e.eR,n)){for(;e.endsParent&&e.parent;)e=e.parent;return e}return e.eW?u(e.parent,n):void 0}function c(e,n){return!a&&r(n.iR,e)}function g(e,n){var t=N.cI?n[0].toLowerCase():n[0];return e.k.hasOwnProperty(t)&&e.k[t]}function h(e,n,t,r){var a=r?"":w.classPrefix,i='<span class="'+a,o=t?"":"</span>";return i+=e+'">',i+n+o}function p(){if(!L.k)return n(B);var e="",t=0;L.lR.lastIndex=0;for(var r=L.lR.exec(B);r;){e+=n(B.substr(t,r.index-t));var a=g(L,r);a?(y+=a[1],e+=h(a[0],n(r[0]))):e+=n(r[0]),t=L.lR.lastIndex,r=L.lR.exec(B)}return e+n(B.substr(t))}function d(){if(L.sL&&!x[L.sL])return n(B);var e=L.sL?f(L.sL,B,!0,M[L.sL]):l(B);return L.r>0&&(y+=e.r),"continuous"==L.subLanguageMode&&(M[L.sL]=e.top),h(e.language,e.value,!1,!0)}function b(){return void 0!==L.sL?d():p()}function v(e,t){var r=e.cN?h(e.cN,"",!0):"";e.rB?(k+=r,B=""):e.eB?(k+=n(t)+r,B=""):(k+=r,B=t),L=Object.create(e,{parent:{value:L}})}function m(e,t){if(B+=e,void 0===t)return k+=b(),0;var r=o(t,L);if(r)return k+=b(),v(r,t),r.rB?0:t.length;var a=u(L,t);if(a){var i=L;i.rE||i.eE||(B+=t),k+=b();do L.cN&&(k+="</span>"),y+=L.r,L=L.parent;while(L!=a.parent);return i.eE&&(k+=n(t)),B="",a.starts&&v(a.starts,""),i.rE?0:t.length}if(c(t,L))throw new Error('Illegal lexeme "'+t+'" for mode "'+(L.cN||"<unnamed>")+'"');return B+=t,t.length||1}var N=E(e);if(!N)throw new Error('Unknown language: "'+e+'"');s(N);var R,L=i||N,M={},k="";for(R=L;R!=N;R=R.parent)R.cN&&(k=h(R.cN,"",!0)+k);var B="",y=0;try{for(var C,j,I=0;;){if(L.t.lastIndex=I,C=L.t.exec(t),!C)break;j=m(t.substr(I,C.index-I),C[0]),I=C.index+j}for(m(t.substr(I)),R=L;R.parent;R=R.parent)R.cN&&(k+="</span>");return{r:y,value:k,language:e,top:L}}catch(O){if(-1!=O.message.indexOf("Illegal"))return{r:0,value:n(t)};throw O}}function l(e,t){t=t||w.languages||Object.keys(x);var r={r:0,value:n(e)},a=r;return t.forEach(function(n){if(E(n)){var t=f(n,e,!1);t.language=n,t.r>a.r&&(a=t),t.r>r.r&&(a=r,r=t)}}),a.language&&(r.second_best=a),r}function g(e){return w.tabReplace&&(e=e.replace(/^((<[^>]+>|\t)+)/gm,function(e,n){return n.replace(/\t/g,w.tabReplace)})),w.useBR&&(e=e.replace(/\n/g,"<br>")),e}function h(e,n,t){var r=n?R[n]:t,a=[e.trim()];return e.match(/\bhljs\b/)||a.push("hljs"),-1===e.indexOf(r)&&a.push(r),a.join(" ").trim()}function p(e){var n=i(e);if(!a(n)){var t;w.useBR?(t=document.createElementNS("http://www.w3.org/1999/xhtml","div"),t.innerHTML=e.innerHTML.replace(/\n/g,"").replace(/<br[ \/]*>/g,"\n")):t=e;var r=t.textContent,o=n?f(n,r,!0):l(r),s=u(t);if(s.length){var p=document.createElementNS("http://www.w3.org/1999/xhtml","div");p.innerHTML=o.value,o.value=c(s,u(p),r)}o.value=g(o.value),e.innerHTML=o.value,e.className=h(e.className,n,o.language),e.result={language:o.language,re:o.r},o.second_best&&(e.second_best={language:o.second_best.language,re:o.second_best.r})}}function d(e){w=o(w,e)}function b(){if(!b.called){b.called=!0;var e=document.querySelectorAll("pre code");Array.prototype.forEach.call(e,p)}}function v(){addEventListener("DOMContentLoaded",b,!1),addEventListener("load",b,!1)}function m(n,t){var r=x[n]=t(e);r.aliases&&r.aliases.forEach(function(e){R[e]=n})}function N(){return Object.keys(x)}function E(e){return x[e]||x[R[e]]}var w={classPrefix:"hljs-",tabReplace:null,useBR:!1,languages:void 0},x={},R={};return e.highlight=f,e.highlightAuto=l,e.fixMarkup=g,e.highlightBlock=p,e.configure=d,e.initHighlighting=b,e.initHighlightingOnLoad=v,e.registerLanguage=m,e.listLanguages=N,e.getLanguage=E,e.inherit=o,e.IR="[a-zA-Z]\\w*",e.UIR="[a-zA-Z_]\\w*",e.NR="\\b\\d+(\\.\\d+)?",e.CNR="\\b(0[xX][a-fA-F0-9]+|(\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)",e.BNR="\\b(0b[01]+)",e.RSR="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~",e.BE={b:"\\\\[\\s\\S]",r:0},e.ASM={cN:"string",b:"'",e:"'",i:"\\n",c:[e.BE]},e.QSM={cN:"string",b:'"',e:'"',i:"\\n",c:[e.BE]},e.PWM={b:/\b(a|an|the|are|I|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such)\b/},e.C=function(n,t,r){var a=e.inherit({cN:"comment",b:n,e:t,c:[]},r||{});return a.c.push(e.PWM),a.c.push({cN:"doctag",bK:"TODO FIXME NOTE BUG XXX",r:0}),a},e.CLCM=e.C("//","$"),e.CBCM=e.C("/\\*","\\*/"),e.HCM=e.C("#","$"),e.NM={cN:"number",b:e.NR,r:0},e.CNM={cN:"number",b:e.CNR,r:0},e.BNM={cN:"number",b:e.BNR,r:0},e.CSSNM={cN:"number",b:e.NR+"(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",r:0},e.RM={cN:"regexp",b:/\//,e:/\/[gimuy]*/,i:/\n/,c:[e.BE,{b:/\[/,e:/\]/,r:0,c:[e.BE]}]},e.TM={cN:"title",b:e.IR,r:0},e.UTM={cN:"title",b:e.UIR,r:0},e});hljs.registerLanguage("javascript",function(e){return{aliases:["js"],k:{keyword:"in of if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const export super debugger as async await",literal:"true false null undefined NaN Infinity",built_in:"eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require module console window document Symbol Set Map WeakSet WeakMap Proxy Reflect Promise"},c:[{cN:"pi",r:10,b:/^\s*['"]use (strict|asm)['"]/},e.ASM,e.QSM,{cN:"string",b:"`",e:"`",c:[e.BE,{cN:"subst",b:"\\$\\{",e:"\\}"}]},e.CLCM,e.CBCM,{cN:"number",v:[{b:"\\b(0[bB][01]+)"},{b:"\\b(0[oO][0-7]+)"},{b:e.CNR}],r:0},{b:"("+e.RSR+"|\\b(case|return|throw)\\b)\\s*",k:"return throw case",c:[e.CLCM,e.CBCM,e.RM,{b:/</,e:/>\s*[);\]]/,r:0,sL:"xml"}],r:0},{cN:"function",bK:"function",e:/\{/,eE:!0,c:[e.inherit(e.TM,{b:/[A-Za-z$_][0-9A-Za-z$_]*/}),{cN:"params",b:/\(/,e:/\)/,eB:!0,eE:!0,c:[e.CLCM,e.CBCM],i:/["'\(]/}],i:/\[|%/},{b:/\$[(.]/},{b:"\\."+e.IR,r:0},{bK:"import",e:"[;$]",k:"import from as",c:[e.ASM,e.QSM]},{cN:"class",bK:"class",e:/[{;=]/,eE:!0,i:/[:"\[\]]/,c:[{bK:"extends"},e.UTM]}]}});hljs.registerLanguage("http",function(t){return{aliases:["https"],i:"\\S",c:[{cN:"status",b:"^HTTP/[0-9\\.]+",e:"$",c:[{cN:"number",b:"\\b\\d{3}\\b"}]},{cN:"request",b:"^[A-Z]+ (.*?) HTTP/[0-9\\.]+$",rB:!0,e:"$",c:[{cN:"string",b:" ",e:" ",eB:!0,eE:!0}]},{cN:"attribute",b:"^\\w",e:": ",eE:!0,i:"\\n|\\s|=",starts:{cN:"string",e:"$"}},{b:"\\n\\n",starts:{sL:"",eW:!0}}]}});hljs.registerLanguage("css",function(e){var c="[a-zA-Z-][a-zA-Z0-9_-]*",a={cN:"function",b:c+"\\(",rB:!0,eE:!0,e:"\\("},r={cN:"rule",b:/[A-Z\_\.\-]+\s*:/,rB:!0,e:";",eW:!0,c:[{cN:"attribute",b:/\S/,e:":",eE:!0,starts:{cN:"value",eW:!0,eE:!0,c:[a,e.CSSNM,e.QSM,e.ASM,e.CBCM,{cN:"hexcolor",b:"#[0-9A-Fa-f]+"},{cN:"important",b:"!important"}]}}]};return{cI:!0,i:/[=\/|'\$]/,c:[e.CBCM,r,{cN:"id",b:/\#[A-Za-z0-9_-]+/},{cN:"class",b:/\.[A-Za-z0-9_-]+/},{cN:"attr_selector",b:/\[/,e:/\]/,i:"$"},{cN:"pseudo",b:/:(:)?[a-zA-Z0-9\_\-\+\(\)"']+/},{cN:"at_rule",b:"@(font-face|page)",l:"[a-z-]+",k:"font-face page"},{cN:"at_rule",b:"@",e:"[{;]",c:[{cN:"keyword",b:/\S+/},{b:/\s/,eW:!0,eE:!0,r:0,c:[a,e.ASM,e.QSM,e.CSSNM]}]},{cN:"tag",b:c,r:0},{cN:"rules",b:"{",e:"}",i:/\S/,c:[e.CBCM,r]}]}});hljs.registerLanguage("cpp",function(t){var e={cN:"keyword",b:"[a-z\\d_]*_t"},r={keyword:"false int float while private char catch export virtual operator sizeof dynamic_cast|10 typedef const_cast|10 const struct for static_cast|10 union namespace unsigned long volatile static protected bool template mutable if public friend do goto auto void enum else break extern using true class asm case typeid short reinterpret_cast|10 default double register explicit signed typename try this switch continue inline delete alignof constexpr decltype noexcept nullptr static_assert thread_local restrict _Bool complex _Complex _Imaginary atomic_bool atomic_char atomic_schar atomic_uchar atomic_short atomic_ushort atomic_int atomic_uint atomic_long atomic_ulong atomic_llong atomic_ullong",built_in:"std string cin cout cerr clog stringstream istringstream ostringstream auto_ptr deque list queue stack vector map set bitset multiset multimap unordered_set unordered_map unordered_multiset unordered_multimap array shared_ptr abort abs acos asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp fscanf isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper isxdigit tolower toupper labs ldexp log10 log malloc memchr memcmp memcpy memset modf pow printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan vfprintf vprintf vsprintf"};return{aliases:["c","cc","h","c++","h++","hpp"],k:r,i:"</",c:[e,t.CLCM,t.CBCM,{cN:"string",v:[t.inherit(t.QSM,{b:'((u8?|U)|L)?"'}),{b:'(u8?|U)?R"',e:'"',c:[t.BE]},{b:"'\\\\?.",e:"'",i:"."}]},{cN:"number",b:"\\b(\\d+(\\.\\d*)?|\\.\\d+)(u|U|l|L|ul|UL|f|F)"},t.CNM,{cN:"preprocessor",b:"#",e:"$",k:"if else elif endif define undef warning error line pragma",c:[{b:/\\\n/,r:0},{b:'include\\s*[<"]',e:'[>"]',k:"include",i:"\\n"},t.CLCM]},{b:"\\b(deque|list|queue|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array)\\s*<",e:">",k:r,c:["self",e]},{b:t.IR+"::",k:r},{bK:"new throw return else",r:0},{cN:"function",b:"("+t.IR+"\\s+)+"+t.IR+"\\s*\\(",rB:!0,e:/[{;=]/,eE:!0,k:r,c:[{b:t.IR+"\\s*\\(",rB:!0,c:[t.TM],r:0},{cN:"params",b:/\(/,e:/\)/,k:r,r:0,c:[t.CBCM]},t.CLCM,t.CBCM]}]}});hljs.registerLanguage("makefile",function(e){var a={cN:"variable",b:/\$\(/,e:/\)/,c:[e.BE]};return{aliases:["mk","mak"],c:[e.HCM,{b:/^\w+\s*\W*=/,rB:!0,r:0,starts:{cN:"constant",e:/\s*\W*=/,eE:!0,starts:{e:/$/,r:0,c:[a]}}},{cN:"title",b:/^[\w]+:\s*$/},{cN:"phony",b:/^\.PHONY:/,e:/$/,k:".PHONY",l:/[\.\w]+/},{b:/^\t+/,e:/$/,r:0,c:[e.QSM,a]}]}});hljs.registerLanguage("nginx",function(e){var r={cN:"variable",v:[{b:/\$\d+/},{b:/\$\{/,e:/}/},{b:"[\\$\\@]"+e.UIR}]},b={eW:!0,l:"[a-z/_]+",k:{built_in:"on off yes no true false none blocked debug info notice warn error crit select break last permanent redirect kqueue rtsig epoll poll /dev/poll"},r:0,i:"=>",c:[e.HCM,{cN:"string",c:[e.BE,r],v:[{b:/"/,e:/"/},{b:/'/,e:/'/}]},{cN:"url",b:"([a-z]+):/",e:"\\s",eW:!0,eE:!0,c:[r]},{cN:"regexp",c:[e.BE,r],v:[{b:"\\s\\^",e:"\\s|{|;",rE:!0},{b:"~\\*?\\s+",e:"\\s|{|;",rE:!0},{b:"\\*(\\.[a-z\\-]+)+"},{b:"([a-z\\-]+\\.)+\\*"}]},{cN:"number",b:"\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}(:\\d{1,5})?\\b"},{cN:"number",b:"\\b\\d+[kKmMgGdshdwy]*\\b",r:0},r]};return{aliases:["nginxconf"],c:[e.HCM,{b:e.UIR+"\\s",e:";|{",rB:!0,c:[{cN:"title",b:e.UIR,starts:b}],r:0}],i:"[^\\s\\}]"}});hljs.registerLanguage("python",function(e){var r={cN:"prompt",b:/^(>>>|\.\.\.) /},b={cN:"string",c:[e.BE],v:[{b:/(u|b)?r?'''/,e:/'''/,c:[r],r:10},{b:/(u|b)?r?"""/,e:/"""/,c:[r],r:10},{b:/(u|r|ur)'/,e:/'/,r:10},{b:/(u|r|ur)"/,e:/"/,r:10},{b:/(b|br)'/,e:/'/},{b:/(b|br)"/,e:/"/},e.ASM,e.QSM]},l={cN:"number",r:0,v:[{b:e.BNR+"[lLjJ]?"},{b:"\\b(0o[0-7]+)[lLjJ]?"},{b:e.CNR+"[lLjJ]?"}]},c={cN:"params",b:/\(/,e:/\)/,c:["self",r,l,b]};return{aliases:["py","gyp"],k:{keyword:"and elif is global as in if from raise for except finally print import pass return exec else break not with class assert yield try while continue del or def lambda nonlocal|10 None True False",built_in:"Ellipsis NotImplemented"},i:/(<\/|->|\?)/,c:[r,l,b,e.HCM,{v:[{cN:"function",bK:"def",r:10},{cN:"class",bK:"class"}],e:/:/,i:/[${=;\n,]/,c:[e.UTM,c]},{cN:"decorator",b:/@/,e:/$/},{b:/\b(print|exec)\(/}]}});hljs.registerLanguage("markdown",function(e){return{aliases:["md","mkdown","mkd"],c:[{cN:"header",v:[{b:"^#{1,6}",e:"$"},{b:"^.+?\\n[=-]{2,}$"}]},{b:"<",e:">",sL:"xml",r:0},{cN:"bullet",b:"^([*+-]|(\\d+\\.))\\s+"},{cN:"strong",b:"[*_]{2}.+?[*_]{2}"},{cN:"emphasis",v:[{b:"\\*.+?\\*"},{b:"_.+?_",r:0}]},{cN:"blockquote",b:"^>\\s+",e:"$"},{cN:"code",v:[{b:"`.+?`"},{b:"^( {4}|    )",e:"$",r:0}]},{cN:"horizontal_rule",b:"^[-\\*]{3,}",e:"$"},{b:"\\[.+?\\][\\(\\[].*?[\\)\\]]",rB:!0,c:[{cN:"link_label",b:"\\[",e:"\\]",eB:!0,rE:!0,r:0},{cN:"link_url",b:"\\]\\(",e:"\\)",eB:!0,eE:!0},{cN:"link_reference",b:"\\]\\[",e:"\\]",eB:!0,eE:!0}],r:10},{b:"^\\[.+\\]:",rB:!0,c:[{cN:"link_reference",b:"\\[",e:"\\]:",eB:!0,eE:!0,starts:{cN:"link_url",e:"$"}}]}]}});hljs.registerLanguage("xml",function(t){var e="[A-Za-z0-9\\._:-]+",s={b:/<\?(php)?(?!\w)/,e:/\?>/,sL:"php",subLanguageMode:"continuous"},c={eW:!0,i:/</,r:0,c:[s,{cN:"attribute",b:e,r:0},{b:"=",r:0,c:[{cN:"value",c:[s],v:[{b:/"/,e:/"/},{b:/'/,e:/'/},{b:/[^\s\/>]+/}]}]}]};return{aliases:["html","xhtml","rss","atom","xsl","plist"],cI:!0,c:[{cN:"doctype",b:"<!DOCTYPE",e:">",r:10,c:[{b:"\\[",e:"\\]"}]},t.C("<!--","-->",{r:10}),{cN:"cdata",b:"<\\!\\[CDATA\\[",e:"\\]\\]>",r:10},{cN:"tag",b:"<style(?=\\s|>|$)",e:">",k:{title:"style"},c:[c],starts:{e:"</style>",rE:!0,sL:"css"}},{cN:"tag",b:"<script(?=\\s|>|$)",e:">",k:{title:"script"},c:[c],starts:{e:"</script>",rE:!0,sL:""}},s,{cN:"pi",b:/<\?\w+/,e:/\?>/,r:10},{cN:"tag",b:"</?",e:"/?>",c:[{cN:"title",b:/[^ \/><\n\t]+/,r:0},c]}]}});hljs.registerLanguage("java",function(e){var a=e.UIR+"(<"+e.UIR+">)?",t="false synchronized int abstract float private char boolean static null if const for true while long strictfp finally protected import native final void enum else break transient catch instanceof byte super volatile case assert short package default double public try this switch continue throws protected public private",c="\\b(0[bB]([01]+[01_]+[01]+|[01]+)|0[xX]([a-fA-F0-9]+[a-fA-F0-9_]+[a-fA-F0-9]+|[a-fA-F0-9]+)|(([\\d]+[\\d_]+[\\d]+|[\\d]+)(\\.([\\d]+[\\d_]+[\\d]+|[\\d]+))?|\\.([\\d]+[\\d_]+[\\d]+|[\\d]+))([eE][-+]?\\d+)?)[lLfF]?",r={cN:"number",b:c,r:0};return{aliases:["jsp"],k:t,i:/<\//,c:[e.C("/\\*\\*","\\*/",{r:0,c:[{cN:"doctag",b:"@[A-Za-z]+"}]}),e.CLCM,e.CBCM,e.ASM,e.QSM,{cN:"class",bK:"class interface",e:/[{;=]/,eE:!0,k:"class interface",i:/[:"\[\]]/,c:[{bK:"extends implements"},e.UTM]},{bK:"new throw return else",r:0},{cN:"function",b:"("+a+"\\s+)+"+e.UIR+"\\s*\\(",rB:!0,e:/[{;=]/,eE:!0,k:t,c:[{b:e.UIR+"\\s*\\(",rB:!0,r:0,c:[e.UTM]},{cN:"params",b:/\(/,e:/\)/,k:t,r:0,c:[e.ASM,e.QSM,e.CNM,e.CBCM]},e.CLCM,e.CBCM]},r,{cN:"annotation",b:"@[A-Za-z]+"}]}});hljs.registerLanguage("sql",function(e){var t=e.C("--","$");return{cI:!0,i:/[<>]/,c:[{cN:"operator",bK:"begin end start commit rollback savepoint lock alter create drop rename call delete do handler insert load replace select truncate update set show pragma grant merge describe use explain help declare prepare execute deallocate savepoint release unlock purge reset change stop analyze cache flush optimize repair kill install uninstall checksum restore check backup revoke",e:/;/,eW:!0,k:{keyword:"abs absolute acos action add adddate addtime aes_decrypt aes_encrypt after aggregate all allocate alter analyze and any are as asc ascii asin assertion at atan atan2 atn2 authorization authors avg backup before begin benchmark between bin binlog bit_and bit_count bit_length bit_or bit_xor both by cache call cascade cascaded case cast catalog ceil ceiling chain change changed char_length character_length charindex charset check checksum checksum_agg choose close coalesce coercibility collate collation collationproperty column columns columns_updated commit compress concat concat_ws concurrent connect connection connection_id consistent constraint constraints continue contributors conv convert convert_tz corresponding cos cot count count_big crc32 create cross cume_dist curdate current current_date current_time current_timestamp current_user cursor curtime data database databases datalength date_add date_format date_sub dateadd datediff datefromparts datename datepart datetime2fromparts datetimeoffsetfromparts day dayname dayofmonth dayofweek dayofyear deallocate declare decode default deferrable deferred degrees delayed delete des_decrypt des_encrypt des_key_file desc describe descriptor diagnostics difference disconnect distinct distinctrow div do domain double drop dumpfile each else elt enclosed encode encrypt end end-exec engine engines eomonth errors escape escaped event eventdata events except exception exec execute exists exp explain export_set extended external extract fast fetch field fields find_in_set first first_value floor flush for force foreign format found found_rows from from_base64 from_days from_unixtime full function get get_format get_lock getdate getutcdate global go goto grant grants greatest group group_concat grouping grouping_id gtid_subset gtid_subtract handler having help hex high_priority hosts hour ident_current ident_incr ident_seed identified identity if ifnull ignore iif ilike immediate in index indicator inet6_aton inet6_ntoa inet_aton inet_ntoa infile initially inner innodb input insert install instr intersect into is is_free_lock is_ipv4 is_ipv4_compat is_ipv4_mapped is_not is_not_null is_used_lock isdate isnull isolation join key kill language last last_day last_insert_id last_value lcase lead leading least leaves left len lenght level like limit lines ln load load_file local localtime localtimestamp locate lock log log10 log2 logfile logs low_priority lower lpad ltrim make_set makedate maketime master master_pos_wait match matched max md5 medium merge microsecond mid min minute mod mode module month monthname mutex name_const names national natural nchar next no no_write_to_binlog not now nullif nvarchar oct octet_length of old_password on only open optimize option optionally or ord order outer outfile output pad parse partial partition password patindex percent_rank percentile_cont percentile_disc period_add period_diff pi plugin position pow power pragma precision prepare preserve primary prior privileges procedure procedure_analyze processlist profile profiles public publishingservername purge quarter query quick quote quotename radians rand read references regexp relative relaylog release release_lock rename repair repeat replace replicate reset restore restrict return returns reverse revoke right rlike rollback rollup round row row_count rows rpad rtrim savepoint schema scroll sec_to_time second section select serializable server session session_user set sha sha1 sha2 share show sign sin size slave sleep smalldatetimefromparts snapshot some soname soundex sounds_like space sql sql_big_result sql_buffer_result sql_cache sql_calc_found_rows sql_no_cache sql_small_result sql_variant_property sqlstate sqrt square start starting status std stddev stddev_pop stddev_samp stdev stdevp stop str str_to_date straight_join strcmp string stuff subdate substr substring subtime subtring_index sum switchoffset sysdate sysdatetime sysdatetimeoffset system_user sysutcdatetime table tables tablespace tan temporary terminated tertiary_weights then time time_format time_to_sec timediff timefromparts timestamp timestampadd timestampdiff timezone_hour timezone_minute to to_base64 to_days to_seconds todatetimeoffset trailing transaction translation trigger trigger_nestlevel triggers trim truncate try_cast try_convert try_parse ucase uncompress uncompressed_length unhex unicode uninstall union unique unix_timestamp unknown unlock update upgrade upped upper usage use user user_resources using utc_date utc_time utc_timestamp uuid uuid_short validate_password_strength value values var var_pop var_samp variables variance varp version view warnings week weekday weekofyear weight_string when whenever where with work write xml xor year yearweek zon",literal:"true false null",built_in:"array bigint binary bit blob boolean char character date dec decimal float int integer interval number numeric real serial smallint varchar varying int8 serial8 text"},c:[{cN:"string",b:"'",e:"'",c:[e.BE,{b:"''"}]},{cN:"string",b:'"',e:'"',c:[e.BE,{b:'""'}]},{cN:"string",b:"`",e:"`",c:[e.BE]},e.CNM,e.CBCM,t]},e.CBCM,t]}});hljs.registerLanguage("json",function(e){var t={literal:"true false null"},i=[e.QSM,e.CNM],l={cN:"value",e:",",eW:!0,eE:!0,c:i,k:t},c={b:"{",e:"}",c:[{cN:"attribute",b:'\\s*"',e:'"\\s*:\\s*',eB:!0,eE:!0,c:[e.BE],i:"\\n",starts:l}],i:"\\S"},n={b:"\\[",e:"\\]",c:[e.inherit(l,{cN:null})],i:"\\S"};return i.splice(i.length,0,c,n),{c:i,k:t,i:"\\S"}});hljs.registerLanguage("bash",function(e){var t={cN:"variable",v:[{b:/\$[\w\d#@][\w\d_]*/},{b:/\$\{(.*?)}/}]},s={cN:"string",b:/"/,e:/"/,c:[e.BE,t,{cN:"variable",b:/\$\(/,e:/\)/,c:[e.BE]}]},a={cN:"string",b:/'/,e:/'/};return{aliases:["sh","zsh"],l:/-?[a-z\.]+/,k:{keyword:"if then else elif fi for while in do done case esac function",literal:"true false",built_in:"break cd continue eval exec exit export getopts hash pwd readonly return shift test times trap umask unset alias bind builtin caller command declare echo enable help let local logout mapfile printf read readarray source type typeset ulimit unalias set shopt autoload bg bindkey bye cap chdir clone comparguments compcall compctl compdescribe compfiles compgroups compquote comptags comptry compvalues dirs disable disown echotc echoti emulate fc fg float functions getcap getln history integer jobs kill limit log noglob popd print pushd pushln rehash sched setcap setopt stat suspend ttyctl unfunction unhash unlimit unsetopt vared wait whence where which zcompile zformat zftp zle zmodload zparseopts zprof zpty zregexparse zsocket zstyle ztcp",operator:"-ne -eq -lt -gt -f -d -e -s -l -a"},c:[{cN:"shebang",b:/^#![^\n]+sh\s*$/,r:10},{cN:"function",b:/\w[\w\d_]*\s*\(\s*\)\s*\{/,rB:!0,c:[e.inherit(e.TM,{b:/\w[\w\d_]*/})],r:0},e.HCM,e.NM,s,a,t]}});hljs.registerLanguage("php",function(e){var c={cN:"variable",b:"\\$+[a-zA-Z_-ÿ][a-zA-Z0-9_-ÿ]*"},a={cN:"preprocessor",b:/<\?(php)?|\?>/},i={cN:"string",c:[e.BE,a],v:[{b:'b"',e:'"'},{b:"b'",e:"'"},e.inherit(e.ASM,{i:null}),e.inherit(e.QSM,{i:null})]},n={v:[e.BNM,e.CNM]};return{aliases:["php3","php4","php5","php6"],cI:!0,k:"and include_once list abstract global private echo interface as static endswitch array null if endwhile or const for endforeach self var while isset public protected exit foreach throw elseif include __FILE__ empty require_once do xor return parent clone use __CLASS__ __LINE__ else break print eval new catch __METHOD__ case exception default die require __FUNCTION__ enddeclare final try switch continue endfor endif declare unset true false trait goto instanceof insteadof __DIR__ __NAMESPACE__ yield finally",c:[e.CLCM,e.HCM,e.C("/\\*","\\*/",{c:[{cN:"doctag",b:"@[A-Za-z]+"},a]}),e.C("__halt_compiler.+?;",!1,{eW:!0,k:"__halt_compiler",l:e.UIR}),{cN:"string",b:"<<<['\"]?\\w+['\"]?$",e:"^\\w+;",c:[e.BE]},a,c,{b:/(::|->)+[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/},{cN:"function",bK:"function",e:/[;{]/,eE:!0,i:"\\$|\\[|%",c:[e.UTM,{cN:"params",b:"\\(",e:"\\)",c:["self",c,e.CBCM,i,n]}]},{cN:"class",bK:"class interface",e:"{",eE:!0,i:/[:\(\$"]/,c:[{bK:"extends implements"},e.UTM]},{bK:"namespace",e:";",i:/[\.']/,c:[e.UTM]},{bK:"use",e:";",c:[e.UTM]},{b:"=>"},i,n]}});hljs.registerLanguage("perl",function(e){var t="getpwent getservent quotemeta msgrcv scalar kill dbmclose undef lc ma syswrite tr send umask sysopen shmwrite vec qx utime local oct semctl localtime readpipe do return format read sprintf dbmopen pop getpgrp not getpwnam rewinddir qqfileno qw endprotoent wait sethostent bless s|0 opendir continue each sleep endgrent shutdown dump chomp connect getsockname die socketpair close flock exists index shmgetsub for endpwent redo lstat msgctl setpgrp abs exit select print ref gethostbyaddr unshift fcntl syscall goto getnetbyaddr join gmtime symlink semget splice x|0 getpeername recv log setsockopt cos last reverse gethostbyname getgrnam study formline endhostent times chop length gethostent getnetent pack getprotoent getservbyname rand mkdir pos chmod y|0 substr endnetent printf next open msgsnd readdir use unlink getsockopt getpriority rindex wantarray hex system getservbyport endservent int chr untie rmdir prototype tell listen fork shmread ucfirst setprotoent else sysseek link getgrgid shmctl waitpid unpack getnetbyname reset chdir grep split require caller lcfirst until warn while values shift telldir getpwuid my getprotobynumber delete and sort uc defined srand accept package seekdir getprotobyname semop our rename seek if q|0 chroot sysread setpwent no crypt getc chown sqrt write setnetent setpriority foreach tie sin msgget map stat getlogin unless elsif truncate exec keys glob tied closedirioctl socket readlink eval xor readline binmode setservent eof ord bind alarm pipe atan2 getgrent exp time push setgrent gt lt or ne m|0 break given say state when",r={cN:"subst",b:"[$@]\\{",e:"\\}",k:t},s={b:"->{",e:"}"},n={cN:"variable",v:[{b:/\$\d/},{b:/[\$%@](\^\w\b|#\w+(::\w+)*|{\w+}|\w+(::\w*)*)/},{b:/[\$%@][^\s\w{]/,r:0}]},i=e.C("^(__END__|__DATA__)","\\n$",{r:5}),o=[e.BE,r,n],a=[n,e.HCM,i,e.C("^\\=\\w","\\=cut",{eW:!0}),s,{cN:"string",c:o,v:[{b:"q[qwxr]?\\s*\\(",e:"\\)",r:5},{b:"q[qwxr]?\\s*\\[",e:"\\]",r:5},{b:"q[qwxr]?\\s*\\{",e:"\\}",r:5},{b:"q[qwxr]?\\s*\\|",e:"\\|",r:5},{b:"q[qwxr]?\\s*\\<",e:"\\>",r:5},{b:"qw\\s+q",e:"q",r:5},{b:"'",e:"'",c:[e.BE]},{b:'"',e:'"'},{b:"`",e:"`",c:[e.BE]},{b:"{\\w+}",c:[],r:0},{b:"-?\\w+\\s*\\=\\>",c:[],r:0}]},{cN:"number",b:"(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b",r:0},{b:"(\\/\\/|"+e.RSR+"|\\b(split|return|print|reverse|grep)\\b)\\s*",k:"split return print reverse grep",r:0,c:[e.HCM,i,{cN:"regexp",b:"(s|tr|y)/(\\\\.|[^/])*/(\\\\.|[^/])*/[a-z]*",r:10},{cN:"regexp",b:"(m|qr)?/",e:"/[a-z]*",c:[e.BE],r:0}]},{cN:"sub",bK:"sub",e:"(\\s*\\(.*?\\))?[;{]",r:5},{cN:"operator",b:"-\\w\\b",r:0}];return r.c=a,s.c=a,{aliases:["pl"],k:t,c:a}});

//扩展关键字提示
LanEditor.Keyword.extend({
    "js": [
        "var",
        "function",
        "break",
        "delete",
        "return",
        "typeof",
        "case",
        "do",
        "if",
        "switch",
        "catch",
        "else",
        "in",
        "this",
        "void",
        "continue",
        "false",
        "instanceof",
        "throw",
        "while",
        "debugger",
        "finally",
        "new",
        "true",
        "with",
        "default",
        "for",
        "null",
        "try"
    ],
    "css": [
        "position",
        "relative",
        "absolute",
        "margin",
        "margin-left",
        "margin-top",
        "margin-right",
        "margin-bottom",
        "padding",
        "padding-top",
        "padding-bottom",
        "padding-left",
        "padding-right",
        "border",
        "border-top",
        "border-bottom",
        "border-left",
        "border-right",
        "width",
        "min-width",
        "max-width",
        "height",
        "min-height",
        "max-height",
        "line-height",
        "font",
        "font-size",
        "font-face",
        "font-family",
        "font-style",
        "font-weight",
        "color",
        "background-color",
        "background-image",
        "box-sizing",
        "border-box",
        "content-box",
        "box-shadow",
        "text-shadow",
        "list",
        "list-style",
        "li",
        "text-decoration"
    ]
});