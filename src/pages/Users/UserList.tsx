import React, { useState } from 'react';
import { Table, Button, Space, Modal, message, Card, Typography, Tooltip, Popconfirm } from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    UserOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USERS } from '../../graphql/queries/userQueries';
import { CREATE_USER, UPDATE_USER, DELETE_USER } from '../../graphql/mutations/userMutations';
import UserForm from './UserForm';
import dayjs from 'dayjs';
import './UserList.scss';

const { Title } = Typography;
const { confirm } = Modal;

const UserList: React.FC = () => {
    const [formVisible, setFormVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [formTitle, setFormTitle] = useState('Thêm người dùng mới');

    // GraphQL Queries & Mutations
    const { loading: queryLoading, error: queryError, data, refetch } = useQuery(GET_USERS);

    const [createUser, { loading: createLoading }] = useMutation(CREATE_USER, {
        onCompleted: () => {
            message.success('Người dùng đã được tạo thành công');
            setFormVisible(false);
            refetch();
        },
        onError: error => {
            message.error(`Lỗi khi tạo người dùng: ${error.message}`);
        },
    });

    const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_USER, {
        onCompleted: () => {
            message.success('Người dùng đã được cập nhật thành công');
            setFormVisible(false);
            refetch();
        },
        onError: error => {
            message.error(`Lỗi khi cập nhật người dùng: ${error.message}`);
        },
    });

    const [deleteUser, { loading: deleteLoading }] = useMutation(DELETE_USER, {
        onCompleted: () => {
            message.success('Người dùng đã được xóa thành công');
            refetch();
        },
        onError: error => {
            message.error(`Lỗi khi xóa người dùng: ${error.message}`);
        },
    });

    // Handlers
    const handleAddUser = () => {
        setSelectedUser(null);
        setFormTitle('Thêm người dùng mới');
        setFormVisible(true);
    };

    const handleEditUser = (user: any) => {
        setSelectedUser(user);
        setFormTitle(`Chỉnh sửa người dùng: ${user.username}`);
        setFormVisible(true);
    };

    const showDeleteConfirm = (user: any) => {
        confirm({
            title: 'Bạn có chắc chắn muốn xóa người dùng này?',
            icon: <ExclamationCircleOutlined />,
            content: `Người dùng: ${user.username} (${user.email}) sẽ bị xóa vĩnh viễn.`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                handleDeleteUser(user.id);
            },
        });
    };

    const handleDeleteUser = async (id: string) => {
        try {
            await deleteUser({ variables: { id } });
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleFormSubmit = async (values: any) => {
        try {
            if (selectedUser) {
                // Nếu không có mật khẩu mới, loại bỏ trường password
                if (!values.password) {
                    const { password, ...dataWithoutPassword } = values;
                    await updateUser({
                        variables: {
                            id: selectedUser.id,
                            input: dataWithoutPassword,
                        },
                    });
                } else {
                    await updateUser({
                        variables: {
                            id: selectedUser.id,
                            input: values,
                        },
                    });
                }
            } else {
                await createUser({
                    variables: {
                        input: values,
                    },
                });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    // Table columns
    const columns = [
        {
            title: 'Tên người dùng',
            dataIndex: 'username',
            key: 'username',
            render: (text: string) => <strong>{text}</strong>,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => (
                <span className={`user-role user-role-${role}`}>
                    {role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                </span>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text: string) => {
                const date = new Date(Number(text));
                // Format as DD/MM/YYYY
                return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
                    .toString()
                    .padStart(2, '0')}/${date.getFullYear()}`;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: any, record: any) => (
                <div className="action-buttons">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => handleEditUser(record)}
                        >
                            Sửa
                        </Button>
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa người dùng này?"
                            onConfirm={() => handleDeleteUser(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                loading={deleteLoading}
                            >
                                Xóa
                            </Button>
                        </Popconfirm>
                    </Tooltip>
                </div>
            ),
        },
    ];

    if (queryError) {
        return <div>Error loading users: {queryError.message}</div>;
    }

    return (
        <div className="user-list-container">
            <Card>
                <div className="user-list-header">
                    <Title level={3}>
                        <UserOutlined /> Quản lý người dùng
                    </Title>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddUser}
                        size="large"
                    >
                        Thêm người dùng
                    </Button>
                </div>
                <Table
                    columns={columns}
                    dataSource={data?.users}
                    rowKey="id"
                    loading={queryLoading}
                    pagination={{
                        pageSize: 10,
                    }}
                />
            </Card>

            <UserForm
                visible={formVisible}
                title={formTitle}
                initialValues={selectedUser}
                onSubmit={handleFormSubmit}
                onCancel={() => setFormVisible(false)}
                loading={createLoading || updateLoading}
            />
        </div>
    );
};

export default UserList;
