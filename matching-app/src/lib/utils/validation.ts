import { z } from 'zod';

// Token validation for QR code access
export const tokenValidationSchema = z.object({
  token: z.string().min(1, 'アクセストークンは必須です')
});

export type TokenValidationData = z.infer<typeof tokenValidationSchema>;

// Vote submission validation
export const voteSubmissionSchema = z.object({
  token: z.string().min(1, 'アクセストークンは必須です'),
  votes: z.array(
    z.object({
      voted_id: z.string().min(1, '投票先IDは必須です'),
      rank: z.number().min(1).max(3)
    })
  ).max(3, '投票は最大3人までです')
});

export type VoteSubmissionData = z.infer<typeof voteSubmissionSchema>;

// Result access validation
export const resultAccessSchema = z.object({
  token: z.string().min(1, 'アクセストークンは必須です')
});

export type ResultAccessData = z.infer<typeof resultAccessSchema>;
