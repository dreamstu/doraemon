# Doraemon

A CMD Module Build Tools（CMBT）

# 主要功能

1.自动包装define函数
2.自动分析依赖，解析重写依赖列表
3.自动混淆压缩
4.自动包装tpl模版

# 构建对象

适用于以node模块书写方式写的seajs模块的构建

# 如何使用
1.下载源码
- run bower install & npm install & grunt
- 利用  nw-app-builder 生成可执行文件
 - [nw-app-builder](https://github.com/dreamstu/nw-app-builder.git)
- 运行生成的可执行文件


# 写一个模块

1.可利用 `quickjs` 生成模块基本框架
2.编写模块实现内容
3.利用doraemon编译

# quickjs安装方法

-  使用淘宝镜像安装 [了解更多？](http://cnpmjs.org/) `npm install -g cnpm --registry=https://r.cnpmjs.org`
-  安装quickjs `cnpm install -g quickjs`
-  检查是否安装成功 `quick -v` 若安装成功则出现版本号
- 生成seajs模块
  - 新建一个目录并进入 `mkdir test && cd test`
  - 运行 `quick init` 安装提示进行输入，直到成功
- 构建seajs模块
  运行doraemon，指定模块所在的父级文件夹为待构建目录，并选择一个输出目录，配置好idleading点击构建按钮进行构建，构建过程会通过日志打印到你眼前！

# TODO
  ...
