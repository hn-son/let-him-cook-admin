import { gql } from '@apollo/client';

export const GET_RECIPES = gql`
    query GetRecipes {
        recipes {
            id
            title
            description
            cookingTime
            difficulty
            createdAt
            imageUrl
            ingredients {
                name
                quantity
                unit
            }
            author {
                id
                username
            }
        }
    }
`;

export const GET_RECIPE = gql`
    query GetRecipe($id: ID!) {
        recipe(id: $id) {
            id
            title
            description
            cookingTime
            difficulty
            imageUrl
            createdAt
            ingredients {
                name
                quantity
                unit
            }
            author {
                username
            }
        }
    }
`;
