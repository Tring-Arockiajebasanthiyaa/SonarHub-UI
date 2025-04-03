import { useQuery, useMutation } from "@apollo/client";
import { useParams } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { useEffect, useState } from "react";
import { GET_USER, GET_PROJECT_ANALYSIS, GET_REPO_BRANCHES } from "../Graphql/Queries";
import { motion } from "framer-motion";
import { TRIGGER_AUTOMATIC_ANALYSIS, ANALYZE_SINGLE_REPOSITORY } from "../Graphql/Mutations";
import { Badge, ProgressBar, Spinner, Alert, Card, ListGroup, Dropdown } from "react-bootstrap";

interface CodeMetric {
  u_id: string;
  branch: string;
  language: string;
  linesOfCode: number;
  coverage: number;
  duplicatedLines: number;
  violations: number;
  filesCount: number;
  complexity: number;
  reliabilityRating: number;
  securityRating: number;
  bugs: number;
  vulnerabilities: number;
  codeSmells: number;
  debtRatio: number;
  qualityGateStatus: string;
}

interface SonarIssue {
  u_id: string;
  key: string;
  type: string;
  severity: string;
  message: string;
  rule: string;
  component: string;
  line: number;
  status: string;
  resolution?: string;
  branch: string | null;
}

interface ProjectAnalysis {
  u_id: string;
  title: string;
  repoName: string;
  description: string | null;
  overview: string | null;
  result: string;
  githubUrl: string;
  isPrivate: boolean;
  defaultBranch: string;
  lastAnalysisDate: string;
  username: string;
  analysisStartTime: string;
  analysisEndTime: string;
  analysisDuration: number;
  estimatedLinesOfCode: number;
  languageDistribution: Record<string, number>;
  createdAt: string;
  updatedAt: string;
  user: {
    u_id: string;
    name: string;
    email: string;
    avatar: string | null;
    username: string;
    githubId: string;
  };
}

interface Branch {
  name: string;
  dashboardUrl: string;
}

const RepoDetails = () => {
  const { repoName } = useParams<{ repoName: string }>();
  const { userEmail } = useAuth();
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<string>("");
  const [lastError, setLastError] = useState<string | null>(null);
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: userData } = useQuery(GET_USER, {
    variables: { email: userEmail },
    skip: !userEmail,
  });

  const cleanRepoName = repoName?.trim();

  useEffect(() => {
    if (userData?.getUserByEmail?.username) {
      setGithubUsername(userData.getUserByEmail.username);
    }
  }, [userData]);

  const { data: branchesData, loading: branchesLoading, error: branchesError } = useQuery(GET_REPO_BRANCHES, {
    variables: { githubUsername, repoName: cleanRepoName },
    skip: !githubUsername || !cleanRepoName,
    onCompleted: (data) => {
      if (data?.getRepoBranches?.length) {
        const defaultBranch = data.getRepoBranches.find((b: Branch) => b.name === "main")?.name || 
                             data.getRepoBranches.find((b: Branch) => b.name === "master")?.name || 
                             data.getRepoBranches[0]?.name;
        setSelectedBranch(defaultBranch);
      }
    },
  });

  const { data, loading, error, refetch } = useQuery(GET_PROJECT_ANALYSIS, {
    variables: {
      githubUsername,
      repoName: cleanRepoName,
      branch: selectedBranch
    },
    skip: !githubUsername || !cleanRepoName || !selectedBranch,
    onError: (err) => {
      setLastError(err.message);
    }
  });

  const [triggerAutomaticAnalysis] = useMutation(TRIGGER_AUTOMATIC_ANALYSIS, {
    onCompleted: () => {
      setIsAnalyzingAll(false);
      setAnalysisStatus("Automatic analysis completed for all repositories");
      refetch();
    },
    onError: (err) => {
      setIsAnalyzingAll(false);
      setLastError(err.message);
    },
  });

  const [analyzeSingleRepository] = useMutation(ANALYZE_SINGLE_REPOSITORY, {
    onCompleted: () => {
      setIsAnalyzing(false);
      setAnalysisStatus("Analysis completed");
      refetch();
    },
    onError: (err) => {
      setIsAnalyzing(false);
      setLastError(err.message);
    },
  });

  const handleAnalyzeRepository = () => {
    if (!githubUsername || !repoName) return;
    setIsAnalyzing(true);
    setAnalysisStatus("Analyzing repository...");
    setLastError(null);
    analyzeSingleRepository({ variables: { githubUsername, repoName } });
  };

  const handleReanalyze = () => {
    if (!githubUsername || !repoName) return;
    setAnalysisStatus("Reanalyzing...");
    setLastError(null);
    handleAnalyzeRepository();
  };

  const handleAnalyzeAllRepos = () => {
    if (!githubUsername) return;
    setIsAnalyzingAll(true);
    setAnalysisStatus("Analyzing all repositories...");
    setLastError(null);
    triggerAutomaticAnalysis({ variables: { githubUsername } });
  };

  const handleBranchChange = (branch: string) => {
    setSelectedBranch(branch);
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "BLOCKER":
      case "CRITICAL": return "danger";
      case "MAJOR": return "warning";
      case "MINOR": return "info";
      default: return "secondary";
    }
  };

  const getLanguageColor = (language: string): string => {
    const colors: Record<string, string> = {
      'JavaScript': 'info', 'TypeScript': 'primary', 'Java': 'warning',
      'Python': 'success', 'C++': 'danger', 'C#': 'secondary',
      'Ruby': 'dark', 'PHP': 'info', 'Go': 'primary', 'Swift': 'warning',
      'Kotlin': 'success', 'HTML': 'danger', 'CSS': 'secondary',
      'SCSS': 'dark', 'JSON': 'info', 'XML': 'primary', 'YAML': 'warning',
      'Shell': 'success'
    };
    return colors[language] || 'info';
  };

  if (!repoName) return <div className="container py-4"><Alert variant="danger">Repository name missing</Alert></div>;

  if (branchesLoading) {
    return (
      <div className="container py-4 text-white" style={{ backgroundColor: '#1a1a2e' }}>
        <div className="d-flex align-items-center">
          <Spinner animation="border" variant="primary" className="me-3" />
          <span className="fs-5">Loading branches...</span>
        </div>
      </div>
    );
  }

  if (branchesError) {
    return (
      <div className="container py-4 text-white" style={{ backgroundColor: '#1a1a2e' }}>
        <Alert variant="danger">
          <h5>Error Loading Branches</h5>
          <p>{branchesError.message}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Retry
          </button>
        </Alert>
      </div>
    );
  }

  if (loading || isAnalyzing || isAnalyzingAll) {
    return (
      <div className="container py-4 text-white" style={{ backgroundColor: '#1a1a2e' }}>
        <div className="d-flex align-items-center">
          <Spinner animation="border" variant="primary" className="me-3" />
          <span className="fs-5">{analysisStatus || "Loading..."}</span>
        </div>
      </div>
    );
  }

  if (error || lastError) {
    return (
      <div className="container py-4 text-white" style={{ backgroundColor: '#1a1a2e' }}>
        <Alert variant="danger" className="mb-4">
          <h5>Error</h5>
          {lastError || error?.message}
        </Alert>
        <div className="d-flex gap-3">
          <button onClick={handleReanalyze} className="btn btn-primary" disabled={isAnalyzing}>
            {lastError?.includes("not found") ? "Analyze Now" : "Retry"}
          </button>
          {githubUsername && (
            <button onClick={handleAnalyzeAllRepos} className="btn btn-success" disabled={isAnalyzingAll}>
              Analyze All
            </button>
          )}
        </div>
      </div>
    );
  }

  const project = data?.getProjectAnalysis?.project;
  const metrics = data?.getProjectAnalysis?.codeMetrics || [];
  const issues = data?.getProjectAnalysis?.sonarIssues || [];
  const branchMetrics = metrics.find((m: CodeMetric) => m.branch === selectedBranch);
  const branchIssues = issues.filter((i: SonarIssue) => i.branch === selectedBranch);

  return (
    <motion.div
      className="container py-4 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ backgroundColor: '#1a1a2e' }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">
            {project?.title || repoName}
            {selectedBranch && <Badge bg="light" text="dark" className="ms-2">{selectedBranch}</Badge>}
          </h1>
          {project?.description && <p className="text-light mb-0">{project.description}</p>}
        </div>
        <div className="d-flex gap-2">
          <Dropdown>
            <Dropdown.Toggle variant="dark" id="dropdown-branches">
              {selectedBranch || 'Select Branch'}
            </Dropdown.Toggle>
            <Dropdown.Menu className="bg-dark border-secondary">
              {branchesData?.getRepoBranches?.map((branch: Branch) => (
                <Dropdown.Item
                  key={branch.name}
                  className="text-white"
                  onClick={() => handleBranchChange(branch.name)}
                  active={branch.name === selectedBranch}
                >
                  {branch.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <button onClick={handleReanalyze} className="btn btn-primary" disabled={isAnalyzing}>
            <i className="bi bi-arrow-repeat me-2"></i>Reanalyze
          </button>
          {githubUsername && (
            <button onClick={handleAnalyzeAllRepos} className="btn btn-success" disabled={isAnalyzingAll}>
              <i className="bi bi-collection me-2"></i>Analyze All
            </button>
          )}
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <Card className="h-100 bg-dark border-secondary">
            <Card.Header className="bg-primary text-white">
              <h5>Repository Info</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush" className="bg-transparent">
                <ListGroup.Item className="bg-transparent text-light border-secondary">
                  <strong>Owner:</strong> {project?.user?.name || project?.username || 'Unknown'}
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent text-light border-secondary">
                  <strong>GitHub ID:</strong> {project?.user?.githubId || 'Unknown'}
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent text-light border-secondary">
                  <strong>Email:</strong> {project?.user?.email || 'Unknown'}
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent text-light border-secondary">
                  <strong>URL:</strong>{' '}
                  <a href={project?.githubUrl} target="_blank" rel="noopener noreferrer" className="text-info">
                    {project?.githubUrl}
                  </a>
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent text-light border-secondary">
                  <strong>Default Branch:</strong> {project?.defaultBranch || 'master'}
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent text-light border-secondary">
                  <strong>Visibility:</strong>{' '}
                  <Badge bg={project?.isPrivate ? "secondary" : "success"}>
                    {project?.isPrivate ? "Private" : "Public"}
                  </Badge>
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent text-light border-secondary">
                  <strong>Created:</strong>{' '}
                  {project?.createdAt ? new Date(project.createdAt).toLocaleString() : 'Unknown'}
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent text-light border-secondary">
                  <strong>Last Updated:</strong>{' '}
                  {project?.updatedAt ? new Date(project.updatedAt).toLocaleString() : 'Never'}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </div>

        {branchMetrics && (
          <div className="col-md-4">
            <Card className="h-100 bg-dark border-secondary">
              <Card.Header className="bg-primary text-white">
                <h5>Code Metrics</h5>
              </Card.Header>
              <Card.Body>
                <div className="row g-3">
                  {[
                    { title: "Lines", value: branchMetrics.linesOfCode, format: (v: number) => v?.toLocaleString() },
                    { title: "Files", value: branchMetrics.filesCount, format: (v: number) => v?.toLocaleString() },
                    { 
                      title: "Coverage", 
                      value: branchMetrics.coverage, 
                      format: (v: number) => `${v?.toFixed(2)}%`,
                      progress: true,
                      variant: branchMetrics.coverage > 80 ? 'success' : branchMetrics.coverage > 50 ? 'warning' : 'danger'
                    },
                    { 
                      title: "Duplicates", 
                      value: branchMetrics.duplicatedLines, 
                      format: (v: number) => `${v?.toFixed(2)}%`,
                      progress: true,
                      variant: branchMetrics.duplicatedLines < 5 ? 'success' : branchMetrics.duplicatedLines < 15 ? 'warning' : 'danger'
                    }
                  ].map((metric, index) => (
                    <div key={index} className="col-6">
                      <Card className="h-100 bg-dark border-secondary">
                        <Card.Body className="text-center">
                          <h6 className="text-muted">{metric.title}</h6>
                          {metric.progress ? (
                            <ProgressBar 
                              now={metric.value} 
                              label={metric.format(metric.value)} 
                              variant={metric.variant} 
                              className="mt-2" 
                            />
                          ) : (
                            <h4 className="mt-2">{metric.format(metric.value)}</h4>
                          )}
                        </Card.Body>
                      </Card>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </div>
        )}

        <div className="col-md-4">
          <Card className="h-100 bg-dark border-secondary">
            <Card.Header className="bg-primary text-white">
              <h5>Lines of Code</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2 text-light">
                  <span>Total:</span>
                  <strong>{project?.estimatedLinesOfCode?.toLocaleString() || '0'}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2 text-light">
                  <span>Analysis Duration:</span>
                  <strong>{project?.analysisDuration || 0} seconds</strong>
                </div>
                <div className="d-flex justify-content-between mb-2 text-light">
                  <span>Last Analyzed:</span>
                  <strong>
                    {project?.lastAnalysisDate ? 
                      new Date(project.lastAnalysisDate).toLocaleString() : 
                      'Never'}
                  </strong>
                </div>
              </div>
              
              {project?.languageDistribution && (
                <>
                  <h6 className="mb-3 text-light">Languages</h6>
                  {Object.entries(project.languageDistribution)
                    .sort(([,a], [,b]) => (b as number) - (a as number))
                    .map(([lang, lines]) => {
                      const total = project.estimatedLinesOfCode || 1;
                      const percentage = (lines as number / total) * 100;
                      return (
                        <div key={lang} className="mb-2">
                          <div className="d-flex justify-content-between mb-1 text-light">
                            <span className="fw-bold">{lang}</span>
                            <span>
                              {percentage.toFixed(1)}% ({(lines as number).toLocaleString()})
                            </span>
                          </div>
                          <ProgressBar 
                            now={percentage} 
                            variant={getLanguageColor(lang)} 
                            style={{ height: '10px' }} 
                          />
                        </div>
                      );
                    })}
                </>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      <Card className="mb-4 bg-dark border-secondary">
        <Card.Header className="bg-primary text-white d-flex justify-content-between">
          <h5>Issues ({branchIssues.length})</h5>
          {project?.result === "Analysis failed" && <Badge bg="danger">Failed</Badge>}
        </Card.Header>
        <Card.Body className="p-0">
          {branchIssues.length > 0 ? (
            <div className="list-group list-group-flush">
              {branchIssues.map((issue: SonarIssue) => (
                <div key={issue.u_id} className="list-group-item bg-dark text-light border-secondary">
                  <div className="d-flex justify-content-between">
                    <div>
                      <div className="d-flex align-items-center mb-1">
                        <Badge bg={getSeverityVariant(issue.severity)} className="me-2">
                          {issue.severity}
                        </Badge>
                        <span className="fw-bold">{issue.message}</span>
                      </div>
                      <div className="text-muted small">
                        <span className="me-3">
                          <i className="bi bi-file-earmark-code me-1"></i>
                          {issue.component.split(":").pop()}
                        </span>
                        <span>
                          <i className="bi bi-list-ol me-1"></i>
                          Line {issue.line}
                        </span>
                      </div>
                    </div>
                    <Badge bg="secondary">{issue.rule}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-check-circle-fill text-success fs-1 mb-3"></i>
              <h5 className="text-success">No issues found</h5>
            </div>
          )}
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default RepoDetails;