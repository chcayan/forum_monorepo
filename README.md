# 个人前端项目

个人练习...，类似论坛类网站...

对之前项目进行优化重构 https://github.com/chcayan/forum

使用monorepo进行项目管理

## 技术栈

### 前端：

- vue
- typescript

### 后端：

- node.js
- express
- mysql

## 运行

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

启动服务

```bash
pnpm dev
```

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

- 修复在生产环境下/my页面获取不到帖子问题
- 修复404页面按钮在深色模式下字体颜色问题

### version: 2.1.0 (251118)

当前版本变更：

- 新增分享功能
