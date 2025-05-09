import { gql } from '@apollo/client';

export const CREATE_RECIPE = gql`
    mutation CreateRecipe($input: RecipeInput!) {
        createRecipe(input: $input) {
            id
            title
            description
            ingredients {
                name
                quantity
                unit
            }
            steps
            author {
                username
            }
            createdAt
            updatedAt
        }
    }
`;

export const UPDATE_RECIPE = gql`
    mutation UpdateRecipe($id: ID!, $input: RecipeInput!) {
        updateRecipe(id: $id, input: $input) {
            id
            title
            description
            ingredients
            steps
            imageUrl
            author            
            createdAt
            updatedAt
        }
    }
`;

export const DELETE_RECIPE = gql`
    mutation DeleteRecipe($id: ID!) {
        deleteRecipe(id: $id) 
    }
`;
