import { useState, useEffect } from 'react';
import apiClient from '../api';

interface Recipe {
  id: string;
  name: string;
  description: string;
}

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await apiClient.get('/recipes');
        setRecipes(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchRecipes();
  }, []);

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-gray-700">Your Recipes</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-bold">{recipe.name}</h3>
            <p className="mt-2 text-gray-600">{recipe.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
