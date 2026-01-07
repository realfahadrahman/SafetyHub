'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProjectData, Hazard, Requirement, RiskLevel, HazardStatus } from '@/types';
import { loadProjectData, saveProjectData } from '@/lib/storage';
import { riskLevel, getRiskColor, truncate } from '@/lib/utils';

export default function HazardsPage() {
  const [data, setData] = useState<ProjectData | null>(null);
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<HazardStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedReqIds, setSelectedReqIds] = useState<Set<string>>(new Set());

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

  const { hazards, requirements, hazardReqLinks, reqTestLinks, tests } = data;

  // Filter hazards
  let filteredHazards = hazards.filter((h) => {
    const risk = riskLevel(h.severity, h.likelihood);
    const matchesRisk = riskFilter === 'All' || risk === riskFilter;
    const matchesStatus = statusFilter === 'All' || h.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      h.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesStatus && matchesSearch;
  });

  // Get linked requirements and tests count for each hazard
  const getLinkedCounts = (hazardId: string) => {
    const linkedReqs = hazardReqLinks.filter((link) => link.hazardId === hazardId);
    const reqIds = linkedReqs.map((link) => link.requirementId);
    const linkedTests = reqIds.reduce((count, reqId) => {
      const testLinks = reqTestLinks.filter((link) => link.requirementId === reqId);
      return count + testLinks.length;
    }, 0);
    return { reqs: linkedReqs.length, tests: linkedTests };
  };

  const linkedReqsForSelected = selectedHazard
    ? requirements.filter((r) =>
        hazardReqLinks.some(
          (link) => link.hazardId === selectedHazard.id && link.requirementId === r.id
        )
      )
    : [];

  const handleOpenLinkModal = () => {
    if (selectedHazard) {
      const currentLinks = hazardReqLinks
        .filter((link) => link.hazardId === selectedHazard.id)
        .map((link) => link.requirementId);
      setSelectedReqIds(new Set(currentLinks));
      setShowLinkModal(true);
    }
  };

  const handleToggleRequirement = (reqId: string) => {
    const newSet = new Set(selectedReqIds);
    if (newSet.has(reqId)) {
      newSet.delete(reqId);
    } else {
      newSet.add(reqId);
    }
    setSelectedReqIds(newSet);
  };

  const handleSaveLinks = () => {
    if (!selectedHazard || !data) return;

    // Remove existing links for this hazard
    const newLinks = data.hazardReqLinks.filter(
      (link) => link.hazardId !== selectedHazard.id
    );

    // Add new links
    selectedReqIds.forEach((reqId) => {
      newLinks.push({ hazardId: selectedHazard.id, requirementId: reqId });
    });

    const updatedData = { ...data, hazardReqLinks: newLinks };
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hazards</h1>
          <p className="text-gray-600">UAV Flight Control System (Demo)</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Risk</label>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value as RiskLevel | 'All')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as HazardStatus | 'All')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All</option>
                <option value="Open">Open</option>
                <option value="MitigationDefined">Mitigation Defined</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Code or title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
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
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Likelihood
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Risk
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reqs
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tests
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredHazards.map((hazard) => {
                      const risk = riskLevel(hazard.severity, hazard.likelihood);
                      const counts = getLinkedCounts(hazard.id);
                      const isSelected = selectedHazard?.id === hazard.id;
                      return (
                        <tr
                          key={hazard.id}
                          onClick={() => setSelectedHazard(hazard)}
                          className={`cursor-pointer hover:bg-gray-50 transition ${
                            isSelected ? 'bg-blue-50' : ''
                          }`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-mono text-sm font-semibold">{hazard.code}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">{truncate(hazard.title, 40)}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{hazard.severity}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{hazard.likelihood}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold border ${getRiskColor(
                                risk
                              )}`}
                            >
                              {risk}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                              {hazard.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {counts.reqs}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {counts.tests}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredHazards.length === 0 && (
                <div className="p-8 text-center text-gray-500">No hazards found</div>
              )}
            </div>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-1">
            {selectedHazard ? (
              <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {selectedHazard.code}
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Title</div>
                    <div className="text-sm text-gray-900">{selectedHazard.title}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Severity</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {selectedHazard.severity}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Likelihood</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {selectedHazard.likelihood}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Risk</div>
                    <span
                      className={`px-3 py-1 rounded text-sm font-semibold border ${getRiskColor(
                        riskLevel(selectedHazard.severity, selectedHazard.likelihood)
                      )}`}
                    >
                      {riskLevel(selectedHazard.severity, selectedHazard.likelihood)}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Status</div>
                    <span className="px-3 py-1 rounded text-sm font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                      {selectedHazard.status}
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold text-gray-900">
                        Linked Requirements ({linkedReqsForSelected.length})
                      </div>
                      <button
                        onClick={handleOpenLinkModal}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Link requirements
                      </button>
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
                  <div className="pt-4">
                    <Link
                      href="/traceability"
                      className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Jump to Traceability →
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-500">Select a hazard to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Link Requirements Modal */}
      {showLinkModal && selectedHazard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                Link Requirements to {selectedHazard.code}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{selectedHazard.title}</p>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-2">
                {requirements.map((req) => (
                  <label
                    key={req.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-200"
                  >
                    <input
                      type="checkbox"
                      checked={selectedReqIds.has(req.id)}
                      onChange={() => handleToggleRequirement(req.id)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-mono text-sm font-semibold text-gray-900">
                        {req.code}
                      </div>
                      <div className="text-sm text-gray-700">{req.text}</div>
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

