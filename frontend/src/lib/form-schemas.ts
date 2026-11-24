import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Informe um e-mail válido.'),
  senha: z.string().min(1, 'Informe sua senha.'),
});

export const registerSchema = loginSchema.extend({
  nome: z.string().trim().min(1, 'Informe seu nome.').max(150),
  email: loginSchema.shape.email.max(150),
  senha: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres.'),
  cpf: z.string().trim().min(1, 'Informe seu CPF.').max(14),
});

export const addressSchema = z.object({
  cep: z
    .string()
    .trim()
    .regex(/^\d{5}-?\d{3}$/, 'Informe um CEP de 8 dígitos.'),
  logradouro: z.string().trim().min(1, 'Informe o logradouro.').max(200),
  numero: z.string().trim().min(1, 'Informe o número.').max(20),
  complemento: z.string().trim().max(100),
  bairro: z.string().trim().min(1, 'Informe o bairro.').max(100),
  cidade: z.string().trim().min(1, 'Informe a cidade.').max(100),
  estado: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, 'Informe a UF com duas letras.'),
});
