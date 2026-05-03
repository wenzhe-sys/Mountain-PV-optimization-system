export interface InstanceInfo {
  id: number;
  name: string;
  instance_id: string;
  n_nodes: number;
  status: string;
  created_at: string;
  available_modules?: number[];
}

export interface PreloadedInstance {
  instance_id: string;
  has_results: number[];
}

export interface JobStatus {
  id: number;
  status: string;
  progress: number;
  error?: string;
}