import { z } from "zod";


export const RegisterSchema = z.object({
email: z.string().email("Enter a valid email"),
name: z.string().min(2, "Name must be at least 2 characters"),
password: z.string().min(6, "Password must be at least 6 characters")
});


export const LoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});


export const EnsureConvSchema = z.object({ peerId: z.string().min(1) });


export const SendMessageSchema = z.object({
convId: z.string().min(1),
clientId: z.string().min(8),
kind: z.enum(["text", "image", "file", "voice"]),
text: z.string().max(4096).optional(),
media: z.any().optional()
});