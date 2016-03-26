#LanEditor
一个轻量，简单的markdown在线编辑器

##用途
- 为个人博客提供一个友好的快速文章发布编辑器
- 不需要臃肿的专业编辑器，随时打开，随时编辑，把灵感记录下来
- 语法提示,自动补全,尤其适合软件技术类的文章发布,(PS:我编写这个编辑器就是为了方便自己的博客发布文章)

##LanEditor快速指南

LanEditor是一个在线编辑器，它适合编写Markdown，并且提供即时预览。除此之外，它可以编辑任何文本文件。

它是免费的，并且所有代码开源。你可以使用提供的API对它进行二次开发或是个性化，而这一切都非常简单。

因为，LanEditor设计之初就是这样的！

* <a href='http://lanfly.github.io/laneditor/doc' target='_blank'>http://lanfly.github.io/laneditor/doc</a>
 
 这是LanEditor文档，你可以在这里详细的了解它。
 
* <a href='https://github.com/EcjtuNet/LanEditor' target='_blank'>https://github.com/EcjtuNet/LanEditor</a>

 这是LanEditor的github项目地址，你可以在这下载最新的代码。

##LanEditor有哪些功能？

1. 多文件管理,在多个文件之间轻松切换,随意编辑
2. 实时自动保存，保证信息不丢失
3. 永久保存,包含年月日-时分秒创建日期信息
4. 符号，缩进，关键词自动补全,自定义关键词
5. 个性化代码高亮和皮肤，全听你的
6. 关键字提示框光标跟随，动画效果
7. 简洁的菜单,可关闭|打开动画
8. markdown实时预览，可选择导出md和HTML两种格式

##如何开始？

demo：[LanEditor online](http://lanfly.github.io/laneditor/) 本页面长期维护，所以你可以随时打开编辑。

**注意！编辑的文件由你的浏览器保存在本地硬盘，它是永久保存的，除非你手动清除了。**

1. ####打开菜单

 * 在编辑区里按下```ESC```键，将会显示```文件菜单```，点击相应的文件名打开并编辑该文件。

 * 不用担心保存问题，LanEditor会```即时保存```你的每一次编辑。
 
 * 在菜单界面，再次按```ESC```键会关闭菜单，你可以继续编辑。

2. ####新建文件

 * 按下```ESC```打开菜单，在```输入框```里输入文件名，点击右边的```新建```按钮，此时文件列表就会多出一项。点击刚刚新建的文件名进行编辑。
 
 * 你可以点击文件名右边的```删除```按钮删除该文件。注意！删除操作没有确认提示，且无法恢复。
 
 * 鼠标放在文件名右边的```日期```按钮上，稍等片刻，将会显示文件详细的创建日期，包括年月日-时分秒。

3. ####下载文件

 * 点击文件名右边的```HTML```按钮，可以下载```带样式```的HTML文件。在弹出的对话框中输入文件名，确定即可。不必带上.html后缀名。
 
 * 点击```MD```按钮，将会下载```markdown```原文件。同样的，文件名不需带上.md后缀名。

4. ####选项设置

 * LanEditor的其中一个特点就是具有```关键字提示```和```自动补全```功能。此外，它还带有酷炫的动画效果。
 你可以选择关闭或打开这项功能。
 
 * 打开菜单，点击```选项设置```面板，点击相应的项可以打开或关闭该项功能。
 
 * 选项右边的开关为```蓝色```表示该功能处于打开状态，```灰色```表示处于关闭状态。

##特色功能

这些功能需要你的浏览器提供支持，```IE```系浏览器请不要尝试，因为我也不知道它将会出现怎样的怪异行为。

只要你的浏览器是现代的，且不那么古老，一般都可以很好的工作。

1. ####代码提示

 * LanEditor默认内置了HTML、CSS、JavaScript语言的代码提示。
 
 * 在英文状态下输入字符，LanEditor将会快速的查找语法库，并将匹配的结果集以提示框的形式出现。
 
 * 如果未找到匹配的结果，它什么也不会做。
 
 * 在出现提示框后，你可以使用```上下方向键```来选择项，按下```回车```将会自动帮你补全被选择的项。

2. ####符号补全和缩进

 * LanEditor会自动把你补全可以成对出现的符号、单引号、双引号。
 * 你只需输入一个左括号，它会自动帮你把右括号补全，并且将光标定位在括号中间。
 * LanEditor会自动帮你在新行缩进，缩进量和上一行相同。
 
3. ####代码高亮

使用

```text
 ```language
    //code here
 ```
```

将代码块包裹起来，language是语言的名字。LanEditor会调用highlight进行高亮渲染。就像下面这样：

```js
<script type="text/javascript">
    $(document).ready(function(){
        var lan = LanEditor.init({
            textelem: "editor",
            showelem: "show",
            PluginsMode: false
        });
        if(lan.status == false){
            alter(lan.message);
            return ;
        }
    });
</script>
```

##问题反馈
在使用中有任何问题，欢迎反馈给我。下面是我的联系方式：

* 邮件 [bluescode@outlook.com](mailto:bluescode@outlook.com)
* QQ 1260022720

请注明LanEditor

##捐助开发者

在兴趣的驱动下,写一个免费的东西，有欣喜，更多的是汗水，希望你们喜欢我的作品，同时也能支持一下。 当然，有钱捧个钱场（支付宝扫描下面的二维码），没钱捧个人场，谢谢各位。

请我喝杯咖啡吧！ O(∩_∩)O谢谢

![啊哦！这二维码被偷吃了，请通过QQ或邮件和我联系](http://lanfly.github.io/alipay.jpg)




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