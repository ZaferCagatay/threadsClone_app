import * as z from 'zod';

export const ThreadValidation = z.object({
  thread: z
    .string()
    .nonempty()
    .min(3, { message: 'Minimum 3 charachters' })
    .max(300, { message: 'Maximum 300 characthers' }),
  accountId: z.string(),
});

export const CommentValidation = z.object({
  thread: z
    .string()
    .nonempty()
    .min(3, { message: 'Minimum 3 charachters' })
    .max(300, { message: 'Maximum 300 characthers' }),
});
