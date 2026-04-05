# Personal Frontend Project

English | [中文](./README.zh.md)

Personal practice..., forum-type websites...

Optimize and refactor previous projects: https://github.com/chcayan/forum

Using Monorepo for Project Management.

This project includes web, app, and desktop (Windows). The app is built on Uniapp, while the desktop is built on Electron

---

## Tech stack

### frontend (forum):

- vue
- typescript

### frontend (admin):

- react
- typescript

### backend:

- node.js
- nest.js
- mysql
- redis

### app:

- uniapp

### desktop：

- electron

## Run

Install dependencies.

```bash
pnpm i
```

> Note: Electron needs to be executed separately in this path
>
> ```bash
> pnpm i
> ```

Modify backend configuration (apps/backend-by-nest/.env.development).

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_pwd
DB_NAME=your_db_name
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_pass_word
```

Import database file (database/forum.sql).

### frontend/backend (forum + admin)

Start the service.

```bash
pnpm dev
```

### frontend/backend (only forum)

Start the service.

```bash
pnpm dev:forum
```

### frontend/backend (only admin)

Start the service.

```bash
pnpm dev:admin
```

### app

Start backend service.

```bash
pnpm start:backend
```

Run the Uniapp project using HBuilderX.

### desktop

Start electron related services.

```bash
pnpm start:electron:serve
```

Start Electron.

```bash
pnpm start:electron:app
```

## Tip

- "apps/backend" has been deprecated, and the backend project is now "apps/backend-by-nest".
- Default administrator account: admin@forum.com, Password: admin123

## Version

- [forum](./docs/md/version/en/forum.md)
- [admin](./docs/md/version/en/admin.md)
- [app](./docs/md/version/en/app.md)
- [desktop](./docs/md/version/en/desktop.md)
