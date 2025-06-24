export interface Addon {
  id: string; // repo full_name
  name: string;
  authors: string[];
  summary: string;
  icon: string | null;
  links: {
    github: string;
    download?: string;
    discord?: string;
    homepage?: string;
  };
  features: string[];
  feature_count: number;
  stars: number;
  downloads: number;
  last_update: string; // ISO date string
  mc_version: string | null;
  status: {
    archived: boolean;
  };
  verified: boolean;
  // from inject.json
  [key: string]: any;
}

export interface ControlPanelData {
  addons: Addon[];
  verifiedRepoIds: string[];
  totalAddons: number;
  lastRefreshed: string | null;
}
