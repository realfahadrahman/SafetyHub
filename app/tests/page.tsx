'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProjectData, Test, Requirement } from '@/types';
import { loadProjectData } from '@/lib/storage';
import { truncate } from '@/lib/utils';

export default function TestsPage() {
  const [data, setData] = useState<ProjectData | null>(null);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [showMissingEvidenceOnly, setShowMissingEvidenceOnly] = useState(false);

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

  const { tests, requirements, reqTestLinks } = data;

  // Get linked requirements count for each test
  const getLinkedReqsCount = (testId: string) => {
    return reqTestLinks.filter((link) => link.testId === testId).length;
  };

  // Filter tests
  let filteredTests = tests;
  if (showMissingEvidenceOnly) {
    filteredTests = tests.filter(
      (t) => (t.status === 'Pass' || t.status === 'Fail') && !t.evidenceLink
    );
  }

  const linkedReqsForSelected = selectedTest
    ? requirements.filter((r) =>
        reqTestLinks.some(
          (link) => link.testId === selectedTest.id && link.requirementId === r.id
        )
      )
    : [];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tests</h1>
          <p className="text-gray-600">UAV Flight Control System (Demo)</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showMissingEvidenceOnly}
              onChange={(e) => setShowMissingEvidenceOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Show missing evidence only</span>
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Evidence
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Linked Reqs
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTests.map((test) => {
                      const hasEvidence =
                        test.status === 'Pass' || test.status === 'Fail'
                          ? !!test.evidenceLink
                          : true; // Planned tests don't need evidence yet
                      const isSelected = selectedTest?.id === test.id;
                      const linkedReqsCount = getLinkedReqsCount(test.id);
                      return (
                        <tr
                          key={test.id}
                          onClick={() => setSelectedTest(test)}
                          className={`cursor-pointer hover:bg-gray-50 transition ${
                            isSelected ? 'bg-blue-50' : ''
                          }`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-mono text-sm font-semibold">{test.code}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">{truncate(test.name, 50)}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                test.status === 'Pass'
                                  ? 'bg-green-100 text-green-800 border border-green-200'
                                  : test.status === 'Fail'
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : 'bg-gray-100 text-gray-700 border border-gray-200'
                              }`}
                            >
                              {test.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {test.status === 'Pass' || test.status === 'Fail' ? (
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  hasEvidence
                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                    : 'bg-red-100 text-red-800 border border-red-200'
                                }`}
                              >
                                {hasEvidence ? 'Present' : 'Missing'}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {linkedReqsCount}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredTests.length === 0 && (
                <div className="p-8 text-center text-gray-500">No tests found</div>
              )}
            </div>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-1">
            {selectedTest ? (
              <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{selectedTest.code}</h2>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Name</div>
                    <div className="text-sm text-gray-900">{selectedTest.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Status</div>
                    <span
                      className={`px-3 py-1 rounded text-sm font-semibold ${
                        selectedTest.status === 'Pass'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : selectedTest.status === 'Fail'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {selectedTest.status}
                    </span>
                  </div>
                  {(selectedTest.status === 'Pass' || selectedTest.status === 'Fail') && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Evidence</div>
                      {selectedTest.evidenceLink ? (
                        <a
                          href={selectedTest.evidenceLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                        >
                          {selectedTest.evidenceLink}
                        </a>
                      ) : (
                        <span className="text-sm text-red-600 font-semibold">Missing</span>
                      )}
                    </div>
                  )}
                  <div className="border-t pt-4">
                    <div className="text-sm font-semibold text-gray-900 mb-2">
                      Linked Requirements ({linkedReqsForSelected.length})
                    </div>
                    {linkedReqsForSelected.length > 0 ? (
                      <ul className="space-y-2">
                        {linkedReqsForSelected.map((req) => (
                          <li key={req.id} className="text-sm text-gray-700">
                            <span className="font-mono">{req.code}</span>: {truncate(req.text, 60)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No requirements linked</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-500">Select a test to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

