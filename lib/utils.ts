import { HazardSeverity, HazardLikelihood, RiskLevel } from '@/types';

export function riskLevel(severity: HazardSeverity, likelihood: HazardLikelihood): RiskLevel {
  // High if severity in (Catastrophic, Critical) AND likelihood in (Frequent, Probable, Occasional)
  if (
    (severity === 'Catastrophic' || severity === 'Critical') &&
    (likelihood === 'Frequent' || likelihood === 'Probable' || likelihood === 'Occasional')
  ) {
    return 'High';
  }
  
  // Medium if severity=Major AND likelihood in (Frequent, Probable, Occasional) 
  // OR severity=Critical AND likelihood=Remote
  if (
    (severity === 'Major' && (likelihood === 'Frequent' || likelihood === 'Probable' || likelihood === 'Occasional')) ||
    (severity === 'Critical' && likelihood === 'Remote')
  ) {
    return 'Medium';
  }
  
  // Low otherwise
  return 'Low';
}

export function getRiskColor(risk: RiskLevel): string {
  switch (risk) {
    case 'High':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Low':
      return 'bg-green-100 text-green-800 border-green-200';
  }
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

