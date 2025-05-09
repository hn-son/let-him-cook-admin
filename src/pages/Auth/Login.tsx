import React, {JSX} from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { LOGIN } from '../../graphql/mutations/authMutations';
import useAuthStore from '../../store/authStore';
import './Login.scss';

interface LoginFormValues {
    email: string;
    password: string;
}

const Login = (): JSX.Element => {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [loginMutation, { loading }] = useMutation(LOGIN);
    const [messageApi, contextHolder] = message.useMessage();

    const onFinish = async (values: LoginFormValues) => {
        try {
            const { data } = await loginMutation({
                variables: { input: values },
            });

            if (data?.login) {
                const { token, user } = data.login;
                login(user, token);
                messageApi.success('Login successful');
                navigate('/');
            } else {
                messageApi.error('Login failed');
            }

        } catch (error: any) {
            console.error(error)
            messageApi.error(error?.message || 'An error occurred');
        }
    };

    return (
        <div className="login-container">
            {contextHolder}
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
                        rules={[{ required: true, message: 'Please input your email!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Password"
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
                            Log in
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
