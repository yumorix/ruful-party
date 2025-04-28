'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { participantSchema, ParticipantFormData } from '@/lib/utils/validation';
import { Participant } from '@/lib/db/supabase';
import { useRouter } from 'next/navigation';

interface ParticipantFormProps {
  partyId: string;
  initialData?: Partial<Participant>;
  onSubmit: (data: ParticipantFormData) => Promise<void>;
  isSubmitting: boolean;
}

export default function ParticipantForm({ 
  partyId, 
  initialData, 
  onSubmit, 
  isSubmitting 
}: ParticipantFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  
  const { 
    control, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<ParticipantFormData>({
    resolver: zodResolver(participantSchema),
    defaultValues: {
      party_id: partyId,
      participant_number: initialData?.participant_number || 0,
      name: initialData?.name || '',
      gender: initialData?.gender || 'male'
    }
  });
  
  const onFormSubmit = async (data: ParticipantFormData) => {
    try {
      setSubmitError(null);
      await onSubmit(data);
      router.push(`/admin/parties/${partyId}/participants`);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError('参加者の保存中にエラーが発生しました。もう一度お試しください。');
    }
  };
  
  return (
    <div className="card max-w-xl mx-auto">
      <div className="card-content">
        <h2 className="text-2xl font-semibold mb-4">
          {initialData?.id ? '参加者を編集' : '参加者を追加'}
        </h2>
        
        <form onSubmit={handleSubmit(onFormSubmit)} noValidate className="space-y-6">
          <div className="space-y-4">
            <div>
              <Controller
                name="participant_number"
                control={control}
                render={({ field }) => (
                  <div>
                    <label htmlFor="participant_number" className="block text-sm font-medium mb-1">
                      参加者番号 <span className="text-error-main">*</span>
                    </label>
                    <input
                      id="participant_number"
                      type="number"
                      min={1}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main ${
                        errors.participant_number ? 'border-error-main' : 'border-gray-300'
                      }`}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                    {errors.participant_number && (
                      <p className="mt-1 text-sm text-error-main">{errors.participant_number.message}</p>
                    )}
                  </div>
                )}
              />
            </div>
            
            <div>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      参加者名 <span className="text-error-main">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main ${
                        errors.name ? 'border-error-main' : 'border-gray-300'
                      }`}
                      {...field}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-error-main">{errors.name.message}</p>
                    )}
                  </div>
                )}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">性別</label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-primary-main h-4 w-4"
                        value="male"
                        checked={field.value === 'male'}
                        onChange={() => field.onChange('male')}
                      />
                      <span className="ml-2">男性</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-primary-main h-4 w-4"
                        value="female"
                        checked={field.value === 'female'}
                        onChange={() => field.onChange('female')}
                      />
                      <span className="ml-2">女性</span>
                    </label>
                  </div>
                )}
              />
              {errors.gender && (
                <p className="mt-1 text-sm text-error-main">{errors.gender.message}</p>
              )}
            </div>
          </div>
          
          {submitError && (
            <div className="text-error-main">{submitError}</div>
          )}
          
          <div className="flex justify-end">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : (initialData?.id ? '更新' : '追加')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
