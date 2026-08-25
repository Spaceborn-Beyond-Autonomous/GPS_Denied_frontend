export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Engineer' | 'Viewer';
  title: string;
}

export interface Org {
  id: string;
  name: string;
  plan_tier: string;
  quota_sim_minutes: number;
  quota_used: number;
}

export interface StackVersion {
  id: string;
  stack_id: string;
  version: string;
  image_digest: string;
  submitted_date: string;
  best_score: number | null;
  run_count: number;
  last_run_status: 'Passed' | 'Failed' | 'Running' | 'Queued' | 'Error';
  manifest_yaml: string;
}

export interface Stack {
  id: string;
  org_id: string;
  name: string;
  versions: StackVersion[];
  tags: string[];
}

export interface Scenario {
  id: string;
  name: string;
  version: string;
  description: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Custom';
  world_file_ref: string;
  jamming_profile: number[]; // Sparkline data points representing signal loss curve
  goal_definition: string;
  sensor_suite: string;
}

export interface Run {
  id: string;
  org_id: string;
  stack_name: string;
  stack_version: string;
  stack_version_id: string;
  scenario_id: string;
  scenario_name: string;
  status: 'Passed' | 'Failed' | 'Running' | 'Queued' | 'Error';
  score: number | null;
  duration: string;
  started_by: string;
  started_at: string;
  seed: string;
  worker_pod_id: string;
}

export interface CategoryScores {
  localization: number;
  slam: number;
  transition: number;
  navigation: number;
  exploration: number;
  safety: number;
}

export interface RunResult {
  run_id: string;
  overall_score: number;
  pass_fail: 'Passed' | 'Failed' | 'Error';
  category_scores: CategoryScores;
  error_codes: Array<{ code: string; message: string; severity: 'warning' | 'critical' }>;
  artifact_refs: {
    bag: { name: string; size: string };
    video: { name: string; size: string };
    map: { name: string; size: string };
    log: { name: string; size: string };
  };
}

export interface RunEvent {
  run_id: string;
  timestamp: string; // e.g. "01:24.412"
  event_type: string;
  description: string;
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
}
