import { gql } from '@apollo/client';

export const LOGIN = gql`
    mutation Login($input: LoginInput!) {
        login(input: $input) {
            token
            user {
                id
                username
                email
                role
            }
        }
    }
`;

export const LOGOUT = gql`
    mutation Logout {
        logout {
            success
            message
        }
    }
`;

export const REGISTER = gql`
    mutation Register($input: RegisterInput!) {
        register(input: $input) {
            token
            user {
                id
                username
                email
                role
            }
        }
    }
`;

export const FORGOT_PASSWORD = gql`
    mutation ForgotPassword($email: String!) {
        forgotPassword(email: $email) {
            success
            message
        }
    }
`;

export const RESET_PASSWORD = gql`
    mutation ResetPassword($input: ResetPasswordInput!) {
        resetPassword(input: $input) {
            success
            message
        }
    }
`;
