import { gql } from '@apollo/client';

export const GET_CURRENT_USER = gql`
    query GetCurrentUser {
        currentUser {
            id
            username
            email
            role
            createdAt
            updatedAt
        }
    }
`;

export const CHECK_AUTH = gql`
    query CheckAuth {
        checkAuth {
            isAuthenticated
            user {
                id
                username
                email
                role
            }
        }
    }
`;

export const GET_USER_PERMISSIONS = gql`
    query GetUserPermissions {
        userPermissions {
            canCreateRecipe
            canEditRecipe
            canDeleteRecipe
            canManageUsers
            canManageComments
        }
    }
`;
