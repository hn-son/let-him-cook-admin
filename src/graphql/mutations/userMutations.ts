import { gql } from '@apollo/client';

export const CREATE_USER = gql`
    mutation register($input: UserInput!) {
        token,
        user {
            id
            username
            email
        }
    }
`


export const UPDATE_USER = gql`
    mutation UpdateUser($id: ID!, $input: UserInput!) {
        updateUser(id: $id, input: $input) {
            id
            username
            email
            role
            createdAt
        }
    }
`

export const DELETE_USER = gql`
    mutation DeleteUser($id: ID!) {
        deleteUser(id: $id) {
            id
            username
        }
    }
`