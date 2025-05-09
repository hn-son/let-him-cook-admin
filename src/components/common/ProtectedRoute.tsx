import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import MainLayout from '../layout/MainLayout';
import { useQuery } from '@apollo/client';
import { CHECK_AUTH } from '../../graphql/queries/authQueries';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, token, checkTokenValidity, logout } = useAuthStore();

    // Kiểm tra token có hợp lệ không (client-side)
    useEffect(() => {
        checkTokenValidity();
    }, [checkTokenValidity]);

    // Kiểm tra xác thực với server (để xử lý trường hợp server restart)
    // const { loading } = useQuery(CHECK_AUTH, {
    //     skip: !isValid, // Bỏ qua query nếu token không hợp lệ
    //     onCompleted: data => {
    //         if (!data.checkAuth.isAuthenticated) {
    //             logout();
    //         }
    //     },
    //     onError: () => {
    //         // Nếu có lỗi khi gọi API (ví dụ: server restart), logout
    //         logout();
    //     },
    // });

    // Đang kiểm tra token hoặc đang gọi API
    // if (isChecking || loading) {
    //     return <div>Loading...</div>; // Hoặc hiển thị spinner
    // }

    // Nếu không xác thực, chuyển hướng đến trang đăng nhập
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return <MainLayout>{children}</MainLayout>;
};

export default ProtectedRoute;
