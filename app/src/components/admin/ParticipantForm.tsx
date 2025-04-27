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
  RadioGroup,
  Radio,
  FormControlLabel,
  Typography,
  Paper,
  Stack
} from '@mui/material';
import { participantSchema, ParticipantFormData } from '@/lib/utils/validation';
import { Participant } from '@/lib/db/supabase';

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
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError('参加者の保存中にエラーが発生しました。もう一度お試しください。');
    }
  };
  
  return (
    <Paper elevation={2} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {initialData?.id ? '参加者を編集' : '参加者を追加'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
        <Stack spacing={3}>
          <Controller
            name="participant_number"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="参加者番号"
                type="number"
                fullWidth
                required
                inputProps={{ min: 1 }}
                error={!!errors.participant_number}
                helperText={errors.participant_number?.message}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            )}
          />
          
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="参加者名"
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
          
          <FormControl error={!!errors.gender}>
            <FormLabel>性別</FormLabel>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  {...field}
                  row
                >
                  <FormControlLabel value="male" control={<Radio />} label="男性" />
                  <FormControlLabel value="female" control={<Radio />} label="女性" />
                </RadioGroup>
              )}
            />
            {errors.gender && (
              <FormHelperText>{errors.gender.message}</FormHelperText>
            )}
          </FormControl>
          
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
              {isSubmitting ? '保存中...' : (initialData?.id ? '更新' : '追加')}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}
