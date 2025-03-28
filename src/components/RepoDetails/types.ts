
export interface SonarIssue {
  type: string;
  severity: string;
  message: string;
  rule: string;
  component: string;
  line: number;
  effort: string;
  debt: string;
  author?: string;
  status: string;
  resolution?: string;
  hash: string;
  textRange?: string;
  flows?: string;
  project: {
    u_id: string;
    title: string;
    repoName: string;
    result: string;
  };
}

export interface SonarIssuesResponse {
  analyzeRepo: SonarIssue[];
}