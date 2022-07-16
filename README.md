# 1 安装

```shell
# 安装
$ npm --registry=https://registry.npm.taobao.org/ install bpuns-cli -g
# 查看是否安装成功
$ bp version
```

# 2 源码调试
##  2.1	windows

```shell
# 拉取仓库
$ git clone git@gitee.com:bpuns/bpuns-cli.git
# 进入文件夹
$ cd bpuns-cli
# 安装依赖
$ npm i
# 编译源码
$ npx tsc --project tsconfig.json
# 处理路径别名
$ npx tsc-alias
# 链接调试
$ npm link
# 测试是否成功
$ bp version
```

如果需要修改源码，任一编辑器打开，接着在控制台运行如下命令

```shell
$ bp dev
```

##  2.2	linux

```shell
$ su root
# 拉取仓库
$ git clone git@gitee.com:bpuns/bpuns-cli.git
# 进入文件夹
$ cd bpuns-cli
# 安装依赖
$ npm i
# 编译源码
$ npx tsc --project tsconfig.json
# 处理路径别名
$ npx tsc-alias
# 链接调试
$ npm link
# 测试是否成功
$ bp version
```

如果需要修改源码，任一编辑器打开，接着在控制台运行如下命令

```shell
$ bp dev
```

## 2.3	ＭacOS

未适配`ＭacOS`



# 3 功能

## 3.1  一般功能

### 3.1.1	提示

```shell
$ bp tip
```

### 3.1.2	版本

```shell
$ bp version
```

### 3.1.3	当前脚本所在目录

```shell
$ bp pwd
```

### 3.1.4	修改文件时间

```shell
$ bp utime
$ bp utime 2020-10-10 10:10:10
```



## 3.2	删除

### 3.2.1	快速删除文件

```shell
# 删除 a文件
$ bp smash a

# 删除 a文件 b文件 c.js文件
$ bp smash a b c.js

# 删除 当前目录下的所有文件
$ bp smash *
```

### 3.2.2	创建测试文件

```
$ bp smash -t
```

## 3.3	项目相关

### 3.3.1	创建项目

```shell
$ bp create 项目名
```

### 3.3.2	启动项目

```shell
$ bp s
```

### 3.3.3	打包项目

```shell
$ bp b
```

### 3.3.4	更改npm

```shell
$ bp npm use taobao
```

### 3.3.5	添加npm

```shell
$ bp npm add taobao 'http://aaaaaaaaa'
```



## 3.4	杂

### 3.4.1	解除某个端口的占用

```shell
$ bp kill 3000
```

### 3.4.2	去除图片的结尾随机乱码

```shell
$ bp qc 
```

### 3.4.3	修改文件时间

```shell
$ bp utime [yyyy-MM-dd HH:mm:ss (不传就是系统时间)]
```

### 3.4.4	开发bp

```shell
$ bp dev
```

### 3.4.5	快速打开某个项目

```shell
# 快速打开某个项目
$ bp fast 项目名
# 添加某个快速打开索引
$ bp fast add smzq 'c://xasdasdas/adas/asdas/dasdas/sadas'
# 移除某个快速打开索引
$ bp fast remove smzq
# 查看现在快速打开的列表
$ bp fast ls
```

## 3.5	寻找命令

输入以下命令

```shell
$ bp [任意命令]
```

`bp`会先寻找当前目录下`package.json`中的`script`，如果找到的话，就自动执行，否则报错
