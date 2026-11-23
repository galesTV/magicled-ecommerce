export type UserRole = 'CLIENTE' | 'ADMIN';
export type PaymentMethod = 'PIX' | 'BOLETO' | 'CARTAO_CREDITO';
export type OrderStatus = 'PENDENTE' | 'PAGO' | 'EM_TRANSPORTE' | 'ENTREGUE' | 'CANCELADO';
export type PaymentStatus = 'PENDENTE' | 'APROVADO' | 'RECUSADO' | 'ESTORNADO';
export type Money = number | string;

export interface User {
  id: number;
  email: string;
  tipoUsuario: UserRole;
  nome?: string;
}

export interface AuthResponse {
  accessToken: string;
  usuario: User;
}

export interface Category {
  id: number;
  nome: string;
  _count?: { produtos: number };
}

export interface Product {
  id: number;
  categoriaId: number;
  nome: string;
  descricao: string | null;
  especificacaoTecnica: string | null;
  preco: Money;
  estoque: number;
  imagemUrl: string | null;
  status: boolean;
  categoria?: Category;
}

export interface CartItem {
  id: number;
  produtoId: number;
  quantidade: number;
  precoUnitario: Money;
  produto: Product;
}

export interface Cart {
  id: number;
  clienteId: number;
  itens: CartItem[];
  valorTotal: number;
}

export interface Address {
  id: number;
  clienteId: number;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface Payment {
  id: number;
  pedidoId: number;
  metodo: PaymentMethod;
  valor: Money;
  status: PaymentStatus;
  dataPagamento: string | null;
}

export interface OrderItem {
  id: number;
  produtoId: number;
  quantidade: number;
  precoUnitario: Money;
  produto: Product;
}

export interface Order {
  id: number;
  clienteId: number;
  enderecoId: number;
  dataCriacao: string;
  valorTotal: Money;
  status: OrderStatus;
  codigoRastreio: string | null;
  itens: OrderItem[];
  endereco: Address;
  pagamento: Payment | null;
}

export interface ApiEnvelope<T> {
  success: true;
  data: T;
}
export interface ApiErrorBody {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}
