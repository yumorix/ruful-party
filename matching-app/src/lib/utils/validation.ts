import { z } from 'zod';

// Table definition
export const tableSchema = z.object({
  id: z.string(),
  name: z.string(),
  seatCount: z.number().min(2, '席数は2以上必要です').max(12, '席数は12以下にしてください'),
});

export type TableData = z.infer<typeof tableSchema>;

// Vote submission validation schema
export const voteSubmissionSchema = z.object({
  token: z.string().min(1, { message: 'トークンは必須です' }),
  votes: z
    .array(
      z.object({
        voted_id: z.string().min(1, { message: '投票対象者IDは必須です' }),
        rank: z.number().int().min(1).max(3),
      })
    )
    .min(1, { message: '少なくとも1人は選択してください' })
    .max(3, { message: '最大3人まで選択できます' }),
});

export type VoteSubmissionData = z.infer<typeof voteSubmissionSchema>;

// Token validation schema
export const tokenValidationSchema = z.object({
  token: z.string().min(1, { message: 'トークンは必須です' }),
});

export type TokenValidationData = z.infer<typeof tokenValidationSchema>;
