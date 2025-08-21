'use client';

import { useParams } from 'next/navigation';

export default function TrainingPage() {
  const params = useParams();
  const id = params.id;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Treinamento {id}</h1>
        <p className="text-gray-600">
          Esta página ainda está em desenvolvimento.
        </p>
      </div>
    </div>
  );
}
