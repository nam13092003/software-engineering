export type ActivityAction = "REGISTER" | "LOGIN" | "CREATE_BOOK" | "UPDATE_BOOK" | "DELETE_BOOK" | "BORROW_BOOK" | "RETURN_BOOK";

export interface ActivityLog {
  id: string;
  userId: string;
  bookId?: string | null;
  action: ActivityAction;
  message: string;
  createdAt: Date;
}

export interface ActivityLogWithDetails extends ActivityLog {
  userName: string | null;
  userEmail: string | null;
  bookTitle: string | null;
}

export interface CreateActivityLogInput {
  id: string;
  userId: string;
  bookId?: string | null;
  action: ActivityAction;
  message: string;
  createdAt: Date;
}
