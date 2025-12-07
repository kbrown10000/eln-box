// Project (represented as Box folder with metadata)
export interface Project {
  folderId: string;
  projectCode: string;
  projectName: string;
  piName: string;
  piEmail: string;
  department: string;
  startDate: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'archived';
  description: string;
}

// Experiment (Box folder with metadata)
export interface Experiment {
  folderId: string;
  experimentId: string;
  experimentTitle: string;
  objective: string;
  hypothesis: string;
  ownerName: string;
  ownerEmail: string;
  startedAt?: string;
  completedAt?: string;
  status: 'draft' | 'in-progress' | 'review' | 'rejected' | 'completed' | 'locked';
  tags: string[];
}

// Entry (Box file with metadata)
export interface Entry {
  fileId: string;
  entryId: string;
  entryDate: string;
  authorName: string;
  authorEmail: string;
  title: string;
  entryType: 'protocol' | 'observation' | 'results' | 'analysis' | 'conclusion';
  status: 'draft' | 'submitted' | 'reviewed' | 'signed' | 'locked';
  version: string;
  signedAt?: string;
  signedBy?: string;
  signatureHash?: string;
  content?: string; // Markdown content
}

// Box API Response Types
export interface BoxFile {
  id: string;
  type: 'file';
  name: string;
  created_at: string;
  modified_at: string;
  size: number;
}

export interface BoxFolder {
  id: string;
  type: 'folder';
  name: string;
  created_at: string;
  modified_at: string;
}
