# 个人前端项目

[English](./README.md) | 中文

个人练习...，类似论坛类网站...

对之前项目进行优化重构 https://github.com/chcayan/forum

使用 monorepo 进行项目管理

本项目包含 web 端和 app 端，app 基于 uniapp 构建

---

## 技术栈

### 前端 (forum)：

- vue
- typescript

### 前端 (admin):

- react
- typescript

### 后端：

- node.js
- nest.js
- mysql

### app：

- uniapp

## 运行

安装依赖

```bash
pnpm i
```

修改后端配置 (apps/backend-by-nest/.env.development)

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpwd
DB_NAME=yourdbname
```

导入数据库文件 (database/forum.sql)

### 前后端 (forum + admin)

启动服务

```bash
pnpm dev
```

### 前后端 (仅启动 forum)

启动服务

```bash
pnpm dev:forum
```

### 前后端 (仅启动 admin)

启动服务

```bash
pnpm dev:admin
```

### app

启动后端服务

```bash
pnpm start:backend
```

使用HBuilderX运行uniapp项目

## 提示

- apps/backend 已弃用，后端项目现为 apps/backend-by-nest
- 默认管理员账号：admin@forum.com，密码：admin123

## 版本

- [forum](./docs/md/version/zh/forum.md)
- [admin](./docs/md/version/zh/admin.md)
- [app](./docs/md/version/zh/app.md)
