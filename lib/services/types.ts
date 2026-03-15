export type Task = {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  color: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  type: 'Trabalho' | 'Pessoal' | 'Projetos';
  
  // Optional / Specific fields derived from event_type differences
  status?: string;
  location?: string;
  eventType?: string;
  steps?: { id: string | number, text: string, done: boolean }[];
};
