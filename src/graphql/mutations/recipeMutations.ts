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
            difficulty
            cookingTime
            createdAt
            updatedAt
        }
    }
`;

export const UPDATE_RECIPE = gql`
    mutation UpdateRecipe($id: ID!, $input: RecipeUpdateInput!) {
        updateRecipe(id: $id, input: $input) {
            id
            title
            description
            ingredients {
                name
                quantity
                unit
            }
            steps
            imageUrl
            difficulty
            cookingTime
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
