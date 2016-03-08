#LanEditor
>    一个轻量，简单的markdown在线编辑器

###用途
>    - 为个人博客提供一个友好的快速文章发布编辑器
>    - 不需要臃肿的专业编辑器，随时打开，随时编辑，把灵感记录下来
>    - 语法提示,自动补全,尤其适合软件技术类的文章发布,(PS:我编写这个编辑器就是为了方便自己的博客发布文章)

###特点
>    1. 只需要简单的几步即可在你的页面上创建一个编辑器
>    2. 符号，缩进，关键词自动补全,自定义关键词
>    3. markdown实时预览，可选择导出md和HTML两种格式
>    5. 关键字提示框光标跟随，动画效果
>    6. 实时自动保存，保证信息不丢失
>    7. 多文件管理,在多个文件之间轻松切换,随意编辑
>    8. 永久保存,年月日-时分秒创建日期
>    7. 简洁的菜单,可关闭|打开动画
>    4. 插入图片和表情(不知道要不要这个功能 -_-||)
>    9. 使用第三方markdown渲染器和highlight渲染器,可自己根据喜好替换

###使用方法
>    1. 如果当前文件未保存，会提示保存
>    2. 在任意元素按ESC弹出菜单
>    3. 输入字符后会自动匹配关键字，显示所有匹配到的结果，按方向键上下选择，按回车键选定，提示框自动消失

#开始

>    为获得良好的体验,请在支持`html5`和`css3`的现代浏览器中使用


### 1. 快速安装

安装非常简单，只需要2步：

1.**javascript代码**

```js
<script type="text/javascript">
    $(document).ready(function(){
        //初始化 @textelem:编辑区的id @showelem:显示HTML的id
        var lan = LanEditor.init({
            textelem: "editor",
            showelem: "show"
        });
        //如果初始化失败，则显示出错信息
        if(lan.status == false){
            alter(lan.message);
            return ;
        }
    });
</script>

```

2.**HTML代码**

```html
<textarea id="editor" name="editor"></textarea>

<div id="show"></div>
```

> **_注意_**
>
> textelem:"editor" `<textarea>`的`id`名，不带`#`
>
> showelem:"show" 显示渲染后的HTML的`id`,也是不带`#`，一般用div作为容器

不出意外，你就可以使用LanEditor进行编辑了。它会自动渲染。如果你是拿来二次开发，只需要一个编辑器就可以，那么你可以省略`showelem`参数，此时它将不会自动渲染，你可以使用提供的API接口获取渲染的结果。就像这样:

```js
<script type="text/javascript">
    $(document).ready(function(){
        //初始化 @textelem:编辑区的id @showelem可以省略
        var lan = LanEditor.init({
            textelem: "editor"
        });
        //如果初始化失败，则显示出错信息
        if(lan.status == false){
            alter(lan.message);
            return ;
        }
        //获取渲染后的HTML
        var html = LanEditor.GetRenderHTML();
    });
</script>
```

### 2. 引入必要的文件

1. jquery.js

   这个自不必说，首先就引入它

2. LanEditor.min.js

   这个也不必说，你要使用它当然要这个文件啦，这个文件需要在jquery之后引入，因为它依赖于jquery

3. LanEditor.min.css

   这个也是需要滴！它定义了菜单和提示框的样式，少了它，可不能正常使用了
   
有上面三个文件就可以正常运行了！

### 3. 代码高亮

如果你想让代码高亮，这样看起来很酷，那么你还需要一个文件，那就是：

`highlight/*.css`

你可以在`highlight`文件夹下找到很多css文件，它们的作用都是代码高亮，有不同风格，你可以根据自己的风格喜好替换。甚至你自己编辑文件指定样式。

欢迎有兴趣的童鞋和我一起完善这个编辑器，推送代码请先和我联系 `QQ:1260022720`