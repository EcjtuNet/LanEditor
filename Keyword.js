var Keyword = {
    Keyword: {
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
    //关键字自动补全
    AutoCompleteKeyword: function(e, TextElem) {
        var SKLelem = $("#Keyword");
        if ((e.which < 65 && e.which > 57 || e.which > 90 || e.which < 48) && e.which != 8) {
            SKLelem.css({
                "opacity": 0,
                "z-index": -20
            });
            return;
        }
        //要匹配的单词
        var word = "";
        //查找光标前面的单词
        var i = 1;
        var char = TextElem.iGetPosStr(-i).charAt(0);
        while (char != "" && char != "(" && char != ")" && char != ";") {
            if (i > TextElem.val().length) {
                break;
            }
            if (char >= "a" && char <= "z" || char >= "A" && char <= "Z" || char == "_" || char == "-") {
                i++;
            } else {
                break;
            }
            char = TextElem.iGetPosStr(-i).charAt(0);
        }
        if (i > 1) {
            word = TextElem.iGetPosStr(-(i - 1));
            this.ShowKeywordList(word, TextElem, SKLelem);
        } else {
            SKLelem.css({
                "opacity": 0,
                "z-index": -20
            });
        }
    },
    //显示关键字提示列表
    ShowKeywordList: function(word, TextElem, SKLelem) {
        var cursorpos = CursorPos.GetCursorPos(document.getElementById('editor'));
        var scrolltop = TextElem.scrollTop();
        var left = cursorpos.left;
        var top = cursorpos.top - scrolltop + 18;
        //查找匹配的单词结果
        var resultset = this.SearchKeyword(word);
        //拼接HTML代码
        if (!resultset) {
            SKLelem.css({
                "opacity": 0,
                "z-index": -20
            });
            return;
        }
        var KeyCount=0;
        var html = "";
        for (key in resultset) {
            //过滤键名
            if (!isNaN(key)) {
                continue;
            }
            for (var i = 0; i < resultset[key].length; ++i) {
                html += "<li>" + resultset[key][i] + "</li>";
                KeyCount++;
            }
        }
        $("#KeywordLi").html(html);
        //显示DIV框的border需要多加4像素
        var SKLheight = (KeyCount > 10 ? 180 : KeyCount * 18) + 4;
        var height = parseInt(TextElem.parent().css("height"));
        // var SKLheight = parseInt(SKLelem.css("height"));
        // console.log("top -> " + top);
        //
        if (top + SKLheight > height) {
            top = top - SKLheight - 18;
        }
        // console.log("height -> " + height + " SKLheight -> " + SKLheight);
        //查找单词为空，不显示提示列表
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
        var count = 0;
        for (key in this.Keyword) {
            resultset.push(key);
            resultset[key] = new Array();
            for (var i = 0; i < this.Keyword[key].length; ++i) {
                // console.log("in " + Keyword[key][i] + " search -> " + word + " search reg ->" + "/" + word + "/i search flag -> " + Keyword[key][i].search("/" + word + "/i"));
                var reg = new RegExp("(" + word + ")", "gi");
                if (this.Keyword[key][i].search(reg) > -1) {
                    resultset[key].push(this.Keyword[key][i].replace(reg, "<span class=\"KeyHL\">$1</span>"));
                    flag = true;
                    count++;
                }
            }
        }
        this.KeywordCount = count;
        this.SelectKeyword = 0;
        return flag ? resultset : false;
    },
    //符号自动补全
    AutoCompleteSymbol: function(e, TextElem) {
        //按回车缩进和上一行相同的间距
        if (e.which == 13) {
            var space = 0;
            var i = 2;
            //计算上一行前面的空格缩进个数
            while (TextElem.iGetPosStr(-i).charAt(0) != "\n" && TextElem.iGetPosStr(-i).charAt(0) != "\r\n") {
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
            if (isfunc) {
                TextElem.iAddField("\n");
                for (var i = 0; i < space - 4; ++i) {
                    TextElem.iAddField(" ");
                }
            }
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
    }
};
