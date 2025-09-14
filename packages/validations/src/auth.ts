import z, { email } from "zod";

export const signUpSchema = z.object({
    username: z.string().min(5, "username should be at least 5 characters"),
    email: z.email(),
    password: z.string().min(6, "password must be at least 6 characters").regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]).+$/, {
        message : "Password should contain at least one uppercase, one lowercase, and one special character"
    })
})

export const signInSchema = z.object({
    username: z.string().min(5, "username should be at least 5 characters"),
    password: z.string().min(6, "password must be at least 6 characters")
})
export type SignupInput = z.infer<typeof signUpSchema>;
export type SigninInput = z.infer<typeof signInSchema>;