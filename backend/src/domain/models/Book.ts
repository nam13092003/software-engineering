export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  isbn: string;
  totalCopies: number;
  availableCopies: number;
  description?: string | null;
  createdAt: Date;
}

export interface CreateBookInput {
  id: string;
  title: string;
  author: string;
  genre: string;
  isbn: string;
  totalCopies: number;
  availableCopies: number;
  description?: string | null;
}

export interface UpdateBookInput {
  title?: string;
  author?: string;
  genre?: string;
  isbn?: string;
  totalCopies?: number;
  availableCopies?: number;
  description?: string | null;
}
