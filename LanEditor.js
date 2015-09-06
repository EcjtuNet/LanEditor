var LanEditor = {
    KeywordSet: {
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
            "absolute"
        ]
    },
    //构造函数，初始化变量，注册按键监听
    init: function(textelem, showelem) {
        //初始化语法高亮
        hljs.initHighlightingOnLoad();
        //初始化markdown渲染器
        this.converter = new Showdown.converter();
        //编辑框id
        this.textelem = textelem;
        this.showelem = showelem;
        this.TextElem = $("#" + textelem);
        $("body").append(
            "<div class=\"_Keyword\" id=\"_Keyword\"><ul id=\"_KeywordLi\"></ul></div>" +
            '<div class="_LanEditorBg" id="_LanEditorBg">' +
            '</div>' +
            '<div class="_LEBorder" id="_LEBorder">' +
            '<ul class="_LEMenuList">' +
            '<li class="_MenuListSe">文件列表</li>' +
            '<li>选项设置</li>' +
            '</ul>' +
            '<div class="_LEContent">' +
            '<div id="_LEFilelist">' +
            '<p>' +
            '<input type="text" id="_LENName">' +
            '<span id="_LEFNB">新建</span>' +
            '</p>' +
            '<ul>' +
            '<li>' +
            '<span class="_LEFName" title="LanEditor文档说明">LanEditor文档说明LanEditor文档说明</span>' +
            '<span class="_LEFM" title="导出Markdown文件到本地">MD</span>' +
            '<span class="_LEFH" title="导出HTML文件到本地">HTML</span>' +
            '<span class="_LEFD" title="删除文件">删除</span>' +
            '<span class="_LEFT" title="创建日期">8月16</span>' +
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
                "font-size": "13px",
                "font-family": "Menlo, Monaco, Consolas, Courier New, monospace",
                "font-weight": 1.3,
                "outline": "none",
                "background-color": "#23241f",
                "color": "#f8f8f2"
            });
        })(this.TextElem);
        //注册监听
        var TextElem = document.getElementById(textelem);
        if ("undefined" != typeof TextElem.addEventListener) {
            window.addEventListener("keydown", function(event) {
                LanEditor.Menu.Toggle.call(LanEditor.Menu, event);
            }, false);
            TextElem.addEventListener("keydown", this.KeyRewrite, false);
            TextElem.addEventListener("keyup", this.AutoCompleteSymbol, false);
            TextElem.addEventListener("keyup", this.AutoCompleteKeyword, false);
            TextElem.addEventListener("keyup", function() {
                LanEditor.DelayTillLast.call(LanEditor, "RenderHTML", LanEditor.RenderHTML, 300);
            }, false);
        } else if ("undefined" != typeof TextElem.attachEvent) {
            window.attachEvent("keydown", function(event) {
                LanEditor.Menu.Toggle.call(LanEditor.Menu, event);
            });
            TextElem.attachEvent("keydown", this.KeyRewrite);
            TextElem.attachEvent("keyup", this.AutoCompleteSymbol);
            TextElem.attachEvent("keyup", this.AutoCompleteKeyword);
            TextElem.attachEvent("keyup", function() {
                LanEditor.DelayTillLast.call(LanEditor, "RenderHTML", LanEditor.RenderHTML);
            }, 300);
        } else {
            alert("此浏览器太老，建议用chrome浏览器");
        }
        //初始化提示框对象参数
        this.SKLPara.Set(false, 0, 0);
        TextElem.focus();
        //---------------------------------事件代理
        $("#_LEFilelist ul").delegate("span", "click", function(e) {
            console.log(e.target);
        });
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
        $("#" + this.showelem).html(this.converter.makeHtml(this.TextElem.val()));
        $('pre code').each(function(i, block) {
            hljs.highlightBlock(block);
        });
    },
    //设置提示框对象参数
    SKLPara: {
        show: null,
        count: null,
        cs: null,
        SWL: 0,
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
    AutoCompleteKeyword: function(event) {
        var TextElem = $(this);
        var e = event;
        var SKLelem = $("#_Keyword");
        if (e.which == 38 || e.which == 40) {
            return;
        }
        if ((e.which < 65 && e.which > 57 || e.which > 90 || e.which < 48) && e.which != 8) {
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
        if (!resultset) {
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
        var KeywordSet = this.KeywordSet;
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
        return flag ? resultset : false;
    },
    //符号自动补全，keyup阶段执行
    AutoCompleteSymbol: function(event) {
        var e = event;
        var TextElem = $(this);
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
            TextElem.iAddField(")");
            TextElem.iSelectField(TextElem.iGetFieldPos() - 1);
        } else if (e.shiftKey && e.which == 48) { // ) 右括号判断是否成对匹配
            var pre = TextElem.iGetPosStr(-2);
            var next = TextElem.iGetPosStr(1);
            if (pre == "()" && next == ")") {
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
        }
    },
    //重写按键功能，在keydown阶段执行
    KeyRewrite: function(event) {
        var TextElem = $(this);
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
        } else if (e.which == 13) {
            if (LanEditor.SKLPara.show == true) {
                e.preventDefault();
                TextElem.iDelField(LanEditor.SKLPara.SWL);
                TextElem.iAddField(LanEditor.SKLPara.ResultSet[LanEditor.SKLPara.cs]);
            }
        }
        console.log("keyCode -> " + e.which);
    },
    //文件对象
    File: {
        // 保存为md文件
        ExportMD: function() {
            var fileName = prompt("保存为Markdown文件，请输入文件名", "新建Markdown文件");
            if (fileName == null || fileName == "") {
                return;
            }
            this.ExportFile(fileName + ".md", LanEditor.TextElem.val());
        },
        // 保存为HTML文件
        ExportHTML: function() {

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
                return "localStorage not support";
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
        }
    },
    //菜单对象
    Menu: {
        IsShow: false,
        MenuObj: null,
        //切换显示状态
        Toggle: function(e) {
            if (e.which == 27) {
                e.preventDefault();
                if (this.IsShow) {
                    LanEditor.Background.Show(false);
                    this.MenuObj.css({
                        "height": "30px",
                        "right": "100%"
                    });
                    setTimeout(function() {
                        LanEditor.Menu.MenuObj.css({
                            "display": "none"
                        });
                    }, 800);
                    this.IsShow = false;
                } else {
                    LanEditor.Background.Show(true);
                    this.MenuObj.css({
                        "display": "block"
                    });
                    setTimeout(function() {
                        LanEditor.Menu.MenuObj.css({
                            "height": "320px",
                            "right": "0%"
                        });
                    });
                    this.IsShow = true;
                }
            }
            console.log("IsShow -> " + this.IsShow);
        },
        //设置是否显示菜单，true显示，false不显示
        Show: function(IsShow) {
            if(IsShow) {
                this.MenuObj.css({
                    "display": "block"
                });
                setTimeout(function(){
                    LanEditor.Menu.MenuObj.css({
                        "height": "320px",
                        "right": "0%"
                    });
                }, 800);
                this.IsShow = true;
            } else {
                this.MenuObj.css({
                    "height": "30px",
                    "right": "100%"
                });
                setTimeout(function(){
                    LanEditor.Menu.MenuObj.css({
                        "display": "none"
                    });
                }, 800);
                this.IsShow = false;
            }
        }
    },
    //背景遮罩层对象
    Background: {
        IsShow: false,
        BackObj: null,
        //切换显示状态
        Toggle: function() {
            if (this.IsShow) {
                this.BackObj.css({
                    "opacity": 0
                });
                setTimeout(function() {
                    LanEditor.Background.BackObj.css({
                        "display": "none"
                    });
                }, 800);
                this.IsShow = false;
            } else {
                this.BackObj.css({
                    "display": "block"
                });
                setTimeout(function() {
                    LanEditor.Background.BackObj.css({
                        "opacity": 0.8
                    });
                }, 10);
                this.IsShow = true;
            }
        },
        //是否显示背景遮罩层 false不显示，true显示
        Show: function(IsShow) {
            if(IsShow) {
                this.IsShow = false;
            }else {
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
    }
};

/* ----------------------------获取光标在文本框的位置-----------------------------------
 *
 * 获取输入光标在页面中的坐标 
 * 可全局使用，使用方法 CursorPos.GetCursorPos(HTMLElement)
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
 * 快速开始
 * 引入jquery和本文件
 * $(element).iGetFieldPos();//获取光标位置
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


//在光标前插入字符串,暂时没用到
/*function InsertAtCursor(myField, myValue) {
    //IE Support
    if (document.selection) {
        myField.focus();
        sel = document.selection.createRange();
        sel.text = myValue;
        sel.select();
    }
    //Mozilla/Netscape Support
    else if (myField.selectionStart || myField.selectionStart == '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        // save scrollTop before insert
        var restoreTop = myField.scrollTop;
        myField.value = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);
        if (restoreTop > 0) {
            // restore previous scrollTop
            myField.scrollTop = restoreTop;
        }
        myField.focus();
        myField.selectionStart = startPos + myValue.length;
        myField.selectionEnd = startPos + myValue.length;
    } else {
        myField.value += myValue;
        myField.focus();
    }
}*/
