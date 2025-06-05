import { gql } from '@apollo/client';

export const ADD_COMMENT = gql`
    mutation AddComment($recipeId: ID!, $content: String!) {
        addComment(recipeId: $recipeId, content: $content) {
            id
            content
            author
            createdAt
        }
    }
`;
