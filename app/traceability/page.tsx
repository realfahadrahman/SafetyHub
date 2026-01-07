'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProjectData, Hazard, Requirement, Test } from '@/types';
import { loadProjectData } from '@/lib/storage';
import { riskLevel, getRiskColor, truncate } from '@/lib/utils';

export default function Traceability() {
  const [data, setData] = useState<ProjectData | null>(null);
  const [selectedHazardId, setSelectedHazardId] = useState<string | null>(null);
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);

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

  // Get selected hazard
  const selectedHazard = selectedHazardId
    ? hazards.find((h) => h.id === selectedHazardId)
    : null;

  // Get requirements linked to selected hazard
  const linkedReqs = selectedHazard
    ? requirements.filter((r) =>
        hazardReqLinks.some(
          (link) => link.hazardId === selectedHazard.id && link.requirementId === r.id
        )
      )
    : [];

  // Get selected requirement
  const selectedReq = selectedReqId
    ? requirements.find((r) => r.id === selectedReqId)
    : null;

  // Get tests linked to selected requirement
  const linkedTests = selectedReq
    ? tests.filter((t) =>
        reqTestLinks.some(
          (link) => link.requirementId === selectedReq.id && link.testId === t.id
        )
      )
    : [];

  // Calculate counts for selected hazard
  const reqCount = selectedHazard ? linkedReqs.length : 0;
  const testCount = selectedHazard
    ? linkedReqs.reduce((count, req) => {
        const reqTests = tests.filter((t) =>
          reqTestLinks.some((link) => link.requirementId === req.id && link.testId === t.id)
        );
        return count + reqTests.length;
      }, 0)
    : 0;

  const hazardRisk = selectedHazard
    ? riskLevel(selectedHazard.severity, selectedHazard.likelihood)
    : null;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Traceability</h1>
          <p className="text-gray-600">UAV Flight Control System (Demo)</p>
        </div>

        {/* Selected Hazard Info */}
        {selectedHazard && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-lg font-semibold">{selectedHazard.code}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskColor(
                      hazardRisk!
                    )}`}
                  >
                    {hazardRisk} Risk
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                    {selectedHazard.status}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedHazard.title}</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Severity</div>
                <div className="font-semibold text-gray-900">{selectedHazard.severity}</div>
              </div>
              <div>
                <div className="text-gray-500">Likelihood</div>
                <div className="font-semibold text-gray-900">{selectedHazard.likelihood}</div>
              </div>
              <div>
                <div className="text-gray-500">Linked Requirements</div>
                <div className="font-semibold text-gray-900">{reqCount}</div>
              </div>
              <div>
                <div className="text-gray-500">Linked Tests</div>
                <div className="font-semibold text-gray-900">{testCount}</div>
              </div>
            </div>
          </div>
        )}

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Hazards */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hazards</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {hazards.map((hazard) => {
                const risk = riskLevel(hazard.severity, hazard.likelihood);
                const isSelected = selectedHazardId === hazard.id;
                return (
                  <div
                    key={hazard.id}
                    onClick={() => {
                      setSelectedHazardId(hazard.id);
                      setSelectedReqId(null);
                    }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-sm font-semibold">{hazard.code}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold border ${getRiskColor(
                          risk
                        )}`}
                      >
                        {risk}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                        {hazard.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-900">{truncate(hazard.title, 60)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Middle: Requirements */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Requirements
              {selectedHazard && ` (${linkedReqs.length})`}
            </h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {selectedHazard ? (
                linkedReqs.length > 0 ? (
                  linkedReqs.map((req) => {
                    const isSelected = selectedReqId === req.id;
                    return (
                      <div
                        key={req.id}
                        onClick={() => setSelectedReqId(req.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm font-semibold">{req.code}</span>
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                            {req.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-900">{truncate(req.text, 80)}</div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">No requirements linked</p>
                )
              ) : (
                <p className="text-sm text-gray-500">Select a hazard to view requirements</p>
              )}
            </div>
          </div>

          {/* Right: Tests */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tests
              {selectedReq && ` (${linkedTests.length})`}
            </h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {selectedReq ? (
                linkedTests.length > 0 ? (
                  linkedTests.map((test) => (
                    <div
                      key={test.id}
                      className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm font-semibold">{test.code}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            test.status === 'Pass'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : test.status === 'Fail'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {test.status}
                        </span>
                        {test.evidenceLink && (
                          <a
                            href={test.evidenceLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                            title="View evidence"
                          >
                            🔗
                          </a>
                        )}
                      </div>
                      <div className="text-sm text-gray-900">{truncate(test.name, 80)}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No tests linked</p>
                )
              ) : (
                <p className="text-sm text-gray-500">Select a requirement to view tests</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

