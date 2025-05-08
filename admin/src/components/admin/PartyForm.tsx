'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parse } from 'date-fns';
import { partySchema, PartyFormData } from '../../lib/utils/validation';
import { Party } from '../../lib/db/supabase';
import { current_type } from '../../lib/db/queries';

interface PartyFormProps {
  initialData?: Partial<Party>;
  onSubmit: (data: PartyFormData) => Promise<void>;
  isSubmitting: boolean;
}

export default function PartyForm({ initialData, onSubmit, isSubmitting }: PartyFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PartyFormData>({
    resolver: zodResolver(partySchema),
    defaultValues: {
      name: initialData?.name || '',
      date: initialData?.date || format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
      location: initialData?.location || '',
      capacity: initialData?.capacity || 20,
      status: initialData?.status || 'preparing',
      current_mode: initialData?.current_mode || 'closed',
    },
  });

  const onFormSubmit = async (formData: PartyFormData) => {
    try {
      setSubmitError(null);
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError('パーティの保存中にエラーが発生しました。もう一度お試しください。');
    }
  };

  return (
    <div className="card max-w-xl mx-auto">
      <div className="card-content">
        <h2 className="text-2xl font-semibold mb-4">
          {initialData?.id ? 'パーティを編集' : '新規パーティを作成'}
        </h2>

        <form onSubmit={handleSubmit(onFormSubmit)} noValidate className="space-y-6">
          <div className="space-y-4">
            <div>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      パーティ名 <span className="text-error-main">*</span>
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
              <Controller
                name="date"
                control={control}
                render={({ field }) => {
                  // Convert ISO string to date parts for the inputs
                  const dateValue = field.value ? new Date(field.value) : new Date();
                  const dateString = format(dateValue, 'yyyy-MM-dd');
                  const timeString = format(dateValue, 'HH:mm');

                  return (
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium mb-1">
                        開催日時 <span className="text-error-main">*</span>
                      </label>
                      <div className="flex space-x-2">
                        <input
                          id="date"
                          type="date"
                          className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main ${
                            errors.date ? 'border-error-main' : 'border-gray-300'
                          }`}
                          value={dateString}
                          onChange={e => {
                            const newDate = parse(
                              `${e.target.value} ${timeString}`,
                              'yyyy-MM-dd HH:mm',
                              new Date()
                            );
                            field.onChange(format(newDate, "yyyy-MM-dd'T'HH:mm:ss"));
                          }}
                        />
                        <input
                          id="time"
                          type="time"
                          className={`w-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main ${
                            errors.date ? 'border-error-main' : 'border-gray-300'
                          }`}
                          value={timeString}
                          onChange={e => {
                            const newDate = parse(
                              `${dateString} ${e.target.value}`,
                              'yyyy-MM-dd HH:mm',
                              new Date()
                            );
                            field.onChange(format(newDate, "yyyy-MM-dd'T'HH:mm:ss"));
                          }}
                        />
                      </div>
                      {errors.date && (
                        <p className="mt-1 text-sm text-error-main">{errors.date.message}</p>
                      )}
                    </div>
                  );
                }}
              />
            </div>

            <div>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium mb-1">
                      開催場所 <span className="text-error-main">*</span>
                    </label>
                    <input
                      id="location"
                      type="text"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main ${
                        errors.location ? 'border-error-main' : 'border-gray-300'
                      }`}
                      {...field}
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-error-main">{errors.location.message}</p>
                    )}
                  </div>
                )}
              />
            </div>

            <div>
              <Controller
                name="capacity"
                control={control}
                render={({ field }) => (
                  <div>
                    <label htmlFor="capacity" className="block text-sm font-medium mb-1">
                      定員 <span className="text-error-main">*</span>
                    </label>
                    <input
                      id="capacity"
                      type="number"
                      min={2}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main ${
                        errors.capacity ? 'border-error-main' : 'border-gray-300'
                      }`}
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                    />
                    {errors.capacity && (
                      <p className="mt-1 text-sm text-error-main">{errors.capacity.message}</p>
                    )}
                  </div>
                )}
              />
            </div>

            <div>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium mb-1">
                      ステータス
                    </label>
                    <select
                      id="status"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main ${
                        errors.status ? 'border-error-main' : 'border-gray-300'
                      }`}
                      {...field}
                    >
                      <option value="preparing">準備中</option>
                      <option value="active">開催中</option>
                      <option value="closed">終了</option>
                    </select>
                    {errors.status && (
                      <p className="mt-1 text-sm text-error-main">{errors.status.message}</p>
                    )}
                  </div>
                )}
              />
            </div>

            <div>
              <Controller
                name="current_mode"
                control={control}
                render={({ field }) => (
                  <div>
                    <label htmlFor="current_mode" className="block text-sm font-medium mb-1">
                      投票モード
                    </label>
                    <select
                      id="current_mode"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main ${
                        errors.current_mode ? 'border-error-main' : 'border-gray-300'
                      }`}
                      {...field}
                    >
                      <option value="interim">中間投票</option>
                      <option value="final">最終投票</option>
                      <option value="final-result">最終結果発表</option>
                      <option value="closed">クローズ</option>
                    </select>
                    {errors.current_mode && (
                      <p className="mt-1 text-sm text-error-main">{errors.current_mode.message}</p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          {submitError && <div className="text-error-main">{submitError}</div>}

          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : initialData?.id ? '更新' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
