---
title: '[HowTo] 用 Hexo 建立一个博客'
permalink: howto-build-a-blog-with-hexo-cn/
categories:
  - - Guide 手册
tags:
  - guide
excerpt: 怎样使用 Hexo 建立一个博客。
date: 2024-02-07 10:44:28
updated: 2024-03-09 17:18:54
---
使用 Hexo 创建一个博客，需要您有一定的动手能力。这主要指的，需要在命令行界面上，键入指令并执行， 如果遇到错误，可以做出适当的应对。如果您有编程的基础知识，对您来说是非常简单的。

我会以 Mac 操作系统作为例子，因为在 Mac 上实现这一切更为简单，因为 Mac 操作系统的命令行环境相对来说更容易使用。

首先，您需要安装 NodeJS 的环境，利用包管理器 Homebrew，在命令行键入指令：

```shell
brew install -g node
```

接着，我们安装 Hexo 的命令行界面：

```shell
npm install -g hexo-cli
```

安装成功后，就可以开始建立 blog 了，首先初始化一个博客的目录：

```shell
hexo init blog
```

上面指令的第三部分 blog，指的是目录的名字，您可以取喜欢的名字，比如用您的域名也是可以的，如 `hexo init blog.myname.com` 这样。

然后，我们安装 blog 的一些依赖软件包：

```shell
cd blog
npm install
```

启动博客的 web 服务：

```shell
hexo serve
```

然后我们看到命令行界面提示 `http://localhost:4000` ，这是在您电脑上启动了一个 web 服务，您可以用浏览器直接访问。就会看到您博客的首页，上面已经有一篇文章了，介绍了如何使用 Hexo 创建新文章的方法。
