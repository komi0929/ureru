'use client';

import React, { useState, useEffect } from 'react';
import RecipeEditorForm from '@/components/cost/RecipeEditorForm';
import { Material } from '@/types/cost';
import { getMaterials } from '@/lib/cost-api';

export default function NewRecipePage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getMaterials();
      setMaterials(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400 text-sm">マスターデータを読み込み中...</div>
      </div>
    );
  }

  return (
    <RecipeEditorForm
      materials={materials}
      isEditing={false}
    />
  );
}
