import { ProjectData } from '@/types';
import { seedDemoData } from './demoData';

const STORAGE_KEY = 'safetyhub_project_data';

export function loadProjectData(): ProjectData {
  if (typeof window === 'undefined') {
    return seedDemoData();
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored data', e);
    }
  }

  // First load: seed and store
  const data = seedDemoData();
  saveProjectData(data);
  return data;
}

export function saveProjectData(data: ProjectData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetProjectData(): ProjectData {
  if (typeof window === 'undefined') return seedDemoData();
  localStorage.removeItem(STORAGE_KEY);
  const data = seedDemoData();
  saveProjectData(data);
  return data;
}

