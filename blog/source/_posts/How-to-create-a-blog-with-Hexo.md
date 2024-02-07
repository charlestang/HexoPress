---
title: How to create a blog with Hexo?
permalink: ''
categories:
  - - Guide 手册
tags:
  - guide
excerpt: The guide to build a blog with Hexo.
date: 2024-02-07 10:56:45
updated: 2024-02-07 12:13:24
---
Creating a blog with Hexo requires a certain level of hands-on ability. This primarily refers to the need to type and execute commands in the command-line interface, and to respond appropriately when encountering errors. If you have a basic understanding of programming, it's quite straightforward.

I'll use the Mac operating system as an example because implementing this is simpler on Mac, as the command-line environment is relatively easier to use.

First, you need to install the NodeJS environment. Using the package manager Homebrew, type the following command in the command line:

```shell
brew install -g node
```

Next, we install the Hexo command-line interface:

```shell
npm install -g hexo-cli
```

After the installation is successful, you can start building your blog:

```shell
hexo init blog
```

The "blog" in the third part of the command above refers to the name of the directory. You can choose any name you like, such as using your domain name, like `hexo init blog.myname.com`.

Then, we install some dependency packages for the blog:

```shell
cd blog
npm install
```

Start the blog's web service:

```shell
hexo serve
```

You will then see a prompt in the command-line interface saying http://localhost:4000. This means a web service has been started on your computer, and you can access it directly with your browser. You will see the homepage of your blog, which already has an article explaining how to create a new post using Hexo.
