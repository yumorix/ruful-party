'use client';

import { useState } from 'react';

interface GenerateSeatingPlanButtonProps {
  onGenerate: () => Promise<void>;
  disabled: boolean;
  hasExistingPlan: boolean;
}

export default function GenerateSeatingPlanButton({
  onGenerate,
  disabled,
  hasExistingPlan,
}: GenerateSeatingPlanButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      await onGenerate();
    } catch (error) {
      console.error('Error generating seating plan:', error);
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button
        className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        type="submit"
        disabled={disabled || isGenerating}
      >
        {isGenerating ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            AIで席替えを生成中...
          </>
        ) : (
          <>{hasExistingPlan ? 'AIで席替えを再生成' : 'AIで席替えを生成'}</>
        )}
      </button>
    </form>
  );
}
