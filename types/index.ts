export type HazardSeverity = 'Catastrophic' | 'Critical' | 'Major' | 'Minor';
export type HazardLikelihood = 'Frequent' | 'Probable' | 'Occasional' | 'Remote';
export type HazardStatus = 'Open' | 'MitigationDefined' | 'Closed';
export type RequirementStatus = 'Draft' | 'Implemented' | 'Verified';
export type TestStatus = 'Planned' | 'Pass' | 'Fail';
export type RiskLevel = 'High' | 'Medium' | 'Low';

export interface Hazard {
  id: string;
  code: string;
  title: string;
  severity: HazardSeverity;
  likelihood: HazardLikelihood;
  status: HazardStatus;
}

export interface Requirement {
  id: string;
  code: string;
  text: string;
  status: RequirementStatus;
}

export interface Test {
  id: string;
  code: string;
  name: string;
  status: TestStatus;
  evidenceLink?: string;
}

export interface HazardReqLink {
  hazardId: string;
  requirementId: string;
}

export interface ReqTestLink {
  requirementId: string;
  testId: string;
}

export interface ProjectData {
  hazards: Hazard[];
  requirements: Requirement[];
  tests: Test[];
  hazardReqLinks: HazardReqLink[];
  reqTestLinks: ReqTestLink[];
}

