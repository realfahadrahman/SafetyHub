import { ProjectData } from '@/types';

export function seedDemoData(): ProjectData {
  const hazards = [
    {
      id: 'h1',
      code: 'H-001',
      title: 'Loss of flight control due to sensor failure',
      severity: 'Catastrophic',
      likelihood: 'Probable',
      status: 'Open',
    },
    {
      id: 'h2',
      code: 'H-002',
      title: 'Battery fire during charging',
      severity: 'Critical',
      likelihood: 'Occasional',
      status: 'MitigationDefined',
    },
    {
      id: 'h3',
      code: 'H-003',
      title: 'GPS signal loss in urban canyon',
      severity: 'Major',
      likelihood: 'Frequent',
      status: 'Open',
    },
    {
      id: 'h4',
      code: 'H-004',
      title: 'Propeller imbalance causing vibration',
      severity: 'Major',
      likelihood: 'Remote',
      status: 'Closed',
    },
    {
      id: 'h5',
      code: 'H-005',
      title: 'Communication link failure',
      severity: 'Critical',
      likelihood: 'Remote',
      status: 'Open',
    },
    {
      id: 'h6',
      code: 'H-006',
      title: 'Software memory overflow',
      severity: 'Catastrophic',
      likelihood: 'Occasional',
      status: 'Open',
    },
  ];

  const requirements = [
    {
      id: 'r1',
      code: 'REQ-001',
      text: 'The system shall detect sensor failures within 100ms and switch to backup sensors',
      status: 'Implemented',
    },
    {
      id: 'r2',
      code: 'REQ-002',
      text: 'The system shall monitor battery temperature and prevent charging above 45°C',
      status: 'Verified',
    },
    {
      id: 'r3',
      code: 'REQ-003',
      text: 'The system shall maintain flight stability using IMU when GPS is unavailable',
      status: 'Draft',
    },
    {
      id: 'r4',
      code: 'REQ-004',
      text: 'The system shall perform pre-flight propeller balance check',
      status: 'Verified',
    },
    {
      id: 'r5',
      code: 'REQ-005',
      text: 'The system shall establish redundant communication links with automatic failover',
      status: 'Draft',
    },
    {
      id: 'r6',
      code: 'REQ-006',
      text: 'The system shall implement memory protection and overflow detection',
      status: 'Implemented',
    },
    {
      id: 'r7',
      code: 'REQ-007',
      text: 'The system shall log all sensor readings for post-flight analysis',
      status: 'Draft',
    },
    {
      id: 'r8',
      code: 'REQ-008',
      text: 'The system shall provide emergency landing capability when critical failures occur',
      status: 'Implemented',
    },
    {
      id: 'r9',
      code: 'REQ-009',
      text: 'The system shall validate all input data before processing',
      status: 'Draft',
    },
    {
      id: 'r10',
      code: 'REQ-010',
      text: 'The system shall maintain minimum safe altitude during autonomous flight',
      status: 'Draft',
    },
  ];

  const tests = [
    {
      id: 't1',
      code: 'TEST-001',
      name: 'Sensor failure detection latency test',
      status: 'Pass',
      evidenceLink: 'https://docs.example.com/test-001',
    },
    {
      id: 't2',
      code: 'TEST-002',
      name: 'Battery temperature monitoring test',
      status: 'Pass',
      evidenceLink: 'https://docs.example.com/test-002',
    },
    {
      id: 't3',
      code: 'TEST-003',
      name: 'GPS loss recovery test',
      status: 'Pass',
      // Missing evidenceLink - gap
    },
    {
      id: 't4',
      code: 'TEST-004',
      name: 'Propeller balance check test',
      status: 'Pass',
      evidenceLink: 'https://docs.example.com/test-004',
    },
    {
      id: 't5',
      code: 'TEST-005',
      name: 'Communication failover test',
      status: 'Planned',
    },
    {
      id: 't6',
      code: 'TEST-006',
      name: 'Memory overflow detection test',
      status: 'Pass',
      // Missing evidenceLink - gap
    },
    {
      id: 't7',
      code: 'TEST-007',
      name: 'Emergency landing procedure test',
      status: 'Fail',
      evidenceLink: 'https://docs.example.com/test-007',
    },
    {
      id: 't8',
      code: 'TEST-008',
      name: 'Input data validation test',
      status: 'Planned',
    },
  ];

  // Links: Ensure gaps exist
  // H-001 (h1) -> REQ-001 (r1) -> TEST-001 (t1) ✓
  // H-002 (h2) -> REQ-002 (r2) -> TEST-002 (t2) ✓
  // H-004 (h4) -> REQ-004 (r4) -> TEST-004 (t4) ✓
  // H-006 (h6) -> REQ-006 (r6) -> TEST-006 (t6) ✓
  // H-001 -> REQ-008 (r8) -> TEST-007 (t7) ✓
  // H-006 -> REQ-008 (r8) -> TEST-007 (t7) ✓
  // H-003 and H-005 have NO requirements - gap (2 hazards)
  // REQ-003, REQ-005, REQ-007, REQ-009, REQ-010 have no tests - gap (5 requirements)

  const hazardReqLinks = [
    { hazardId: 'h1', requirementId: 'r1' },
    { hazardId: 'h1', requirementId: 'r8' },
    { hazardId: 'h2', requirementId: 'r2' },
    { hazardId: 'h4', requirementId: 'r4' },
    { hazardId: 'h6', requirementId: 'r6' },
    { hazardId: 'h6', requirementId: 'r8' },
    // H-003 and H-005 intentionally have no links (gaps)
  ];

  const reqTestLinks = [
    { requirementId: 'r1', testId: 't1' },
    { requirementId: 'r2', testId: 't2' },
    { requirementId: 'r4', testId: 't4' },
    { requirementId: 'r6', testId: 't6' },
    { requirementId: 'r8', testId: 't7' },
    // REQ-003, REQ-005, REQ-007, REQ-009, REQ-010 intentionally have no links (gaps)
  ];

  return {
    hazards,
    requirements,
    tests,
    hazardReqLinks,
    reqTestLinks,
  };
}

