'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProjectData, Hazard, Requirement, Test } from '@/types';
import { loadProjectData, resetProjectData } from '@/lib/storage';
import { riskLevel, getRiskColor, truncate } from '@/lib/utils';

export default function Dashboard() {
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
  ).length;
  const hazardsWithoutReqs = hazards.filter(
    (h) => !hazardReqLinks.some((link) => link.hazardId === h.id)
  ).length;
  const reqsWithoutTests = requirements.filter(
    (r) => !reqTestLinks.some((link) => link.requirementId === r.id)
  ).length;

  // Gap Finder: Hazards missing requirements
  const hazardsMissingReqs = hazards
    .filter((h) => !hazardReqLinks.some((link) => link.hazardId === h.id))
    .slice(0, 5);

  // Gap Finder: Requirements missing tests
  const reqsMissingTests = requirements
    .filter((r) => !reqTestLinks.some((link) => link.requirementId === r.id))
    .slice(0, 5);

  // Gap Finder: Tests missing evidenceLink where status=Pass or Fail
  const testsMissingEvidence = tests
    .filter((t) => (t.status === 'Pass' || t.status === 'Fail') && !t.evidenceLink)
    .slice(0, 5);

  const handleReset = () => {
    const newData = resetProjectData();
    setData(newData);
    window.location.reload();
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SafetyHub</h1>
          <p className="text-gray-600">UAV Flight Control System (Demo)</p>
        </div>

        {/* KPI Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Total Hazards</div>
            <div className="text-3xl font-bold text-gray-900">{totalHazards}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">High Risk Hazards</div>
            <div className="text-3xl font-bold text-red-600">{highRiskHazards}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Hazards w/o Requirements</div>
            <div className="text-3xl font-bold text-orange-600">{hazardsWithoutReqs}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Requirements w/o Tests</div>
            <div className="text-3xl font-bold text-yellow-600">{reqsWithoutTests}</div>
          </div>
        </div>

        {/* Gap Finder */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Hazards missing requirements */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Hazards Missing Requirements
            </h2>
            {hazardsMissingReqs.length > 0 ? (
              <ul className="space-y-2">
                {hazardsMissingReqs.map((hazard) => (
                  <li
                    key={hazard.id}
                    className="p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer transition"
                  >
                    <div className="font-mono text-sm text-gray-600">{hazard.code}</div>
                    <div className="text-sm text-gray-900">{truncate(hazard.title, 50)}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No gaps found</p>
            )}
          </div>

          {/* Requirements missing tests */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Requirements Missing Tests
            </h2>
            {reqsMissingTests.length > 0 ? (
              <ul className="space-y-2">
                {reqsMissingTests.map((req) => (
                  <li
                    key={req.id}
                    className="p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer transition"
                  >
                    <div className="font-mono text-sm text-gray-600">{req.code}</div>
                    <div className="text-sm text-gray-900">{truncate(req.text, 50)}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No gaps found</p>
            )}
          </div>

          {/* Tests missing evidence */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tests Missing Evidence
            </h2>
            {testsMissingEvidence.length > 0 ? (
              <ul className="space-y-2">
                {testsMissingEvidence.map((test) => (
                  <li
                    key={test.id}
                    className="p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer transition"
                  >
                    <div className="font-mono text-sm text-gray-600">{test.code}</div>
                    <div className="text-sm text-gray-900">{truncate(test.name, 50)}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No gaps found</p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Link
            href="/hazards"
            className="px-4 py-3 bg-white rounded-lg shadow hover:shadow-md transition text-center font-medium text-gray-700 hover:text-blue-600"
          >
            Hazards
          </Link>
          <Link
            href="/requirements"
            className="px-4 py-3 bg-white rounded-lg shadow hover:shadow-md transition text-center font-medium text-gray-700 hover:text-blue-600"
          >
            Requirements
          </Link>
          <Link
            href="/tests"
            className="px-4 py-3 bg-white rounded-lg shadow hover:shadow-md transition text-center font-medium text-gray-700 hover:text-blue-600"
          >
            Tests
          </Link>
          <Link
            href="/status-report"
            className="px-4 py-3 bg-white rounded-lg shadow hover:shadow-md transition text-center font-medium text-gray-700 hover:text-blue-600"
          >
            Status Report
          </Link>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/traceability"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            View Traceability →
          </Link>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Reset Demo Data
          </button>
        </div>
      </div>
    </div>
  );
}

