import React, {JSX} from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { LOGIN } from '../../graphql/mutations/authMutations';
import useAuthStore from '../../store/authStore';
import './Login.scss';
import { useMessage } from '../../components/provider/MessageProvider';

interface LoginFormValues {
    email: string;
    password: string;
}

const Login = (): JSX.Element => {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [loginMutation, { loading }] = useMutation(LOGIN);
    const messageApi = useMessage();

    const onFinish = async (values: LoginFormValues) => {
        try {
            const { data } = await loginMutation({
                variables: { input: values },
            });

            if (data?.login) {
                const { token, user } = data.login;
                login(user, token);
                messageApi.success('Đăng nhập thành công');
                navigate('/');
            } else {
                messageApi.error('Đăng nhập thất bại. Sai thông tin đăng nhập');
            }

        } catch (error: any) {
            console.error(error)
            messageApi.error(error?.message || 'An error occurred');
        }
    };

    return (
        <div className="login-container">
            <Card className="login-card">
                <div className="login-logo">Let Him Cook Admin</div>
                <Form
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        name="email"
                        rules={[{ required: true, message: 'Hãy nhập email!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Hãy nhập mật khẩu!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Mật khẩu"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            size="large"
                        >
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
