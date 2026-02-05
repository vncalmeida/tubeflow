export const VIDEO_STATUSES = [
  'Pendente',
  'Roteiro_Solicitado',
  'Roteiro_Em_Andamento',
  'Roteiro_Concluído',
  'Narração_Solicitada',
  'Narração_Em_Andamento',
  'Narração_Concluída',
  'Edição_Solicitada',
  'Edição_Em_Andamento',
  'Edição_Concluída',
  'Thumbnail_Solicitada',
  'Thumbnail_Em_Andamento',
  'Thumbnail_Concluída',
  'Publicado',
  'Cancelado',
] as const;

export type VideoStatus = typeof VIDEO_STATUSES[number];
