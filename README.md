# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
let-him-cook-admin/
├── node_modules/
├── public/
├── src/
│   ├── assets/            # Hình ảnh, icons, và các tài nguyên tĩnh
│   ├── components/        # Các component tái sử dụng
│   │   ├── common/        # Component dùng chung (Button, Card, etc.)
│   │   ├── forms/         # Form components
│   │   └── ui/            # UI components
│   ├── graphql/           # GraphQL queries và mutations
│   │   ├── fragments/     # GraphQL fragments
│   │   ├── mutations/     # GraphQL mutations
│   │   └── queries/       # GraphQL queries
│   ├── hooks/             # Custom React hooks
│   ├── layouts/           # Layout components
│   │   ├── auth/          # Layout cho trang đăng nhập
│   │   └── main/          # Layout chính cho dashboard
│   ├── pages/             # Các trang của ứng dụng
│   │   ├── auth/          # Trang đăng nhập
│   │   ├── comments/      # Quản lý bình luận
│   │   ├── dashboard/     # Trang dashboard
│   │   ├── recipes/       # Quản lý công thức
│   │   └── users/         # Quản lý người dùng
│   ├── services/          # Services và API calls
│   ├── store/             # Zustand stores
│   ├── styles/            # SCSS styles
│   │   ├── base/          # Base styles
│   │   ├── components/    # Component styles
│   │   ├── layouts/       # Layout styles
│   │   └── pages/         # Page-specific styles
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main App component
│   ├── main.tsx           # Entry point
│   └── vite-env.d.ts      # Vite environment types
├── .eslintrc.cjs
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts

