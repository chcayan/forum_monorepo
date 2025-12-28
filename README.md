# 个人前端项目

个人练习...，类似论坛类网站...

对之前项目进行优化重构 https://github.com/chcayan/forum

使用monorepo进行项目管理

本项目包含web端和app端，app基于uniapp构建

## 技术栈

### 前端：

- vue
- typescript

### 后端：

- node.js
- express
- mysql

### app端：

- uniapp

## 运行

### web端

安装依赖

```bash
pnpm i
```

安装全局依赖

```bash
pnpm i -g tsc tsc-alias
```

修改后端配置(.env.development)

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpwd
DB_NAME=yourdbname
```

导入数据库文件：/database/forum.sql

启动服务

```bash
pnpm dev
```

### app端

启动后端服务

在/backend下执行

```bash
pnpm dev
```

使用HBuilderX运行uniapp项目

## 版本

### version: 2.0.0 (251116)

重构版本，当前版本内容：

- 帖子：发布，公开/非公开，删除，收藏，评论，搜索
- 用户：登录，注册，关注，聊天，编辑个人信息
- UI: 浅深切换

重构版本优化内容：

- 新的UI设计
- 新增残废的无障碍支持
- 优化聊天弹窗
- 优化图片上传
- 修复关注功能问题
- 优化帖子信息更新逻辑
- more...

### version: 2.0.1 (251118)

当前版本变更：

- 修复在某些场景下获取不到帖子问题
- 修复404页面按钮在深色模式下字体颜色问题

### version: 2.1.0 (251118)

当前版本变更：

- 新增分享功能

### version: 2.2.0 (251127)

当前版本变更：

- 新增ai聊天
- 优化部分样式

### version 2.3.0 (251228)

当前版本变更（web）：

- 修复部分样式问题
- 修改重复进入用户页面数据不刷新问题

使用uniapp构建app端，版本与web端同步

app端功能与web端差异如下：

- app端主题只跟随系统
- app端无法对弹窗信息进行回复
- 两端部分场景下样式差异
- app端没有皮卡丘?
