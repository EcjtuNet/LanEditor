$(document).ready(function() {
    var TextElem = $("#editor");
    TextElem.focus();
    hljs.initHighlightingOnLoad();
    var converter = new Showdown.converter();
    $(document).keydown(function(e) {
        //阻止Tab事件，换成4个空格
        if (e.which == 9) {
            e.preventDefault();
            TextElem.iAddField("    ");
        } else if (e.which == 8) { //退格键删除多个空格
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
        }
        // console.log("keyCode -> " + e.which);
    });
    $(document).keypress(function() {

    });
    $(document).keyup(function(e) {
        //自动补全符号
        Keyword.AutoCompleteSymbol(e, TextElem);
        //自动补全单词
        Keyword.AutoCompleteKeyword(e, TextElem);
        //渲染HTML预览
        delay_till_last("render", function() {

            $("#show").html(converter.makeHtml(TextElem.val()));
            $('pre code').each(function(i, block) {
                hljs.highlightBlock(block);
            });
        }, 300);
    });
});



//在光标前插入字符串,暂时没用到
function InsertAtCursor(myField, myValue) {
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
}
//延迟执行最后一次调用的函数
var _timer = {};

function delay_till_last(id, fn, wait) {
    if (_timer[id]) {
        window.clearTimeout(_timer[id]);
        delete _timer[id];
    }

    return _timer[id] = window.setTimeout(function() {
        fn();
        delete _timer[id];
    }, wait);
}
