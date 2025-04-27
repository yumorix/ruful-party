'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Box, 
  Button, 
  TextField, 
  FormControl, 
  FormLabel, 
  FormHelperText,
  Typography,
  Paper,
  Stack,
  Slider,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import { partySettingsSchema, PartySettingsFormData } from '@/lib/utils/validation';
import { PartySetting } from '@/lib/db/supabase';

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
  isSubmitting 
}: SettingFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const defaultSeatingLayout = {
    tableCount: 5,
    seatsPerTable: 6
  };
  
  const defaultMatchingRule = {
    prioritizeMutualMatches: true,
    considerVoteRanking: true,
    balanceGenderRatio: true
  };
  
  const defaultGenderRules = {
    requireMixedGender: true,
    alternateSeating: true
  };
  
  const { 
    control, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<PartySettingsFormData>({
    resolver: zodResolver(partySettingsSchema),
    defaultValues: {
      party_id: partyId,
      seating_layout: initialData?.seating_layout || defaultSeatingLayout,
      matching_rule: initialData?.matching_rule || defaultMatchingRule,
      gender_rules: initialData?.gender_rules || defaultGenderRules
    }
  });
  
  const onFormSubmit = async (data: PartySettingsFormData) => {
    try {
      setSubmitError(null);
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError('設定の保存中にエラーが発生しました。もう一度お試しください。');
    }
  };
  
  return (
    <Paper elevation={2} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        パーティ設定
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
        <Stack spacing={4}>
          <Box>
            <Typography variant="h6" gutterBottom>
              座席レイアウト
            </Typography>
            <Stack spacing={3}>
              <Box>
                <FormLabel>テーブル数</FormLabel>
                <Controller
                  name="seating_layout.tableCount"
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Slider
                        {...field}
                        min={1}
                        max={20}
                        step={1}
                        valueLabelDisplay="auto"
                        marks={[
                          { value: 1, label: '1' },
                          { value: 10, label: '10' },
                          { value: 20, label: '20' }
                        ]}
                        sx={{ flexGrow: 1 }}
                        onChange={(_, value) => field.onChange(value as number)}
                      />
                      <TextField
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        type="number"
                        inputProps={{ min: 1, max: 20 }}
                        sx={{ width: 80 }}
                      />
                    </Box>
                  )}
                />
                {errors.seating_layout?.tableCount && (
                  <FormHelperText error>
                    {errors.seating_layout.tableCount.message}
                  </FormHelperText>
                )}
              </Box>
              
              <Box>
                <FormLabel>テーブルあたりの席数</FormLabel>
                <Controller
                  name="seating_layout.seatsPerTable"
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Slider
                        {...field}
                        min={2}
                        max={12}
                        step={2}
                        valueLabelDisplay="auto"
                        marks={[
                          { value: 2, label: '2' },
                          { value: 6, label: '6' },
                          { value: 12, label: '12' }
                        ]}
                        sx={{ flexGrow: 1 }}
                        onChange={(_, value) => field.onChange(value as number)}
                      />
                      <TextField
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 2)}
                        type="number"
                        inputProps={{ min: 2, max: 12, step: 2 }}
                        sx={{ width: 80 }}
                      />
                    </Box>
                  )}
                />
                {errors.seating_layout?.seatsPerTable && (
                  <FormHelperText error>
                    {errors.seating_layout.seatsPerTable.message}
                  </FormHelperText>
                )}
              </Box>
            </Stack>
          </Box>
          
          <Divider />
          
          <Box>
            <Typography variant="h6" gutterBottom>
              マッチングルール
            </Typography>
            <Stack spacing={2}>
              <Controller
                name="matching_rule.prioritizeMutualMatches"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="相互マッチを優先する"
                  />
                )}
              />
              
              <Controller
                name="matching_rule.considerVoteRanking"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="投票の順位を考慮する"
                  />
                )}
              />
              
              <Controller
                name="matching_rule.balanceGenderRatio"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="男女比率のバランスを取る"
                  />
                )}
              />
            </Stack>
          </Box>
          
          <Divider />
          
          <Box>
            <Typography variant="h6" gutterBottom>
              性別ルール
            </Typography>
            <Stack spacing={2}>
              <Controller
                name="gender_rules.requireMixedGender"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="必ず異性同士でマッチングする"
                  />
                )}
              />
              
              <Controller
                name="gender_rules.alternateSeating"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="男女交互に座席を配置する"
                  />
                )}
              />
            </Stack>
          </Box>
          
          {submitError && (
            <Typography color="error">{submitError}</Typography>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : '設定を保存'}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}
