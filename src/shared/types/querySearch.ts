export interface QuerySearch {
  page: number;
  limit: number;
  search?: string;
  order: 'asc' | 'desc';
  sortBy: 'createdAt' | 'updatedAt';
}

export interface QuerySearchAdvanced extends QuerySearch {
  priority?: 'urgente' | 'media' | 'baja';
  status?: 'pendiente' | 'aceptada' | 'finalizada' | 'rechazada';
  startDate?: string;
  endDate?: string;
  type?: 'sent' | 'receive';
}
