'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProjectData } from '@/types';
import { loadProjectData } from '@/lib/storage';
import { riskLevel, getRiskColor, truncate } from '@/lib/utils';

export default function StatusReportPage() {
  const [data, setData] = useState<ProjectData | null>(null);

  useEffect(() => {
    setData(loadProjectData());
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const { hazards, requirements, tests, hazardReqLinks, reqTestLinks } = data;

  // Calculate KPIs
  const totalHazards = hazards.length;
  const highRiskHazards = hazards.filter(
    (h) => riskLevel(h.severity, h.likelihood) === 'High'
  );
  const hazardsWithoutReqs = hazards.filter(
    (h) => !hazardReqLinks.some((link) => link.hazardId === h.id)
  );
  const reqsWithoutTests = requirements.filter(
    (r) => !reqTestLinks.some((link) => link.requirementId === r.id)
  );
  const coveredReqs = requirements.filter((r) =>
    reqTestLinks.some((link) => link.requirementId === r.id)
  );
  const coveragePercent = Math.round((coveredReqs.length / requirements.length) * 100);

  // Top gaps
  const topHazardsMissingReqs = hazardsWithoutReqs.slice(0, 5);
  const topReqsMissingTests = reqsWithoutTests.slice(0, 5);
  const testsMissingEvidence = tests
    .filter((t) => (t.status === 'Pass' || t.status === 'Fail') && !t.evidenceLink)
    .slice(0, 5);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen p-8 bg-white print:p-4">
      <div className="max-w-4xl mx-auto print:max-w-full">
        {/* Header - hidden when printing */}
        <div className="mb-8 print:hidden">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Status Report</h1>
              <p className="text-gray-600">UAV Flight Control System (Demo)</p>
            </div>
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Print
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="space-y-8">
          {/* Title for print */}
          <div className="hidden print:block mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Safety Status Report</h1>
            <p className="text-gray-600">UAV Flight Control System (Demo)</p>
            <p className="text-sm text-gray-500 mt-2">
              Generated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* KPIs */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Performance Indicators</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Total Hazards</div>
                <div className="text-2xl font-bold text-gray-900">{totalHazards}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">High Risk Hazards</div>
                <div className="text-2xl font-bold text-red-600">{highRiskHazards.length}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Hazards w/o Requirements</div>
                <div className="text-2xl font-bold text-orange-600">{hazardsWithoutReqs.length}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Requirements w/o Tests</div>
                <div className="text-2xl font-bold text-yellow-600">{reqsWithoutTests.length}</div>
              </div>
            </div>
          </section>

          {/* Coverage Summary */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Coverage Summary</h2>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-medium text-gray-700">Requirements Coverage</span>
                <span className="text-2xl font-bold text-gray-900">{coveragePercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${coveragePercent}%` }}
                ></div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {coveredReqs.length} of {requirements.length} requirements have linked tests
              </div>
            </div>
          </section>

          {/* Top Gaps */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Top Gaps</h2>
            <div className="space-y-6">
              {/* Hazards Missing Requirements */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Hazards Missing Requirements ({topHazardsMissingReqs.length})
                </h3>
                {topHazardsMissingReqs.length > 0 ? (
                  <ul className="space-y-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    {topHazardsMissingReqs.map((hazard) => (
                      <li key={hazard.id} className="text-sm text-gray-700">
                        <span className="font-mono font-semibold">{hazard.code}</span>:{' '}
                        {hazard.title}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    No gaps found
                  </p>
                )}
              </div>

              {/* Requirements Missing Tests */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Requirements Missing Tests ({topReqsMissingTests.length})
                </h3>
                {topReqsMissingTests.length > 0 ? (
                  <ul className="space-y-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    {topReqsMissingTests.map((req) => (
                      <li key={req.id} className="text-sm text-gray-700">
                        <span className="font-mono font-semibold">{req.code}</span>:{' '}
                        {truncate(req.text, 80)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    No gaps found
                  </p>
                )}
              </div>

              {/* Tests Missing Evidence */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Tests Missing Evidence ({testsMissingEvidence.length})
                </h3>
                {testsMissingEvidence.length > 0 ? (
                  <ul className="space-y-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    {testsMissingEvidence.map((test) => (
                      <li key={test.id} className="text-sm text-gray-700">
                        <span className="font-mono font-semibold">{test.code}</span>: {test.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    No gaps found
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* High-Risk Hazards */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              High-Risk Hazards ({highRiskHazards.length})
            </h2>
            {highRiskHazards.length > 0 ? (
              <div className="space-y-3">
                {highRiskHazards.map((hazard) => {
                  const risk = riskLevel(hazard.severity, hazard.likelihood);
                  const linkedReqs = hazardReqLinks.filter((link) => link.hazardId === hazard.id);
                  return (
                    <div
                      key={hazard.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-mono font-semibold text-gray-900">
                            {hazard.code}
                          </span>
                          <span
                            className={`ml-2 px-2 py-1 rounded text-xs font-semibold border ${getRiskColor(
                              risk
                            )}`}
                          >
                            {risk} Risk
                          </span>
                        </div>
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                          {hazard.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 mb-2">{hazard.title}</div>
                      <div className="text-xs text-gray-500">
                        Severity: {hazard.severity} | Likelihood: {hazard.likelihood} | Linked
                        Requirements: {linkedReqs.length}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4 border border-gray-200">
                No high-risk hazards
              </p>
            )}
          </section>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none;
          }
          .print\\:max-w-full {
            max-width: 100%;
          }
          .print\\:p-4 {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

