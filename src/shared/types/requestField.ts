export interface RequestField {
  id?: number;
  label: string;
  directionMapOption: 'column' | 'grid' | 'row';
  type: string;
  required: boolean;
  options?: string[] | object;
  order: number;
  placeHolder?: string;
}
