import { User, Org, Scenario, Stack, Run, RunResult, RunEvent } from '../types';

export const mockUser: User = {
  id: 'usr-1',
  name: 'Guggarapu Ganapathi',
  email: 'guggarapu.ganapathi@spaceborn.io',
  role: 'Admin',
  title: 'Dev & Platform',
};

export const mockOrg: Org = {
  id: 'org-1',
  name: 'SpaceBorn Internal',
  plan_tier: 'Enterprise Pro',
  quota_sim_minutes: 20000,
  quota_used: 12450,
};

export const mockScenarios: Scenario[] = [
  {
    id: 'scen-1',
    name: 'Warehouse GPS-Denial Standard',
    version: 'v1.2.0',
    description: 'A dense indoor storage grid featuring steel racking arrays and calibrated satellite line-of-sight degradation contours.',
    duration: '15m',
    difficulty: 'Medium',
    world_file_ref: 'warehouse.sdf',
    jamming_profile: [0, 5, 10, 10, 30, 60, 90, 100, 100, 100],
    goal_definition: '20 waypoints, full area coverage, return to home spawn point',
    sensor_suite: 'Intel RealSense D435i RGB-D, Velodyne VLP-16 LiDAR, Microstrain 3DM-GX5 IMU',
  },
  {
    id: 'scen-2',
    name: 'Office Partial Signal Jammer',
    version: 'v1.1.2',
    description: 'Simulates localized visual interference, GPS multi-path reflection errors, and active micro-jamming nodes on narrow corridors.',
    duration: '25m',
    difficulty: 'Hard',
    world_file_ref: 'office_matrix.sdf',
    jamming_profile: [0, 10, 20, 20, 40, 50, 70, 75, 80, 95],
    goal_definition: 'Linear corridor patrol, collision avoidance in dynamic doors',
    sensor_suite: 'Stereo RGB Camera, Ouster OS1-32 LiDAR, generic IMU',
  },
  {
    id: 'scen-3',
    name: 'Subterranean Tunnel Loop',
    version: 'v2.0.1',
    description: 'Long tunnel tubes with absolute signal denial. Forces total reliance on inertial navigation systems and LiDAR scan correlation.',
    duration: '30m',
    difficulty: 'Expert',
    world_file_ref: 'subt_loop.sdf',
    jamming_profile: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
    goal_definition: 'Continuous loop navigation, slope ascents, darkness operation',
    sensor_suite: 'Dual VLP-16 LiDAR, high-grade tactical IMU, thermal camera',
  },
  {
    id: 'scen-4',
    name: 'Urban Canopy Multipath Map',
    version: 'v1.0.0',
    description: 'Outdoor street configuration with heavy tree foliage causing intermittent GPS signal loss and variable satellite count fluctuations.',
    duration: '10m',
    difficulty: 'Easy',
    world_file_ref: 'urban_canopy.sdf',
    jamming_profile: [0, 5, 25, 10, 45, 15, 60, 20, 30, 10],
    goal_definition: 'Sidewalk navigation, pedestrian obstacle avoidance, GPS recovery checkpoint',
    sensor_suite: 'RTK GPS Fix, Front RGB Camera, 2D SICK LiDAR',
  },
  {
    id: 'scen-5',
    name: 'High-Altitude Magnetometer Jam',
    version: 'v1.3.0',
    description: 'High elevation test mapping compass interference patterns and geomagnetic sensor spoofing bounds under dense cloud decks.',
    duration: '20m',
    difficulty: 'Hard',
    world_file_ref: 'high_altitude.sdf',
    jamming_profile: [10, 15, 30, 40, 55, 65, 75, 85, 90, 95],
    goal_definition: '3D navigation matrix waypoint search, wind resistance stabilization',
    sensor_suite: 'Solid state compass, dual IMU, barometric altimeter, optical flow sensor',
  },
  {
    id: 'scen-6',
    name: 'Custom Lab Scenario',
    version: 'v1.0-dev',
    description: 'YAML-configured playground containing adjustable signal attenuation coefficients and user-defined ground-truth targets.',
    duration: 'Variable',
    difficulty: 'Custom',
    world_file_ref: 'sandbox.sdf',
    jamming_profile: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90],
    goal_definition: 'Configured dynamically via custom uploaded parameters',
    sensor_suite: 'Fully custom manifest definition',
  },
];

export const mockStacks: Stack[] = [
  {
    id: 'stk-1',
    org_id: 'org-1',
    name: 'SlamCore_Nav',
    tags: ['ROS 2 Humble', 'SLAM', 'LIDAR-3D'],
    versions: [
      {
        id: 'ver-1-1',
        stack_id: 'stk-1',
        version: 'v2.1.0-rc3',
        image_digest: 'sha256:792fc4a689ab2d8c36fe590f235acde45b23d9a184ef460bc210d32f4185203b',
        submitted_date: 'Oct 24, 2024',
        best_score: 94.2,
        run_count: 348,
        last_run_status: 'Passed',
        manifest_yaml: `apiVersion: spaceborn/v1beta1
kind: NavigationStack
metadata:
  name: "slamcore-nav"
spec:
  entrypoint: "/opt/ros/humble/setup.bash && roslaunch slamcore_nav navigation.launch"
  resource_requests:
    cpu: 4
    memory_gb: 8
    gpu: true`,
      },
      {
        id: 'ver-1-2',
        stack_id: 'stk-1',
        version: 'v2.0.4',
        image_digest: 'sha256:541b867809da8a36fc19d42cf89ab06ef123d9b158ef490bc112d83f4125a07c',
        submitted_date: 'Oct 22, 2024',
        best_score: 88.7,
        run_count: 142,
        last_run_status: 'Passed',
        manifest_yaml: `apiVersion: spaceborn/v1beta1
kind: NavigationStack
metadata:
  name: "slamcore-nav"
spec:
  entrypoint: "/opt/ros/humble/setup.bash && roslaunch slamcore_nav_old navigation.launch"`,
      },
    ],
  },
  {
    id: 'stk-2',
    org_id: 'org-1',
    name: 'Cartographer_Base',
    tags: ['ROS 2 Iron', 'SLAM'],
    versions: [
      {
        id: 'ver-2-1',
        stack_id: 'stk-2',
        version: 'v3.0.1',
        image_digest: 'sha256:39f28a7e029ba83cd36fe9f23acde15b93d9a184ef460bc210f3df912735ab78',
        submitted_date: 'Oct 23, 2024',
        best_score: 89.6,
        run_count: 86,
        last_run_status: 'Passed',
        manifest_yaml: `apiVersion: spaceborn/v1beta1
kind: NavigationStack
metadata:
  name: "cartographer-base"
spec:
  entrypoint: "/opt/ros/iron/setup.bash && roslaunch cartographer_base navigation.launch"`,
      },
      {
        id: 'ver-2-2',
        stack_id: 'stk-2',
        version: 'v3.0.0',
        image_digest: 'sha256:82cd739f9acbe36f890f92cd9f123d9a15c3d9a184ef460bc210e3df91ab540f',
        submitted_date: 'Oct 21, 2024',
        best_score: 88.7,
        run_count: 110,
        last_run_status: 'Passed',
        manifest_yaml: `apiVersion: spaceborn/v1beta1
kind: NavigationStack
metadata:
  name: "cartographer-base"
spec:
  entrypoint: "/opt/ros/iron/setup.bash && roslaunch cartographer_base_v3 navigation.launch"`,
      },
    ],
  },
  {
    id: 'stk-3',
    org_id: 'org-1',
    name: 'ArucoLocalizer',
    tags: ['ROS 2 Humble', 'Fiducial-Nav'],
    versions: [
      {
        id: 'ver-3-1',
        stack_id: 'stk-3',
        version: 'v1.4.2',
        image_digest: 'sha256:1a84ef460bc210d32f4185203b792fc4a689ab2d8c36fe590f235acde45b23d9',
        submitted_date: 'Oct 24, 2024',
        best_score: 84.2,
        run_count: 42,
        last_run_status: 'Failed',
        manifest_yaml: `apiVersion: spaceborn/v1beta1
kind: NavigationStack
metadata:
  name: "aruco-localizer"
spec:
  entrypoint: "/opt/ros/humble/setup.bash && roslaunch aruco_localizer localize.launch"`,
      },
    ],
  },
];

export const mockRuns: Run[] = [
  {
    id: 'RUN-8042',
    org_id: 'org-1',
    stack_name: 'SlamCore_Nav',
    stack_version: 'v2.1.0-rc3',
    stack_version_id: 'ver-1-1',
    scenario_id: 'scen-1',
    scenario_name: 'Warehouse GPS-Denial Standard',
    status: 'Running',
    score: null,
    duration: '12m 45s',
    started_by: 'Jimmy Dane',
    started_at: 'Oct 24, 2024',
    seed: '0x4F3B9A2',
    worker_pod_id: 'pod-8042-xyz',
  },
  {
    id: 'RUN-8041',
    org_id: 'org-1',
    stack_name: 'ArucoLocalizer',
    stack_version: 'v1.4.2',
    stack_version_id: 'ver-3-1',
    scenario_id: 'scen-2',
    scenario_name: 'Office Partial Jam',
    status: 'Passed',
    score: 94.2,
    duration: '18m 20s',
    started_by: 'Sarah Jenkins',
    started_at: 'Oct 24, 2024',
    seed: '0x5E8B1A4',
    worker_pod_id: 'pod-8041-abc',
  },
  {
    id: 'RUN-8040',
    org_id: 'org-1',
    stack_name: 'Cartographer_Base',
    stack_version: 'v3.0.1',
    stack_version_id: 'ver-2-1',
    scenario_id: 'scen-4',
    scenario_name: 'Urban Canopy Jammer',
    status: 'Failed',
    score: 42.1,
    duration: '05m 12s',
    started_by: 'Jimmy Dane',
    started_at: 'Oct 23, 2024',
    seed: '0x9F4B3C8',
    worker_pod_id: 'pod-8040-dfg',
  },
  {
    id: 'RUN-8039',
    org_id: 'org-1',
    stack_name: 'Orbot_Nav2',
    stack_version: 'v0.9.8-alpha',
    stack_version_id: 'ver-orbot',
    scenario_id: 'scen-1',
    scenario_name: 'Warehouse GPS-Denial Standard',
    status: 'Queued',
    score: null,
    duration: '--',
    started_by: '--Automated API',
    started_at: 'Oct 23, 2024',
    seed: '0x2A7C4B1',
    worker_pod_id: 'pod-8039-qwe',
  },
  {
    id: 'RUN-8038',
    org_id: 'org-1',
    stack_name: 'SlamCore_Nav',
    stack_version: 'v2.0.4',
    stack_version_id: 'ver-1-2',
    scenario_id: 'scen-2',
    scenario_name: 'Office Partial Jam',
    status: 'Error',
    score: null,
    duration: '01m 02s',
    started_by: 'Sarah Jenkins',
    started_at: 'Oct 22, 2024',
    seed: '0x3D9E5F2',
    worker_pod_id: 'pod-8038-err',
  },
  {
    id: 'RUN-8037',
    org_id: 'org-1',
    stack_name: 'Cartographer_Base',
    stack_version: 'v3.0.0',
    stack_version_id: 'ver-2-2',
    scenario_id: 'scen-1',
    scenario_name: 'Warehouse GPS-Denial Standard',
    status: 'Passed',
    score: 88.7,
    duration: '15m 00s',
    started_by: 'Jimmy Dane',
    started_at: 'Oct 21, 2024',
    seed: '0x8A2C1D4',
    worker_pod_id: 'pod-8037-fin',
  },
];

export const mockRunResult8041: RunResult = {
  run_id: 'RUN-8041',
  overall_score: 82,
  pass_fail: 'Passed',
  category_scores: {
    localization: 92,
    slam: 85,
    transition: 88,
    navigation: 78,
    exploration: 72,
    safety: 95,
  },
  error_codes: [
    {
      code: 'TF_DELAY_WARN',
      message: 'Transform latency on /base_link to /odom exceeded 0.05s during Phase 3 transition.',
      severity: 'warning',
    },
    {
      code: 'SLAM_RECOVERY',
      message: 'Loop closure optimizer triggered successfully at node timestamp 14:02.1.',
      severity: 'warning',
    },
  ],
  artifact_refs: {
    bag: { name: 'run_8041_topics.mcap', size: '1.8 GB' },
    video: { name: 'run_8041_dashboard_feed.mp4', size: '240 MB' },
    map: { name: 'run_8041_occupancy_grid.tiff', size: '15 MB' },
    log: { name: 'run_8041_system_diagnostics.csv', size: '4 MB' },
  },
};

export const mockRunEvents: RunEvent[] = [
  {
    run_id: 'RUN-8041',
    timestamp: '00:00.000',
    event_type: 'SIM_START',
    description: 'Simulation process initialized across Warehouse test matrix.',
    severity: 'INFO',
  },
  {
    run_id: 'RUN-8041',
    timestamp: '01:24.412',
    event_type: 'GOAL_REACHED',
    description: 'Robot achieved waypoint TARGET_A_04 without path deviation.',
    severity: 'SUCCESS',
  },
  {
    run_id: 'RUN-8041',
    timestamp: '03:10.890',
    event_type: 'TF_DELAY_WARN',
    description: 'ODOM coordinates lookup latched past expected 50ms buffer limit.',
    severity: 'WARNING',
  },
  {
    run_id: 'RUN-8041',
    timestamp: '05:00.000',
    event_type: 'PHASE_TRANSITION',
    description: 'Entering Phase 2: Signal power degradation initiated globally.',
    severity: 'INFO',
  },
  {
    run_id: 'RUN-8041',
    timestamp: '08:14.332',
    event_type: 'LOOP_CLOSURE',
    description: 'SLAM loop matching executed; corrected accumulated drift of 0.12m.',
    severity: 'SUCCESS',
  },
  {
    run_id: 'RUN-8041',
    timestamp: '10:00.000',
    event_type: 'PHASE_TRANSITION',
    description: 'Entering Phase 3: Absolute GPS signal loss triggered.',
    severity: 'CRITICAL',
  },
  {
    run_id: 'RUN-8041',
    timestamp: '11:42.501',
    event_type: 'RECOVERY_TRIGGER',
    description: 'Local IMU propagation system fallback successfully online.',
    severity: 'INFO',
  },
  {
    run_id: 'RUN-8041',
    timestamp: '14:10.092',
    event_type: 'GOAL_REACHED',
    description: 'Robot achieved final destination target TARGET_Z_20.',
    severity: 'SUCCESS',
  },
  {
    run_id: 'RUN-8041',
    timestamp: '15:00.000',
    event_type: 'SIM_COMPLETE',
    description: 'Run completed automatically; final logs saved to index repository.',
    severity: 'INFO',
  },
];

export const mockLeaderboard = [
  { rank: '1st', stackName: 'SlamCore_Nav', version: 'v2.1.0-rc3', score: 94.2, passRate: '98.4%', date: 'Oct 24, 2024', badgeColor: '#D4AF37' },
  { rank: '2nd', stackName: 'Cartographer_Base', version: 'v3.0.1', score: 89.6, passRate: '92.0%', date: 'Oct 22, 2024', badgeColor: '#C0C0C0' },
  { rank: '3rd', stackName: 'ArucoLocalizer', version: 'v1.4.2', score: 84.2, passRate: '85.6%', date: 'Oct 24, 2024', badgeColor: '#CD7F32' },
  { rank: '4th', stackName: 'Orbot_Nav2', version: 'v0.9.8-alpha', score: 78.4, passRate: '76.2%', date: 'Oct 23, 2024', badgeColor: '' },
  { rank: '5th', stackName: 'LioSam_Modified', version: 'v1.0.2-alpha', score: 71.0, passRate: '64.8%', date: 'Oct 20, 2024', badgeColor: '' },
  { rank: '6th', stackName: 'Ros2_Navigation', version: 'v2.2.1', score: 68.5, passRate: '61.0%', date: 'Oct 19, 2024', badgeColor: '' },
];
