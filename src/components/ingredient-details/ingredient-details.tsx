import { FC } from 'react';
import { Preloader } from '../ui/preloader';
import { IngredientDetailsUI } from '../ui/ingredient-details';
import { useParams } from 'react-router-dom';
import { selectIngredients } from '../../services/ingredientsSlice';
import { useSelector } from '../../services/store';

export const IngredientDetails: FC = () => {
  const { id } = useParams();
  const ingredients = useSelector(selectIngredients);
  const ingredientData = ingredients.find((i) => i._id === id) || null;

  if (!ingredientData) {
    return <Preloader />;
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
