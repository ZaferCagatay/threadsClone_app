import * as z from 'zod';

export const UserValidation = z.object({
  profile_photo: z.string().url().nonempty(),
  name: z
    .string()
    .min(3, { message: 'Name should be minimum 3 charachters' })
    .max(30, { message: 'Name should be maximum 30 characthers' }),
  username: z
    .string()
    .min(3, { message: 'Userame should be minimum 3 charachters' })
    .max(30, { message: 'Userame should be maximum 30 characthers' }),
  bio: z
    .string()
    .min(3, { message: 'Bio should be minimum 3 charachters' })
    .max(300, { message: 'Bio should be maximum 300 characthers' }),
});
