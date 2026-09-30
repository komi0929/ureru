'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RecipeEditorForm from '@/components/cost/RecipeEditorForm';
import { Material, Recipe } from '@/types/cost';
import { getMaterials, getRecipeById } from '@/lib/cost-api';

export default function EditRecipePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const [mats, rec] = await Promise.all([
        getMaterials(),
        getRecipeById(id),
      ]);
      setMaterials(mats);
      if (rec) {
        setRecipe(rec);
      } else {
        alert('指定されたレシピが見つかりませんでした');
        router.push('/cost/recipes');
      }
      setLoading(false);
    }
    load();
  }, [id, router]);

  if (loading || !recipe) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400 text-sm">レシピデータを読み込み中...</div>
      </div>
    );
  }

  return (
    <RecipeEditorForm
      initialRecipe={recipe}
      materials={materials}
      isEditing={true}
    />
  );
}
