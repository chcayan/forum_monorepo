# Personal Frontend Project

English | [中文](./README.zh.md)

Personal practice..., forum-type websites...

Optimize and refactor previous projects: https://github.com/chcayan/forum

Using Monorepo for Project Management.

This project includes both web and app versions, with the app built on Uniapp.

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

### app:

- uniapp

## Run

Install dependencies.

```bash
pnpm i
```

Modify backend configuration (apps/backend-by-nest/.env.development).

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpwd
DB_NAME=yourdbname
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

## Tip

- "apps/backend" has been deprecated, and the backend project is now "apps/backend-by-nest".
- Default administrator account: admin@forum.com, Password: admin123

## Version

- [forum](./docs/md/version/en/forum.md)
- [admin](./docs/md/version/en/admin.md)
- [app](./docs/md/version/en/app.md)
