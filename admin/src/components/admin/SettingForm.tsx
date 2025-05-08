'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { partySettingsSchema, PartySettingsFormData, TableData } from '../../lib/utils/validation';
import { PartySetting } from '../../lib/db/supabase';
import TableConfigEditor from './TableConfigEditor';
import { ulid } from 'ulid';
import { useRouter } from 'next/navigation';

interface SettingFormProps {
  partyId: string;
  initialData?: Partial<PartySetting>;
  onSubmit: (data: PartySettingsFormData) => Promise<void>;
  isSubmitting: boolean;
}

export default function SettingForm({
  partyId,
  initialData,
  onSubmit,
  isSubmitting,
}: SettingFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [tables, setTables] = useState<TableData[]>([]);

  const defaultSeatingLayout = {
    tableCount: 5,
    seatsPerTable: 6,
    tables: [],
  };

  const defaultMatchingRule = {
    prioritizeMutualMatches: true,
    considerVoteRanking: true,
    balanceGenderRatio: true,
  };

  const defaultGenderRules = {
    requireMixedGender: true,
    alternateSeating: true,
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PartySettingsFormData>({
    resolver: zodResolver(partySettingsSchema),
    defaultValues: {
      party_id: partyId,
      seating_layout: initialData?.seating_layout || defaultSeatingLayout,
      matching_rule: initialData?.matching_rule || defaultMatchingRule,
      gender_rules: initialData?.gender_rules || defaultGenderRules,
    },
  });

  // Initialize tables from initialData or create default tables
  useEffect(() => {
    if (initialData?.seating_layout?.tables) {
      setTables(initialData.seating_layout.tables as TableData[]);
    } else {
      // Create default tables based on tableCount
      const tableCount = initialData?.seating_layout?.tableCount || 5;
      const seatsPerTable = initialData?.seating_layout?.seatsPerTable || 6;

      const defaultTables: TableData[] = Array.from({ length: tableCount }).map((_, index) => ({
        id: ulid(),
        name: `テーブル ${index + 1}`,
        seatCount: seatsPerTable,
      }));

      setTables(defaultTables);
      setValue('seating_layout.tables', defaultTables);
    }
  }, [initialData, setValue]);

  // Watch for changes in tableCount and seatsPerTable
  const tableCount = watch('seating_layout.tableCount');
  const seatsPerTable = watch('seating_layout.seatsPerTable');

  // Update tables when tableCount changes
  useEffect(() => {
    if (tables.length === tableCount) return;

    let newTables = [...tables];

    // Add tables if needed
    if (tables.length < tableCount) {
      const tablesNeeded = tableCount - tables.length;
      const additionalTables = Array.from({ length: tablesNeeded }).map((_, index) => ({
        id: ulid(),
        name: `テーブル ${tables.length + index + 1}`,
        seatCount: seatsPerTable,
      }));
      newTables = [...newTables, ...additionalTables];
    }
    // Remove tables if needed
    else if (tables.length > tableCount) {
      newTables = newTables.slice(0, tableCount);
    }

    setTables(newTables);
    setValue('seating_layout.tables', newTables);
  }, [tableCount, seatsPerTable, tables, setValue]);

  // Handle table changes from the TableConfigEditor
  const handleTablesChange = (updatedTables: TableData[]) => {
    setTables(updatedTables);
    setValue('seating_layout.tables', updatedTables);
    setValue('seating_layout.tableCount', updatedTables.length);
  };

  const onFormSubmit = async (data: PartySettingsFormData) => {
    try {
      setSubmitError(null);

      // Ensure tables are included in the submission
      data.seating_layout.tables = tables;

      await onSubmit(data);
      router.push(`/parties/${partyId}`);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError('設定の保存中にエラーが発生しました。もう一度お試しください。');
    }
  };

  return (
    <div className="card max-w-3xl mx-auto">
      <div className="card-content">
        <h2 className="text-2xl font-semibold mb-4">パーティ設定</h2>

        <form onSubmit={handleSubmit(onFormSubmit)} noValidate className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-3">座席レイアウト</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">テーブル数</label>
                <Controller
                  name="seating_layout.tableCount"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-4">
                      <div className="flex-grow relative pt-5">
                        <div className="absolute left-0 top-0 text-xs">
                          <span>1</span>
                        </div>
                        <div className="absolute right-0 top-0 text-xs">
                          <span>20</span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={20}
                          step={1}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          value={field.value}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </div>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
                        value={field.value}
                        onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  )}
                />
                {errors.seating_layout?.tableCount && (
                  <p className="mt-1 text-sm text-error-main">
                    {errors.seating_layout.tableCount.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  デフォルトのテーブルあたりの席数
                </label>
                <Controller
                  name="seating_layout.seatsPerTable"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-4">
                      <div className="flex-grow relative pt-5">
                        <div className="absolute left-0 top-0 text-xs">
                          <span>2</span>
                        </div>
                        <div className="absolute right-0 top-0 text-xs">
                          <span>12</span>
                        </div>
                        <input
                          type="range"
                          min={2}
                          max={12}
                          step={1}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          value={field.value}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </div>
                      <input
                        type="number"
                        min={2}
                        max={12}
                        step={1}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
                        value={field.value}
                        onChange={e => field.onChange(parseInt(e.target.value) || 2)}
                      />
                    </div>
                  )}
                />
                {errors.seating_layout?.seatsPerTable && (
                  <p className="mt-1 text-sm text-error-main">
                    {errors.seating_layout.seatsPerTable.message}
                  </p>
                )}
              </div>

              <div className="mt-8 pt-4 border-t">
                <TableConfigEditor tables={tables} onChange={handleTablesChange} />
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          <div>
            <h3 className="text-xl font-semibold mb-3">マッチングルール</h3>
            <div className="space-y-3">
              <Controller
                name="matching_rule.prioritizeMutualMatches"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-primary-main rounded"
                      checked={field.value}
                      onChange={e => field.onChange(e.target.checked)}
                    />
                    <span className="ml-2">相互マッチを優先する</span>
                  </label>
                )}
              />

              <Controller
                name="matching_rule.considerVoteRanking"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-primary-main rounded"
                      checked={field.value}
                      onChange={e => field.onChange(e.target.checked)}
                    />
                    <span className="ml-2">投票の順位を考慮する</span>
                  </label>
                )}
              />

              <Controller
                name="matching_rule.balanceGenderRatio"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-primary-main rounded"
                      checked={field.value}
                      onChange={e => field.onChange(e.target.checked)}
                    />
                    <span className="ml-2">男女比率のバランスを取る</span>
                  </label>
                )}
              />
            </div>
          </div>

          <hr className="border-gray-200" />

          <div>
            <h3 className="text-xl font-semibold mb-3">性別ルール</h3>
            <div className="space-y-3">
              <Controller
                name="gender_rules.requireMixedGender"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-primary-main rounded"
                      checked={field.value}
                      onChange={e => field.onChange(e.target.checked)}
                    />
                    <span className="ml-2">必ず異性同士でマッチングする</span>
                  </label>
                )}
              />

              <Controller
                name="gender_rules.alternateSeating"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-primary-main rounded"
                      checked={field.value}
                      onChange={e => field.onChange(e.target.checked)}
                    />
                    <span className="ml-2">男女交互に座席を配置する</span>
                  </label>
                )}
              />
            </div>
          </div>

          {submitError && <div className="text-error-main">{submitError}</div>}

          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : '設定を保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
