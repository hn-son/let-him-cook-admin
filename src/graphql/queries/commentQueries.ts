import { gql } from "@apollo/client";

export const GET_COMMENTS = gql`
    query GetComments($recipeId: ID!) {
        recipeComments(recipeId: $recipeId) {
            id
            content
            author {
                id
                username
            }
            createdAt
        }
    }
`