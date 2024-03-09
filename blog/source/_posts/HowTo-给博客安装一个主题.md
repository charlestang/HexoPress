---
title: '[HowTo] 给博客安装一个主题'
permalink: howto-install-a-theme-for-blog-cn/
categories:
  - - Guide 手册
tags:
  - guide
date: 2024-03-09 12:01:00
updated: 2024-03-09 17:19:23
---
Hexo 的博客安装后，会自带一套皮肤，`landsacpe`，如果样式不满足您的需要，可以自行安装喜欢的皮肤。

Hexo 有庞大的社区，很多作者贡献了皮肤和插件。博客皮肤下载后，解压到 Hexo 博客的 `themes` 目录，
就算安装成功了。

比如，著名的皮肤，NexT，安装的时候，可以先进入目录，然后使用 git 克隆版本库：

```shell
cd themes
git clone https://github.com/next-theme/hexo-theme-next next
```

如果你使用 git 管理自己的 Hexo 博客，也可以像我一样用 git 的 submodule 来管理皮肤。比如，您的
博客目录已经置于 git 的管理之下，在博客的根目录，执行：

```shell
git submodule add themes/next https://github.com/next-theme/hexo-theme-next
```

就可以将皮肤 NexT 添加为一个子模块。

还有一种安装方法，是使用 node 的包管理器 npm：

```shell
npm install hexo-theme-next
```

会以 npm 包的方式安装 NexT theme。

这款皮肤也支持一些自定义的功能，通过配置文件来设置。在 `themes/next/` 目录里，会有一份配置文件，但是，不推荐使用目录的配置文件，可以使用 Hexo 博客根目录里的配置文件，比如 `_config.yml` 这是 Hexo 的配置文件，`_config.next.yml` 则是主题 NexT 的配置文件。

这样，如果你是用 Git 或者 npm 包方式使用 NexT 皮肤，以后就可以使用 npm upgrade 或者 git pull & git checkout 进行主题的升级。因为你没有修改主题的源码。




