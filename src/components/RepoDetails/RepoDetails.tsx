import { useQuery, useMutation } from "@apollo/client";
import { useParams } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { useEffect, useState } from "react";
import { GET_USER, GET_PROJECT_ANALYSIS, GET_REPO_BRANCHES } from "../Graphql/Queries";
import { motion } from "framer-motion";
import { TRIGGER_AUTOMATIC_ANALYSIS, ANALYZE_SINGLE_REPOSITORY, TRIGGER_BRANCH_ANALYSIS } from "../Graphql/Mutations";
import { Badge, ProgressBar, Spinner, Alert, Card, ListGroup, Dropdown, Table, Button } from "react-bootstrap";
import { FaGithub, FaCode, FaBug, FaShieldAlt, FaExclamationTriangle, FaChartLine, FaCodeBranch } from "react-icons/fa";
import { GiSpiderWeb } from "react-icons/gi";
import { RiGitRepositoryLine } from "react-icons/ri";
import { BsGraphUp, BsFileCode } from "react-icons/bs";

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
  branch: string;
  createdAt: string;
  project: {
    u_id: string;
    title: string;
    repoName: string;
  };
}

interface ProjectAnalysis {
  u_id: string;
  title: string;
  repoName: string;
  description: string | null;
  result: string;
  githubUrl: string;
  isPrivate: boolean;
  defaultBranch: string;
  lastAnalysisDate: string;
  analysisDuration: number;
  estimatedLinesOfCode: number;
  languageDistribution: Record<string, number>;
  user: {
    name: string;
    email: string;
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
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
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

  const [triggerBranchAnalysis, { loading: isAnalyzingBranch }] = useMutation(TRIGGER_BRANCH_ANALYSIS, {
    onCompleted: () => {
      setAnalysisStatus(`Analysis completed for branch ${selectedBranch}`);
      refetch();
    },
    onError: (err) => {
      setLastError(err.message);
    },
  });

  const handleTriggerBranchAnalysis = () => {
    if (!githubUsername || !cleanRepoName || !selectedBranch) return;
    setAnalysisStatus(`Analyzing branch ${selectedBranch}...`);
    setLastError(null);
    triggerBranchAnalysis({ 
      variables: { 
        githubUsername, 
        repoName: cleanRepoName, 
        branchName: selectedBranch 
      } 
    });
  };

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

  const handleBranchChange = async (branch: string) => {
    setSelectedBranch(branch);
    try {
      await refetch({ 
        githubUsername, 
        repoName: cleanRepoName, 
        branch 
      });
    } catch (err: any) {
      setLastError(err.message);
    }
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

  const LoadingScreen = ({ 
    message = "Loading repository data...",
    showAnalyzeButton = false
  }: { 
    message?: string;
    showAnalyzeButton?: boolean;
  }) => {
    const loadingMessages = [
      "Analyzing code quality...",
      "Checking for vulnerabilities...",
      "Calculating metrics...",
      "Scanning for code smells...",
      "Generating reports..."
    ];
    const [currentMessage, setCurrentMessage] = useState(message);
    
    useEffect(() => {
      if (message === "Loading repository data...") {
        const interval = setInterval(() => {
          setCurrentMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
        }, 3000);
        return () => clearInterval(interval);
      }
    }, [message]);

    return (
      <div className="container py-5 text-center bg-dark" style={{ minHeight: '80vh' }}>
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <GiSpiderWeb size={80} className="text-primary mb-4" />
        </motion.div>
        <h3 className="mb-4 text-white">{currentMessage}</h3>
        <div className="d-flex justify-content-center mb-4">
          <Spinner animation="grow" variant="primary" className="me-3" />
          <Spinner animation="grow" variant="success" className="me-3" />
          <Spinner animation="grow" variant="info" className="me-3" />
          <Spinner animation="grow" variant="warning" />
        </div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "60%" }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="progress mx-auto mb-4"
          style={{ height: '8px', maxWidth: '400px' }}
        >
          <div className="progress-bar progress-bar-striped progress-bar-animated bg-primary w-100" />
        </motion.div>
        <div className="text-muted">
          <small>Fetching data from {repoName} repository...</small>
        </div>
        {showAnalyzeButton && (
          <Button
            variant="primary"
            onClick={handleTriggerBranchAnalysis}
            disabled={!githubUsername || !repoName || !selectedBranch || isAnalyzingBranch}
            className="mt-4"
          >
            {isAnalyzingBranch ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Analyzing...
              </>
            ) : (
              <>
                <i className="bi bi-graph-up-arrow me-2"></i>
                Analyze Selected Branch
              </>
            )}
          </Button>
        )}
      </div>
    );
  };

  if (!repoName) return <div className="container py-4"><Alert variant="danger">Repository name missing</Alert></div>;

  if (branchesLoading || (loading && !data)) {
    return <LoadingScreen showAnalyzeButton={!!selectedBranch} />;
  }

  if (branchesError) {
    return (
      <div className="container py-4 bg-dark" style={{ minHeight: '80vh' }}>
        <div className="text-center py-5 text-white">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
            }}
          >
            <FaExclamationTriangle size={80} className="text-danger mb-4" />
          </motion.div>
          <h3 className="mb-3">Error Loading Branches</h3>
          <p className="lead mb-4">{branchesError.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary btn-lg"
          >
            <i className="bi bi-arrow-clockwise me-2"></i>Retry
          </button>
        </div>
      </div>
    );
  }

  if (error || lastError) {
    return (
      <div className="container py-4 bg-dark" style={{ minHeight: '80vh' }}>
        <div className="text-center py-5 text-white">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <FaBug size={80} className="text-warning mb-4" />
          </motion.div>
          <h3 className="mb-3">Analysis Error</h3>
          <p className="lead mb-4">{lastError || error?.message}</p>
          <div className="d-flex justify-content-center gap-3">
            <button 
              onClick={handleReanalyze} 
              className="btn btn-primary btn-lg"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Processing...
                </>
              ) : (
                <>
                  <i className="bi bi-arrow-repeat me-2"></i>
                  {lastError?.includes("not found") ? "Analyze Now" : "Retry"}
                </>
              )}
            </button>
            <Button
              variant="info"
              onClick={handleTriggerBranchAnalysis}
              disabled={!githubUsername || !repoName || !selectedBranch || isAnalyzingBranch}
              className="btn-lg"
            >
              {isAnalyzingBranch ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <i className="bi bi-graph-up-arrow me-2"></i>
                  Analyze Selected Branch
                </>
              )}
            </Button>
            {githubUsername && (
              <button 
                onClick={handleAnalyzeAllRepos} 
                className="btn btn-success btn-lg"
                disabled={isAnalyzingAll}
              >
                {isAnalyzingAll ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-collection me-2"></i>
                    Analyze All
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const projectAnalysis = data?.getProjectAnalysis;
  const project = projectAnalysis?.project;
  const branches = projectAnalysis?.branches || [];
  const allCodeMetrics = projectAnalysis?.codeMetrics || [];
  const allSonarIssues = projectAnalysis?.sonarIssues || [];
  const locReport = projectAnalysis?.locReport || {};

  const branchMetrics = allCodeMetrics.find((m: CodeMetric) => m.branch === selectedBranch);
  const branchIssues = allSonarIssues.filter((i: SonarIssue) => i.branch === selectedBranch);
  const currentBranch = branches.find((b: Branch) => b.name === selectedBranch);

  if (!project) {
    return (
      <div className="container py-4 bg-dark text-white">
        <Alert variant="warning">
          <h5>No Analysis Data Found</h5>
          <p>This repository hasn't been analyzed yet.</p>
          <button onClick={handleAnalyzeRepository} className="btn btn-primary" disabled={isAnalyzing}>
            Analyze Now
          </button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-4 bg-dark text-white">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1 d-flex align-items-center">
            <RiGitRepositoryLine className="me-2" />
            {project?.title || repoName}
            {selectedBranch && (
              <Badge bg="light" text="dark" className="ms-2">
                <FaCodeBranch className="me-1" />
                {selectedBranch}
              </Badge>
            )}
          </h1>
          {project?.description && (
            <p className="text-light mb-0">
              {project.description}
            </p>
          )}
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
          <Button
            variant="primary"
            onClick={handleTriggerBranchAnalysis}
            disabled={!githubUsername || !repoName || !selectedBranch || isAnalyzingBranch}
          >
            {isAnalyzingBranch ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Analyzing...
              </>
            ) : (
              <>
                <i className="bi bi-graph-up-arrow me-2"></i>
                Analyze Branch
              </>
            )}
          </Button>
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
            <Card.Header className="bg-primary text-white d-flex align-items-center">
              <FaGithub className="me-2" />
              <h5 className="mb-0">Repository Info</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush" className="bg-transparent">
                <ListGroup.Item className="bg-transparent text-light border-secondary">
                  <strong>Title:</strong> {project?.title || '-'}
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent text-light border-secondary">
                  <strong>Description:</strong> {project?.description || 'None'}
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent text-light border-secondary">
                  <strong>URL:</strong>{' '}
                  <a href={project?.githubUrl} target="_blank" rel="noopener noreferrer" className="text-info">
                    {project?.githubUrl || '-'}
                  </a>
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent text-light border-secondary">
                  <strong>Visibility:</strong>{' '}
                  <Badge bg={project?.isPrivate ? "secondary" : "success"}>
                    {project?.isPrivate ? "Private" : "Public"}
                  </Badge>
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent text-light border-secondary">
                  <strong>Owner:</strong> {project?.user?.name || '-'}
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent text-light border-secondary">
                  <strong>Email:</strong> {project?.user?.email || '-'}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-4">
          <Card className="h-100 bg-dark border-secondary">
            <Card.Header className="bg-primary text-white d-flex align-items-center">
              <FaCodeBranch className="me-2" />
              <h5 className="mb-0">Branch Details</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush" className="bg-transparent">
                <ListGroup.Item className="bg-transparent text-light border-secondary">
                  <strong>Current Branch:</strong> {selectedBranch || '-'}
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent text-light border-secondary">
                  <strong>Default Branch:</strong> {project?.defaultBranch || 'master'}
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent text-light border-secondary">
                  <strong>Dashboard:</strong>{' '}
                  {currentBranch?.dashboardUrl ? (
                    <a href={currentBranch.dashboardUrl} target="_blank" rel="noopener noreferrer" className="text-info">
                      View Dashboard
                    </a>
                  ) : '-'}
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent text-light border-secondary">
                  <strong>Last Analyzed:</strong>{' '}
                  {project?.lastAnalysisDate ? 
                    new Date(project.lastAnalysisDate).toLocaleString() : 
                    'Never'}
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent text-light border-secondary">
                  <strong>Analysis Duration:</strong> {project?.analysisDuration || 0} seconds
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent text-light border-secondary">
                  <strong>Result:</strong>{' '}
                  <Badge bg={project?.result === "Analysis completed" ? "success" : "danger"}>
                    {project?.result || "Not analyzed"}
                  </Badge>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-4">
          <Card className="h-100 bg-dark border-secondary">
            <Card.Header className="bg-primary text-white d-flex align-items-center">
              <BsGraphUp className="me-2" />
              <h5 className="mb-0">Code Metrics</h5>
            </Card.Header>
            <Card.Body>
              {branchMetrics ? (
                <div className="metrics-grid">
                  <div className="metric-item bg-dark-800 p-3 rounded">
                    <div className="metric-header d-flex justify-content-between align-items-center mb-2">
                      <span className="metric-name text-light fw-bold">Lines of Code</span>
                      <FaCode className="text-info" />
                    </div>
                    <h3 className="metric-value text-white">{branchMetrics.linesOfCode?.toLocaleString() || '0'}</h3>
                  </div>

                  <div className="metric-item bg-dark-800 p-3 rounded">
                    <div className="metric-header d-flex justify-content-between align-items-center mb-2">
                      <span className="metric-name text-light fw-bold">Files</span>
                      <BsFileCode className="text-primary" />
                    </div>
                    <h3 className="metric-value text-white">{branchMetrics.filesCount?.toLocaleString() || '0'}</h3>
                  </div>

                  <div className="metric-item bg-dark-800 p-3 rounded">
                    <div className="metric-header d-flex justify-content-between align-items-center mb-2">
                      <span className="metric-name text-light fw-bold">Coverage</span>
                      <FaShieldAlt className="text-success" />
                    </div>
                    <h3 className="metric-value text-white mb-2">{branchMetrics.coverage?.toFixed(2) || 0}%</h3>
                    <ProgressBar 
                      now={branchMetrics.coverage || 0} 
                      variant={
                        branchMetrics.coverage > 80 ? 'success' : 
                        branchMetrics.coverage > 50 ? 'warning' : 'danger'
                      }
                      className="progress-bar-striped"
                    />
                  </div>

                  <div className="metric-item bg-dark-800 p-3 rounded">
                    <div className="metric-header d-flex justify-content-between align-items-center mb-2">
                      <span className="metric-name text-light fw-bold">Duplicates</span>
                      <FaExclamationTriangle className="text-warning" />
                    </div>
                    <h3 className="metric-value text-white mb-2">{branchMetrics.duplicatedLines?.toFixed(2) || 0}%</h3>
                    <ProgressBar 
                      now={branchMetrics.duplicatedLines || 0} 
                      variant={
                        branchMetrics.duplicatedLines < 5 ? 'success' : 
                        branchMetrics.duplicatedLines < 15 ? 'warning' : 'danger'
                      }
                      className="progress-bar-striped"
                    />
                  </div>

                  <div className="metric-item bg-dark-800 p-3 rounded">
                    <div className="metric-header d-flex justify-content-between align-items-center mb-2">
                      <span className="metric-name text-light fw-bold">Complexity</span>
                      <GiSpiderWeb className="text-danger" />
                    </div>
                    <h3 className="metric-value text-white">{branchMetrics.complexity?.toLocaleString() || '0'}</h3>
                  </div>

                  <div className="metric-item bg-dark-800 p-3 rounded">
                    <div className="metric-header d-flex justify-content-between align-items-center mb-2">
                      <span className="metric-name text-light fw-bold">Violations</span>
                      <FaBug className="text-danger" />
                    </div>
                    <h3 className="metric-value text-white">{branchMetrics.violations?.toLocaleString() || '0'}</h3>
                  </div>
                </div>
              ) : (
                <Alert variant="info">No metrics available for this branch</Alert>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <Card className="h-100 bg-dark border-secondary">
            <Card.Header className="bg-primary text-white d-flex align-items-center">
              <BsFileCode className="me-2" />
              <h5 className="mb-0">Lines of Code</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-light">Total:</span>
                  <strong className="text-white">{project?.estimatedLinesOfCode?.toLocaleString() || '0'}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-light">SonarQube Lines:</span>
                  <strong className="text-white">{locReport?.sonarQubeLines?.toLocaleString() || '0'}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-light">Last Updated:</span>
                  <strong className="text-white">{locReport?.lastUpdated ? new Date(locReport.lastUpdated).toLocaleString() : '-'}</strong>
                </div>
              </div>
              
              {project?.languageDistribution && Object.keys(project.languageDistribution).length > 0 ? (
                <>
                  <h6 className="mb-3 text-light">Languages</h6>
                  {Object.entries(project.languageDistribution)
                    .sort(([,a], [,b]) => (b as number) - (a as number))
                    .map(([lang, lines]) => {
                      const total = project.estimatedLinesOfCode || 1;
                      const percentage = (lines as number / total) * 100;
                      return (
                        <div key={lang} className="mb-2">
                          <div className="d-flex justify-content-between mb-1">
                            <span className="text-light">{lang}</span>
                            <span className="text-white">{lines as number} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <ProgressBar 
                            now={percentage} 
                            variant={getLanguageColor(lang)} 
                            className="progress-bar-striped"
                            style={{ height: '8px' }} 
                          />
                        </div>
                      );
                    })}
                </>
              ) : (
                <Alert variant="info">No language distribution data</Alert>
              )}
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-6">
          <Card className="h-100 bg-dark border-secondary">
            <Card.Header className="bg-primary text-white d-flex align-items-center">
              <FaShieldAlt className="me-2" />
              <h5 className="mb-0">Quality Gate Status</h5>
            </Card.Header>
            <Card.Body>
              {branchMetrics ? (
                <div>
                  <div className="text-center mb-4">
                    <h4 className="text-light mb-3">Overall Quality</h4>
                    <Badge bg={branchMetrics.qualityGateStatus === 'OK' ? 'success' : 'danger'} className="fs-4 p-3">
                      {branchMetrics.qualityGateStatus || 'UNKNOWN'}
                    </Badge>
                  </div>
                  <h5 className="text-light mb-3 border-bottom pb-2">Issue Summary</h5>
                  <div className="row mb-4">
                    <div className="col-4">
                      <div className="text-center p-3 bg-dark-800 rounded">
                        <h6 className="text-info">Bugs</h6>
                        <h3 className="text-white">{branchMetrics.bugs || 0}</h3>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="text-center p-3 bg-dark-800 rounded">
                        <h6 className="text-danger">Vulnerabilities</h6>
                        <h3 className="text-white">{branchMetrics.vulnerabilities || 0}</h3>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="text-center p-3 bg-dark-800 rounded">
                        <h6 className="text-warning">Code Smells</h6>
                        <h3 className="text-white">{branchMetrics.codeSmells || 0}</h3>
                      </div>
                    </div>
                  </div>
                  <h5 className="text-light mb-3 border-bottom pb-2">Ratings</h5>
                  <div className="row mb-4">
                    <div className="col-6">
                      <div className="p-3 bg-dark-800 rounded h-100">
                        <h6 className="text-info">Reliability Rating</h6>
                        <div className="d-flex align-items-center mb-2">
                          <h3 className="text-white me-3 mb-0">{branchMetrics.reliabilityRating || 0}/5</h3>
                          <Badge bg={branchMetrics.reliabilityRating <= 2 ? 'success' : 
                                     branchMetrics.reliabilityRating <= 3 ? 'warning' : 'danger'}>
                            {branchMetrics.reliabilityRating <= 2 ? 'Good' : 
                             branchMetrics.reliabilityRating <= 3 ? 'Fair' : 'Poor'}
                          </Badge>
                        </div>
                        <ProgressBar 
                          now={(branchMetrics.reliabilityRating || 0) * 20} 
                          variant={
                            branchMetrics.reliabilityRating <= 2 ? 'success' : 
                            branchMetrics.reliabilityRating <= 3 ? 'warning' : 'danger'
                          }
                          className="progress-bar-striped"
                        />
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3 bg-dark-800 rounded h-100">
                        <h6 className="text-info">Security Rating</h6>
                        <div className="d-flex align-items-center mb-2">
                          <h3 className="text-white me-3 mb-0">{branchMetrics.securityRating || 0}/5</h3>
                          <Badge bg={
                            branchMetrics.securityRating <= 2 ? 'success' : 
                            branchMetrics.securityRating <= 3 ? 'warning' : 'danger'
                          }>
                            {branchMetrics.securityRating <= 2 ? 'Good' : 
                             branchMetrics.securityRating <= 3 ? 'Fair' : 'Poor'}
                          </Badge>
                        </div>
                        <ProgressBar 
                          now={(branchMetrics.securityRating || 0) * 20} 
                          variant={
                            branchMetrics.securityRating <= 2 ? 'success' : 
                            branchMetrics.securityRating <= 3 ? 'warning' : 'danger'
                          }
                          className="progress-bar-striped"
                        />
                      </div>
                    </div>
                  </div>
                  <h5 className="text-light mb-3 border-bottom pb-2">Technical Debt</h5>
                  <div className="p-3 bg-dark-800 rounded">
                    <h6 className="text-warning">Debt Ratio</h6>
                    <div className="d-flex align-items-center mb-2">
                      <h3 className="text-white me-3 mb-0">{branchMetrics.debtRatio?.toFixed(2) || 0}%</h3>
                      <Badge bg={
                        branchMetrics.debtRatio < 5 ? 'success' : 
                        branchMetrics.debtRatio < 10 ? 'warning' : 'danger'
                      }>
                        {branchMetrics.debtRatio < 5 ? 'Low' : 
                         branchMetrics.debtRatio < 10 ? 'Medium' : 'High'}
                      </Badge>
                    </div>
                    <ProgressBar 
                      now={branchMetrics.debtRatio || 0} 
                      variant={
                        branchMetrics.debtRatio < 5 ? 'success' : 
                        branchMetrics.debtRatio < 10 ? 'warning' : 'danger'
                      }
                      className="progress-bar-striped"
                    />
                    <small className="text-muted mt-2 d-block">
                      {branchMetrics.debtRatio < 5 ? 'Minimal technical debt' : 
                       branchMetrics.debtRatio < 10 ? 'Moderate technical debt' : 'High technical debt'}
                    </small>
                  </div>
                </div>
              ) : (
                <Alert variant="info" className="text-center">
                  <h5>No Quality Gate Data Available</h5>
                  <p className="mb-0">Run an analysis to see quality metrics</p>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      <Card className="mb-4 bg-dark border-secondary">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0 d-flex align-items-center">
            <FaExclamationTriangle className="me-2" />
            Issues ({branchIssues.length})
          </h5>
          {project?.result === "Analysis failed" && <Badge bg="danger">Analysis Failed</Badge>}
        </Card.Header>
        <Card.Body className="p-0">
          {branchIssues.length > 0 ? (
            <Table striped bordered hover variant="dark" className="mb-0">
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Message</th>
                  <th>Location</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {branchIssues.map((issue: SonarIssue) => (
                  <tr key={issue.u_id}>
                    <td>
                      <Badge bg={getSeverityVariant(issue.severity)}>
                        {issue.severity}
                      </Badge>
                    </td>
                    <td>
                      <div className="fw-bold">{issue.message}</div>
                      <small className="text-muted">{issue.rule}</small>
                    </td>
                    <td>
                      {issue.component.split(":").pop()}:{issue.line}
                    </td>
                    <td>
                      <Badge bg="secondary" className="text-uppercase">{issue.type}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-check-circle-fill text-success fs-1 mb-3"></i>
              <h5 className="text-success">No issues found</h5>
              {project?.result === "Analysis completed" && (
                <div className="mt-4">
                  <Button 
                    variant="primary"
                    onClick={handleTriggerBranchAnalysis}
                    disabled={isAnalyzingBranch}
                  >
                    {isAnalyzingBranch ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-graph-up-arrow me-2"></i>
                        Run Analysis Again
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
      <Card className="mb-4 bg-dark border-secondary">
      <Card.Header className="bg-primary text-white d-flex align-items-center">
        <FaChartLine className="me-2" />
        <h5 className="mb-0">
        All Branches (
      {branches.filter((branch: Branch, index: number, self: Branch[]) => 
        index === self.findIndex((b: Branch) => b.name === branch.name)
      ).length})
     </h5>
     </Card.Header>
      <Card.Body>
      <Table striped bordered hover variant="dark">
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
          <th>Dashboard</th>
          <th>Metrics</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
      {branches
          .filter((branch: Branch, index: number, self: Branch[]) => 
            index === self.findIndex((b: Branch) => b.name === branch.name)
          )
          .map((branch: Branch) => {
            const metrics = allCodeMetrics.find((m: CodeMetric) => m.branch === branch.name);
            const issues = allSonarIssues.filter((i: SonarIssue) => i.branch === branch.name);
            
            return (
              <tr key={`${branch.name}-${branch.dashboardUrl}`}>
                <td>
                  {branch.name}
                  {branch.name === selectedBranch && (
                    <Badge bg="info" className="ms-2">Current</Badge>
                  )}
                  {branch.name === project?.defaultBranch && (
                    <Badge bg="primary" className="ms-2">Default</Badge>
                  )}
                </td>
                <td>
                  {metrics ? (
                    <Badge bg={metrics.qualityGateStatus === 'OK' ? 'success' : 'danger'}>
                      {metrics.qualityGateStatus || 'UNKNOWN'}
                    </Badge>
                  ) : '-'}
                </td>
                <td>
                  {branch.dashboardUrl ? (
                    <a 
                      href={branch.dashboardUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-info"
                    >
                      View Dashboard
                    </a>
                  ) : '-'}
                </td>
                <td>
                  {metrics ? (
                    <div className="d-flex flex-wrap gap-2">
                      <Badge bg="secondary">{metrics.linesOfCode} LOC</Badge>
                      <Badge bg={
                        metrics.coverage > 80 ? 'success' : 
                        metrics.coverage > 50 ? 'warning' : 'danger'
                      }>
                        {metrics.coverage?.toFixed(2)}% Coverage
                      </Badge>
                      <Badge bg="info">{issues.length} Issues</Badge>
                    </div>
                  ) : 'No metrics'}
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant={branch.name === selectedBranch ? 'primary' : 'outline-primary'}
                      size="sm"
                      onClick={() => handleBranchChange(branch.name)}
                      disabled={branch.name === selectedBranch}
                    >
                      <i className="bi bi-eye me-1"></i>
                      View
                    </Button>
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => {
                        setSelectedBranch(branch.name);
                        handleTriggerBranchAnalysis();
                      }}
                      disabled={isAnalyzingBranch && branch.name === selectedBranch}
                    >
                      {isAnalyzingBranch && branch.name === selectedBranch ? (
                        <Spinner as="span" animation="border" size="sm" className="me-1" />
                      ) : (
                        <i className="bi bi-graph-up-arrow me-1"></i>
                      )}
                      Analyze
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
      </tbody>
    </Table>
  </Card.Body>
        </Card>
      <div className="d-flex justify-content-between mb-4">
        <div>
          {analysisStatus && (
            <Alert variant="info" className="mb-0">
              <i className="bi bi-info-circle me-2"></i>
              {analysisStatus}
            </Alert>
          )}
          {lastError && (
            <Alert variant="danger" className="mb-0">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {lastError}
            </Alert>
          )}
        </div>
        <div className="d-flex gap-3">
          <Button
            variant="outline-secondary"
            onClick={() => refetch()}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh All Data
          </Button>
          <Button
            variant="danger"
            onClick={handleAnalyzeAllRepos}
            disabled={isAnalyzingAll}
          >
            {isAnalyzingAll ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Analyzing All...
              </>
            ) : (
              <>
                <i className="bi bi-collection me-2"></i>
                Analyze All Branches
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RepoDetails;
