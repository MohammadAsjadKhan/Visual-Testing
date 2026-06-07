export interface BoxDetail {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DiffBox {
  status: 'misplaced' | 'missing' | 'extra';
  box: BoxDetail;
  delta_x: number;
  delta_y: number;
}

export interface AnalysisResponse {
  id: number;
  project_name: string;
  design_filename: string;
  actual_filename: string;
  color_diff_score: number;
  diff_boxes: DiffBox[];
  created_at: string;
}