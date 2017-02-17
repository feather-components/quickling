Quickling
===================

该quickling插件是给feather2系列框架所提供的一种架构方式，可结合feather2中的pagelet进行架构性能优化，将页面上符合条件的链接都转成ajax加载，并且可解决ajax带来的浏览器前进回退问题。

### 安装

```sh
feather2 install feather-components/quickling
```

### 使用

index.html

```html
<html>
<head>
</head>

<body>
    <ul id="ajaxify-menu">
    <li><a href="/pagelet/1" class="quickling">菜单1</a></li>
    <li><a href="/pagelet/2" class="quickling">菜单2</a></li>
    </ul>

    <div id="ajaxify-container"></div>

    <script>
    require.async('quickling', function(Quickling){
        Quickling('a.quickling', '#ajaxify-container').on('send:before', function(url){
            //通过url做一些处理逻辑，比如，给对应的菜单加上状态
            console.log(arguments);
        }).on('send:back', function(){
            console.log(arguments);
        }).on('empty', function(){
            alert('empty');
        }).on('go', function(url, from){
            console.log(url, from);
        }).cache(10 * 1000 /*当前进后退时，内容缓存10秒*/)
    });
    </script>
</body>
</html>
```

### Api

* Quickling(selector:符合条件的选择器, container:加载内容的容器): 初始化
* listen(container): 手动监听元素中符合条件的链接
* clear(container, removeChild/*是否删除子元素*/)：移除监听
* load(url, force:强制清空缓存)：手动加载一个url
* on(event, callback): 监听自定义事件
* trigger(event, data)：手动触发事件
* cache(expires:超时时间)：设置是否缓存，false时为不缓存

### 预设事件

* send:before：  发送前执行
* send:back： 内容加载成功后执行
* cache:back：使用缓存内容执行后
* go：页面hash产生变化时
* empty：url为空时执行

##注：对于js动态生成的a标签，则可以通过指定href值为hashbang的方式，进行加载， 如

```html
<a href="#!abc/def">我是js动态生成的a标签</a>
```