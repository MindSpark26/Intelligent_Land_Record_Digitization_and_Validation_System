# assets/

Assets that are **imported into components** (e.g. `import logo from
'@/assets/logo.svg'`) so the bundler can hash and optimize them.

Note: statically served files (referenced by URL like `/banner.jpg`) belong in
the top-level [`public/`](../../public) directory instead — that's a Next.js
convention and `public/banner.jpg` is already used that way by the dashboard.
