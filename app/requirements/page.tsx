'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProjectData, Requirement, Hazard, Test } from '@/types';
import { loadProjectData, saveProjectData } from '@/lib/storage';
import { truncate } from '@/lib/utils';

export default function RequirementsPage() {
  const [data, setData] = useState<ProjectData | null>(null);
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);
  const [showNotCoveredOnly, setShowNotCoveredOnly] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedTestIds, setSelectedTestIds] = useState<Set<string>>(new Set());

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

  const { requirements, hazards, tests, hazardReqLinks, reqTestLinks } = data;

  // Get linked counts for each requirement
  const getLinkedCounts = (reqId: string) => {
    const linkedHazards = hazardReqLinks.filter((link) => link.requirementId === reqId);
    const linkedTests = reqTestLinks.filter((link) => link.requirementId === reqId);
    return { hazards: linkedHazards.length, tests: linkedTests.length };
  };

  // Filter requirements
  let filteredReqs = requirements;
  if (showNotCoveredOnly) {
    filteredReqs = requirements.filter((req) => {
      const counts = getLinkedCounts(req.id);
      return counts.tests === 0;
    });
  }

  const linkedHazardsForSelected = selectedReq
    ? hazards.filter((h) =>
        hazardReqLinks.some(
          (link) => link.requirementId === selectedReq.id && link.hazardId === h.id
        )
      )
    : [];

  const linkedTestsForSelected = selectedReq
    ? tests.filter((t) =>
        reqTestLinks.some(
          (link) => link.requirementId === selectedReq.id && link.testId === t.id
        )
      )
    : [];

  const handleOpenLinkModal = () => {
    if (selectedReq) {
      const currentLinks = reqTestLinks
        .filter((link) => link.requirementId === selectedReq.id)
        .map((link) => link.testId);
      setSelectedTestIds(new Set(currentLinks));
      setShowLinkModal(true);
    }
  };

  const handleToggleTest = (testId: string) => {
    const newSet = new Set(selectedTestIds);
    if (newSet.has(testId)) {
      newSet.delete(testId);
    } else {
      newSet.add(testId);
    }
    setSelectedTestIds(newSet);
  };

  const handleSaveLinks = () => {
    if (!selectedReq || !data) return;

    // Remove existing links for this requirement
    const newLinks = data.reqTestLinks.filter(
      (link) => link.requirementId !== selectedReq.id
    );

    // Add new links
    selectedTestIds.forEach((testId) => {
      newLinks.push({ requirementId: selectedReq.id, testId });
    });

    const updatedData = { ...data, reqTestLinks: newLinks };
    saveProjectData(updatedData);
    setData(updatedData);
    setShowLinkModal(false);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Requirements</h1>
          <p className="text-gray-600">UAV Flight Control System (Demo)</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showNotCoveredOnly}
              onChange={(e) => setShowNotCoveredOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Show not covered only</span>
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
                        Text
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hazards
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tests
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coverage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReqs.map((req) => {
                      const counts = getLinkedCounts(req.id);
                      const isCovered = counts.tests > 0;
                      const isSelected = selectedReq?.id === req.id;
                      return (
                        <tr
                          key={req.id}
                          onClick={() => setSelectedReq(req)}
                          className={`cursor-pointer hover:bg-gray-50 transition ${
                            isSelected ? 'bg-blue-50' : ''
                          }`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-mono text-sm font-semibold">{req.code}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">{truncate(req.text, 60)}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                              {req.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {counts.hazards}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {counts.tests}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                isCovered
                                  ? 'bg-green-100 text-green-800 border border-green-200'
                                  : 'bg-red-100 text-red-800 border border-red-200'
                              }`}
                            >
                              {isCovered ? 'Covered' : 'Not covered'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredReqs.length === 0 && (
                <div className="p-8 text-center text-gray-500">No requirements found</div>
              )}
            </div>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-1">
            {selectedReq ? (
              <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{selectedReq.code}</h2>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Text</div>
                    <div className="text-sm text-gray-900">{selectedReq.text}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Status</div>
                    <span className="px-3 py-1 rounded text-sm font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                      {selectedReq.status}
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="text-sm font-semibold text-gray-900 mb-2">
                      Linked Hazards ({linkedHazardsForSelected.length})
                    </div>
                    {linkedHazardsForSelected.length > 0 ? (
                      <ul className="space-y-2">
                        {linkedHazardsForSelected.map((hazard) => (
                          <li key={hazard.id} className="text-sm text-gray-700">
                            <span className="font-mono">{hazard.code}</span>: {hazard.title}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No hazards linked</p>
                    )}
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold text-gray-900">
                        Linked Tests ({linkedTestsForSelected.length})
                      </div>
                      <button
                        onClick={handleOpenLinkModal}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Link tests
                      </button>
                    </div>
                    {linkedTestsForSelected.length > 0 ? (
                      <ul className="space-y-2">
                        {linkedTestsForSelected.map((test) => (
                          <li key={test.id} className="text-sm text-gray-700">
                            <span className="font-mono">{test.code}</span>: {test.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No tests linked</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-500">Select a requirement to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Link Tests Modal */}
      {showLinkModal && selectedReq && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                Link Tests to {selectedReq.code}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{truncate(selectedReq.text, 80)}</p>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-2">
                {tests.map((test) => (
                  <label
                    key={test.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-200"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTestIds.has(test.id)}
                      onChange={() => handleToggleTest(test.id)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-gray-900">
                          {test.code}
                        </span>
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
                      </div>
                      <div className="text-sm text-gray-700 mt-1">{test.name}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="p-6 border-t flex gap-3 justify-end">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLinks}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Save Links
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

