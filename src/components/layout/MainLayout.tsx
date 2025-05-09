import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    DashboardOutlined,
    BookOutlined,
    CommentOutlined,
    UserOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import './MainLayout.scss'

const { Header, Content, Sider } = Layout;

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        {
            key: '/recipes',
            icon: <BookOutlined />,
            label: <Link to="/recipes">Danh sách món ăn</Link>,
        },
        // {
        //     key: '/comments',
        //     icon: <CommentOutlined />,
        //     label: <Link to="/comments">Comments</Link>,
        // },
        {
            key: '/users',
            icon: <UserOutlined />,
            label: <Link to="/users">Tài khoản</Link>,
        },
    ];

    const userMenuItems = [
        // {
        //     key: 'profile',
        //     label: 'Profile',
        //     icon: <UserOutlined />,
        // },
        {
            key: 'logout',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            onClick: handleLogout,
        },
    ];

    return (
        <Layout className="main-layout">
            <Sider trigger={null} collapsible collapsed={collapsed} width={250}>
                <div className="logo">{!collapsed ? 'Let Him Cook Admin' : 'LHC'}</div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                />
            </Sider>
            <Layout className="site-layout">
                <Header className="site-header">
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                    />
                    <div className="header-right">
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                            <div className="user-info">
                                <span className="user-name">{user?.username}</span>
                                <Avatar icon={<UserOutlined />} />
                            </div>
                        </Dropdown>
                    </div>
                </Header>
                <Content className='site-content'>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
