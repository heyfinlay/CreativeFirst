export type PlatformEntry = {
  platform: string;
  handle: string;
  followers: number | null;
  verified?: boolean;
};

export type PortfolioItem = {
  platform: string;
  title: string;
  thumb_url: string;
  link_url: string;
};

export type CreatorStats = {
  avg_views?: number | null;
  engagement?: number | null;
  turnaround?: number | null;
  ugc_delivered?: number | null;
};

export type CreatorPrerequisites = {
  min_budget_aud?: number | null;
  paid_only?: boolean;
  excluded_categories?: string[];
};

export type CreatorAudience = {
  age_range?: string;
  gender?: string;
  regions?: string[];
  note?: string;
};

export type CreatorPublicProfileInput = {
  handle: string;
  display_name: string;
  headline: string;
  bio: string;
  avatar_url: string;
  tags: string[];
  stats: CreatorStats;
  platforms: PlatformEntry[];
  prerequisites: CreatorPrerequisites;
  content_style: string[];
  audience: CreatorAudience;
  portfolio: PortfolioItem[];
  is_pro: boolean;
};
