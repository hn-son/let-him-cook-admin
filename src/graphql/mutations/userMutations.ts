import { gql } from '@apollo/client';

export const CREATE_USER = gql`
    mutation CreateUser($input: RegisterInput!) {
        register(input: $input) {
            token
            user {
                id
                username
                email
            }
        }
    }
`;

export const UPDATE_USER = gql`
    mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
        updateUser(id: $id, input: $input) {
            id
            username
            email
            role
            createdAt
        }
    }
`;

export const DELETE_USER = gql`
    mutation DeleteUser($id: ID!) {
        deleteUser(id: $id) {
            success
            message 
        }
    }
`;
