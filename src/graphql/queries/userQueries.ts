import { gql } from "@apollo/client";

export const GET_USERS = gql`
    query GetUsers {
        users {
            id
            username
            email
            role
            createdAt
        }
    }
`