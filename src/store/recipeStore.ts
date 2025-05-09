import { create } from 'zustand';

interface Recipe {
    id: string;
    title: string;
    description: string;
    ingredients: string[];
    steps: string[];
    imageUrl: string;
    author: string;
    createdAt: string;
    updatedAt: string;
}

interface RecipeState {
    recipes: Recipe[];
    loading: boolean;
    error: string | null;
    setRecipes: (recipes: Recipe[]) => void;
    addRecipe: (recipe: Recipe) => void;
    updateRecipe: (id: string, recipe: Partial<Recipe>) => void;
    deleteRecipe: (id: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

const useRecipeStore = create<RecipeState>(set => ({
    recipes: [],
    loading: false,
    error: null,
    setRecipes: recipes => set({ recipes }),
    addRecipe: recipe => set(state => ({ recipes: [...state.recipes, recipe] })),
    updateRecipe: (id, updatedRecipe) =>
        set(state => ({
            recipes: state.recipes.map(recipe =>
                recipe.id === id ? { ...recipe, ...updatedRecipe } : recipe
            ),
        })),
    deleteRecipe: id =>
        set(state => ({
            recipes: state.recipes.filter(recipe => recipe.id !== id),
        })),
    setLoading: loading => set({ loading }),
    setError: error => set({ error }),
}));

export default useRecipeStore;
