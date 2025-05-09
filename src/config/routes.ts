import React, { JSX, lazy } from 'react';


const Login = lazy(() => import('../pages/Auth/Login'))
const RecipeList = lazy(() => import('../pages/Recipes/RecipeList'))
const UserList = lazy(() => import('../pages/Users/UserList'))

interface Route {
    path: string;
    component: React.LazyExoticComponent<() => JSX.Element>;
    exact?: boolean;
    protected?: boolean;
}

const routes: Route[] = [
    {
        path: '/login',
        component: Login,
        exact: true,
        protected: false,
    },
    {
        path: '/',
        component: RecipeList,
        exact: true,
        protected: true,
    },
    {
        path: '/recipes',
        component: RecipeList,
        exact: true,
        protected: true,
    },
    {
        path: '/users',
        component: UserList,
        exact: true,
        protected: true,
    }
];

export default routes;