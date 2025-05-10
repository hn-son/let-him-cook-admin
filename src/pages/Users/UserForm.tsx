import React, { useEffect } from 'react';

import { Form, Input, Button, Modal, Select, Divider, Typography } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, TeamOutlined } from '@ant-design/icons';
import './UserForm.scss';

const { Title } = Typography;

interface UserFormValues {
    initialValues?: any;
    onSubmit: (values: any) => Promise<void>;
    loading: boolean;
    title: string;
    visible: boolean;
    onCancel: () => void;
}

const UserForm: React.FC<UserFormValues> = ({
    initialValues,
    onSubmit,
    loading,
    title,
    visible,
    onCancel,
}) => {
    const [form] = Form.useForm();
    const isEditMode = !!initialValues;

    useEffect(() => {
        if (visible) {
            form.setFieldsValue({
                username: initialValues?.username || '',
                email: initialValues?.email || '',
                role: initialValues?.role || 'user',
                password: '',
            });
        }
    }, [form, visible, initialValues]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await onSubmit(values);
            form.resetFields();
        } catch (error) {
            console.error('Form validation error:', error);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    const roleOptions = [
        { value: 'user', label: 'Người dùng' },
        { value: 'admin', label: 'Quản trị viên' },
    ];

    return (
        <Modal
            title={<Title level={4}>{title}</Title>}
            open={visible}
            onCancel={handleCancel}
            width={500}
            centered
            destroyOnClose
            className="user-form-modal"
            maskClosable={false}
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    Hủy bỏ
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
                    {isEditMode ? 'Cập nhật' : 'Tạo mới'}
                </Button>,
            ]}
        >
            <Divider />
            <Form
                form={form}
                layout="vertical"
                requiredMark="optional"
                validateMessages={{
                    required: '${label} là trường bắt buộc!',
                    types: {
                        email: '${label} không đúng định dạng!',
                    },
                }}
            >
                <Form.Item name="username" label="Tên người dùng" rules={[{ required: true }]}>
                    <Input
                        prefix={<UserOutlined className="site-form-item-icon" />}
                        placeholder="Nhập tên người dùng"
                    />
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Email"
                    rules={[{ required: true }, { type: 'email' }]}
                >
                    <Input
                        prefix={<MailOutlined className="site-form-item-icon" />}
                        placeholder="Nhập email"
                    />
                </Form.Item>
                <Form.Item
                    name="password"
                    label="Mật khẩu"
                    rules={[
                        {
                            required: !initialValues,
                            message: 'Vui lòng nhập mật khẩu',
                        },
                        {
                            min: 6,
                            message: 'Mật khẩu phải có ít nhất 6 ký tự',
                        },
                    ]}
                    extra={initialValues ? 'Để trống nếu không muốn thay đổi mật khẩu' : ''}
                >
                    <Input.Password
                        prefix={<LockOutlined className="site-form-item-icon" />}
                        placeholder={
                            initialValues ? 'Nhập mật khẩu mới (tùy chọn)' : 'Nhập mật khẩu'
                        }
                    />
                </Form.Item>
                <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
                    <Select
                        options={roleOptions}
                        placeholder="Chọn vai trò"
                        suffixIcon={<TeamOutlined />}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UserForm;
