export interface typeSonarIssue {
    type: string;
    severity: string;
    message: string;
    rule: string;
    component: string;
    line?: number;
    effort?: string;
    debt?: string;
    author?: string;
    status?: string;
    resolution?: string;
    hash?: string;
    textRange?: string;
    flows?: string;
    createdAt: string;
    project: {
      title: string;
      description: string;
    };
  }
  
  export interface SonarIssuesResponse {
    getSonarIssues: typeSonarIssue[];
  }