import { useQuery, useMutation } from "@apollo/client";
import { useParams } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { useEffect, useState } from "react";
import { GET_USER, GET_PROJECT_ANALYSIS, GET_REPO_BRANCHES } from "../Graphql/Queries";
import { motion } from "framer-motion";
import { TRIGGER_AUTOMATIC_ANALYSIS, ANALYZE_SINGLE_REPOSITORY } from "../Graphql/Mutations";
import { Badge, ProgressBar, Spinner, Alert, Card, ListGroup, Dropdown, Tab, Tabs, Table } from "react-bootstrap";
import { FaGithub, FaCode, FaBug, FaShieldAlt, FaExclamationTriangle, FaClock, FaChartLine, FaLanguage, FaCodeBranch } from "react-icons/fa";
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

  const LoadingScreen = ({ message = "Loading repository data..." }: { message?: string }) => {
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
      <motion.div 
        className="container py-5 text-center text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ backgroundColor: '#1a1a2e', minHeight: '80vh' }}
      >
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
        
        <h3 className="mb-4">{currentMessage}</h3>
        
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
          <div 
            className="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
            style={{ width: '100%' }}
          />
        </motion.div>
        
        <div className="text-muted">
          <small>Fetching data from {repoName} repository...</small>
        </div>
      </motion.div>
    );
  };

  if (!repoName) return <div className="container py-4"><Alert variant="danger">Repository name missing</Alert></div>;

  if (branchesLoading || (loading && !data)) {
    return <LoadingScreen />;
  }

  if (branchesError) {
    return (
      <motion.div
        className="container py-4 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ backgroundColor: '#1a1a2e', minHeight: '80vh' }}
      >
        <div className="text-center py-5">
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
      </motion.div>
    );
  }

  if (error || lastError) {
    return (
      <motion.div
        className="container py-4 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ backgroundColor: '#1a1a2e', minHeight: '80vh' }}
      >
        <div className="text-center py-5">
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
      </motion.div>
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
      <div className="container py-4 text-white" style={{ backgroundColor: '#1a1a2e' }}>
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
    <motion.div
      className="container py-4 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ backgroundColor: '#1a1a2e' }}
    >
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
            <motion.p 
              className="text-light mb-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {project.description}
            </motion.p>
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
                  <strong>Title:</strong> {project?.title || 'N/A'}
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent text-light border-secondary">
                  <strong>Description:</strong> {project?.description || 'None'}
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent text-light border-secondary">
                  <strong>URL:</strong>{' '}
                  <a href={project?.githubUrl} target="_blank" rel="noopener noreferrer" className="text-info">
                    {project?.githubUrl || 'N/A'}
                  </a>
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent text-light border-secondary">
                  <strong>Visibility:</strong>{' '}
                  <Badge bg={project?.isPrivate ? "secondary" : "success"}>
                    {project?.isPrivate ? "Private" : "Public"}
                  </Badge>
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent text-light border-secondary">
                  <strong>Owner:</strong> {project?.user?.name || 'N/A'}
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent text-light border-secondary">
                  <strong>Email:</strong> {project?.user?.email || 'N/A'}
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
                  <strong>Current Branch:</strong> {selectedBranch || 'N/A'}
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
                  ) : 'N/A'}
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
                <div className="row g-2">
                  <div className="col-6">
                    <div className="text-center">
                      <h6 className="text-muted">Lines</h6>
                      <h4>{branchMetrics.linesOfCode?.toLocaleString() || '0'}</h4>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center">
                      <h6 className="text-muted">Files</h6>
                      <h4>{branchMetrics.filesCount?.toLocaleString() || '0'}</h4>
                    </div>
                  </div>
                  <div className="col-12 mt-3">
                    <h6 className="text-muted">Coverage</h6>
                    <ProgressBar 
                      now={branchMetrics.coverage || 0} 
                      label={`${branchMetrics.coverage?.toFixed(2) || 0}%`} 
                      variant={
                        branchMetrics.coverage > 80 ? 'success' : 
                        branchMetrics.coverage > 50 ? 'warning' : 'danger'
                      } 
                    />
                  </div>
                  <div className="col-12 mt-3">
                    <h6 className="text-muted">Duplicates</h6>
                    <ProgressBar 
                      now={branchMetrics.duplicatedLines || 0} 
                      label={`${branchMetrics.duplicatedLines?.toFixed(2) || 0}%`} 
                      variant={
                        branchMetrics.duplicatedLines < 5 ? 'success' : 
                        branchMetrics.duplicatedLines < 15 ? 'warning' : 'danger'
                      } 
                    />
                  </div>
                  <div className="col-12 mt-3">
                    <h6 className="text-muted">Complexity</h6>
                    <h4>{branchMetrics.complexity?.toLocaleString() || '0'}</h4>
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
                <div className="d-flex justify-content-between mb-2 text-light">
                  <span>Total:</span>
                  <strong>{project?.estimatedLinesOfCode?.toLocaleString() || '0'}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2 text-light">
                  <span>SonarQube Lines:</span>
                  <strong>{locReport?.sonarQubeLines?.toLocaleString() || '0'}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2 text-light">
                  <span>Last Updated:</span>
                  <strong>{locReport?.lastUpdated ? new Date(locReport.lastUpdated).toLocaleString() : 'N/A'}</strong>
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
                          <div className="d-flex justify-content-between mb-1 text-light">
                            <span>{lang}</span>
                            {/* <span>{lines.toLocaleString()} lines ({percentage.toFixed(1)}%)</span> */}
                          </div>
                          <ProgressBar 
                            now={percentage} 
                            variant={getLanguageColor(lang)} 
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
              <h5 className="mb-0">Quality Gate</h5>
            </Card.Header>
            <Card.Body>
              {branchMetrics ? (
                <div className="text-center">
                  <Badge 
                    bg={branchMetrics.qualityGateStatus === 'OK' ? 'success' : 'danger'} 
                    className="mb-3 fs-5 p-3"
                  >
                    {branchMetrics.qualityGateStatus || 'UNKNOWN'}
                  </Badge>
                  <div className="row mt-3">
                    <div className="col-4">
                      <div className="text-center">
                        <h6 className="text-muted">Bugs</h6>
                        <h4>{branchMetrics.bugs || 0}</h4>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="text-center">
                        <h6 className="text-muted">Vulnerabilities</h6>
                        <h4>{branchMetrics.vulnerabilities || 0}</h4>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="text-center">
                        <h6 className="text-muted">Code Smells</h6>
                        <h4>{branchMetrics.codeSmells || 0}</h4>
                      </div>
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-6">
                      <div className="text-center">
                        <h6 className="text-muted">Reliability Rating</h6>
                        <h4>{branchMetrics.reliabilityRating || 0}/5</h4>
                        <ProgressBar 
                          now={(branchMetrics.reliabilityRating || 0) * 20} 
                          variant={
                            branchMetrics.reliabilityRating <= 2 ? 'success' : 
                            branchMetrics.reliabilityRating <= 3 ? 'warning' : 'danger'
                          }
                        />
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center">
                        <h6 className="text-muted">Security Rating</h6>
                        <h4>{branchMetrics.securityRating || 0}/5</h4>
                        <ProgressBar 
                          now={(branchMetrics.securityRating || 0) * 20} 
                          variant={
                            branchMetrics.securityRating <= 2 ? 'success' : 
                            branchMetrics.securityRating <= 3 ? 'warning' : 'danger'
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h6 className="text-muted">Debt Ratio</h6>
                    <h4>{branchMetrics.debtRatio?.toFixed(2) || 0}%</h4>
                    <ProgressBar 
                      now={branchMetrics.debtRatio || 0} 
                      variant={
                        branchMetrics.debtRatio < 5 ? 'success' : 
                        branchMetrics.debtRatio < 10 ? 'warning' : 'danger'
                      }
                    />
                  </div>
                </div>
              ) : (
                <Alert variant="info">No quality gate data available</Alert>
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
            <div className="list-group list-group-flush">
              {branchIssues.map((issue: SonarIssue) => (
                <div key={issue.u_id} className="list-group-item bg-dark text-light border-secondary">
                  <div className="d-flex justify-content-between align-items-start">
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
                        <span className="ms-3">
                          <i className="bi bi-calendar me-1"></i>
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                        <span className="ms-3">
                          <i className="bi bi-tag me-1"></i>
                          {issue.type}
                        </span>
                        {issue.resolution && (
                          <span className="ms-3">
                            <i className="bi bi-check-circle me-1"></i>
                            {issue.resolution}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge bg="secondary" className="text-uppercase">{issue.rule}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-check-circle-fill text-success fs-1 mb-3"></i>
              <h5 className="text-success">No issues found</h5>
              {project?.result === "Analysis completed" && (
                <p className="text-muted">The code analysis found no issues in this branch</p>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-4 bg-dark border-secondary">
        <Card.Header className="bg-primary text-white d-flex align-items-center">
          <FaChartLine className="me-2" />
          <h5 className="mb-0">All Branches ({branches.length})</h5>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover variant="dark">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Dashboard</th>
                <th>Metrics</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch: Branch) => {
                const metrics = allCodeMetrics.find((m: CodeMetric) => m.branch === branch.name);
                const issues = allSonarIssues.filter((i: SonarIssue) => i.branch === branch.name);
                return (
                  <tr key={branch.name}>
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
                      ) : 'N/A'}
                    </td>
                    <td>
                      {branch.dashboardUrl ? (
                        <a href={branch.dashboardUrl} target="_blank" rel="noopener noreferrer" className="text-info">
                          View Dashboard
                        </a>
                      ) : 'N/A'}
                    </td>
                    <td>
                      {metrics ? (
                        <div className="d-flex flex-wrap gap-2">
                          <Badge bg="secondary">{metrics.linesOfCode} LOC</Badge>
                          <Badge bg={metrics.coverage > 80 ? 'success' : metrics.coverage > 50 ? 'warning' : 'danger'}>
                            {metrics.coverage?.toFixed(2)}% Coverage
                          </Badge>
                          <Badge bg="info">{issues.length} Issues</Badge>
                        </div>
                      ) : 'No metrics'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default RepoDetails;