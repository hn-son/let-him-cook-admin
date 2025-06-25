import { gql } from '@apollo/client';

export const ADD_COMMENT = gql`
    mutation AddComment($recipeId: ID!, $content: String!) {
        addComment(recipeId: $recipeId, content: $content) {
            id
            content
            author {
                username
                id
                email
                role
            }
            createdAt
        }
    }
`;

export const UPDATE_COMMENT = gql`
    mutation UpdateComment($id: ID!, $content: String!) {
        updateComment(id: $id, content: $content) {
            id
            content
            author {
                username
                id
                email
                role
            }
            createdAt
            updatedAt
        }
    }
`;

export const DELETE_COMMENT = gql`
    mutation DeleteComment($id: ID!) {
        deleteComment(id: $id) {
            deletedId        
            success
            message
            deleteBy
        }
    }
`;

export const MULTIPLE_DELETE_COMMENTS = gql`
    mutation MultipleDeleteComments($ids: [ID!]!) {
        deleteMultipleComments(commentIds: $ids) {
            deletedIds
            success
            message
            deletedCount
        }
    }
`;
