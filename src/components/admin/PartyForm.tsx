'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Box, 
  Button, 
  TextField, 
  FormControl, 
  FormHelperText,
  Select,
  MenuItem,
  Typography,
  Paper,
  Stack,
  InputLabel
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ja } from 'date-fns/locale/ja';
import { format } from 'date-fns';
import { partySchema, PartyFormData } from '@/lib/utils/validation';
import { Party } from '@/lib/db/supabase';

interface PartyFormProps {
  initialData?: Partial<Party>;
  onSubmit: (data: PartyFormData) => Promise<void>;
  isSubmitting: boolean;
}

export default function PartyForm({ 
  initialData, 
  onSubmit, 
  isSubmitting 
}: PartyFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const { 
    control, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<PartyFormData>({
    resolver: zodResolver(partySchema),
    defaultValues: {
      name: initialData?.name || '',
      date: initialData?.date || format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
      location: initialData?.location || '',
      capacity: initialData?.capacity || 20,
      status: initialData?.status || 'preparing',
      current_mode: initialData?.current_mode || 'closed'
    }
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
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
      <Paper elevation={2} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {initialData?.id ? 'パーティを編集' : '新規パーティを作成'}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
          <Stack spacing={3}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="パーティ名"
                  fullWidth
                  required
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
            
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  label="開催日時"
                  value={field.value ? new Date(field.value) : null}
                  onChange={(newValue) => {
                    if (newValue) {
                      field.onChange(format(newValue, "yyyy-MM-dd'T'HH:mm:ss"));
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.date,
                      helperText: errors.date?.message
                    }
                  }}
                />
              )}
            />
            
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="開催場所"
                  fullWidth
                  required
                  error={!!errors.location}
                  helperText={errors.location?.message}
                />
              )}
            />
            
            <Controller
              name="capacity"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="定員"
                  type="number"
                  fullWidth
                  required
                  inputProps={{ min: 2 }}
                  error={!!errors.capacity}
                  helperText={errors.capacity?.message}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              )}
            />
            
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.status}>
                  <InputLabel id="status-label">ステータス</InputLabel>
                  <Select
                    {...field}
                    labelId="status-label"
                    label="ステータス"
                  >
                    <MenuItem value="preparing">準備中</MenuItem>
                    <MenuItem value="active">開催中</MenuItem>
                    <MenuItem value="closed">終了</MenuItem>
                  </Select>
                  {errors.status && (
                    <FormHelperText>{errors.status.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
            
            <Controller
              name="current_mode"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.current_mode}>
                  <InputLabel id="mode-label">投票モード</InputLabel>
                  <Select
                    {...field}
                    labelId="mode-label"
                    label="投票モード"
                  >
                    <MenuItem value="interim">中間投票</MenuItem>
                    <MenuItem value="final">最終投票</MenuItem>
                    <MenuItem value="closed">クローズ</MenuItem>
                  </Select>
                  {errors.current_mode && (
                    <FormHelperText>{errors.current_mode.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
            
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
                {isSubmitting ? '保存中...' : (initialData?.id ? '更新' : '作成')}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
}
