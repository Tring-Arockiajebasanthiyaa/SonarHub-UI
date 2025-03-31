import { useQuery, useMutation } from "@apollo/client";
import { useParams } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { useEffect, useState } from "react";
import { GET_USER, GET_PROJECT_ANALYSIS } from "../Graphql/Queries";
import { motion } from "framer-motion";
import { TRIGGER_AUTOMATIC_ANALYSIS, ANALYZE_SINGLE_REPOSITORY } from "../Graphql/Mutations";

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

  const { data, loading, error, refetch } = useQuery(GET_PROJECT_ANALYSIS, {
    variables: { 
      githubUsername: githubUsername || '', 
      repoName: repoName || '' 
    },
    skip: !githubUsername || !repoName,
    onCompleted: (data) => {
      if (data?.getProjectAnalysis?.defaultBranch && !selectedBranch) {
        setSelectedBranch(data.getProjectAnalysis.defaultBranch);
      }
    },
    onError: (err) => {
      setLastError(err.message);
      if (err.message.includes("not found")) {
        handleAnalyzeRepository();
      }
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
      setAnalysisStatus("Automatic analysis failed");
      setLastError(err.message);
    },
  });

  const [analyzeSingleRepository] = useMutation(ANALYZE_SINGLE_REPOSITORY, {
    onCompleted: (data) => {
      setIsAnalyzing(false);
      if (data.analyzeSingleRepository.success) {
        setAnalysisStatus("Analysis completed successfully");
        refetch();
      } else {
        setAnalysisStatus("Analysis completed with errors");
        setLastError(data.analyzeSingleRepository.message);
      }
    },
    onError: (err) => {
      setIsAnalyzing(false);
      setAnalysisStatus("Analysis failed");
      setLastError(err.message);
    },
  });

  useEffect(() => {
    if (userData?.getUserByEmail?.username) {
      setGithubUsername(userData.getUserByEmail.username);
    }
  }, [userData]);

  const handleAnalyzeRepository = () => {
    if (!githubUsername || !repoName) return;
    
    setIsAnalyzing(true);
    setAnalysisStatus("Analyzing repository...");
    setLastError(null);
    
    analyzeSingleRepository({
      variables: { 
        githubUsername,
        repoName
      }
    });
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
    
    triggerAutomaticAnalysis({
      variables: { githubUsername }
    });
  };

  useEffect(() => {
    if (data?.getProjectAnalysis) {
      console.log("Project Data:", data.getProjectAnalysis);
    }
  }, [data]);

  if (loading || isAnalyzing || isAnalyzingAll) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse"></div>
          <span>{analysisStatus || "Loading analysis..."}</span>
        </div>
      </div>
    );
  }

  if (error || lastError) {
    return (
      <div className="p-6">
        <div className="text-red-500 mb-4">
          Error: {lastError || error?.message}
        </div>
        <div className="mb-4">
          {lastError?.includes("not found") && (
            <p className="text-gray-600">
              This repository hasn't been analyzed yet. Click below to analyze it.
            </p>
          )}
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleReanalyze}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {lastError?.includes("not found") ? "Analyze Now" : "Retry Analysis"}
          </button>
          {githubUsername && (
            <button
              onClick={handleAnalyzeAllRepos}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Analyze All Repositories
            </button>
          )}
        </div>
      </div>
    );
  }

  const project = data?.getProjectAnalysis;
  const issues = project?.sonarIssues || [];
  const metrics = project?.codeMetrics || [];
  const branchMetrics = metrics.find((m: any) => m.branch === selectedBranch);

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {project?.title || repoName}
          {selectedBranch && ` (${selectedBranch})`}
        </h1>
        <div className="flex space-x-4">
          {project?.defaultBranch && (
            <select
              value={selectedBranch || project.defaultBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              {metrics.map((metric: any) => (
                <option key={metric.branch} value={metric.branch}>
                  {metric.branch}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={handleReanalyze}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reanalyze
          </button>
          {githubUsername && (
            <button
              onClick={handleAnalyzeAllRepos}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Analyze All Repos
            </button>
          )}
        </div>
      </div>

      {project && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-100 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Repository Info</h2>
            <p>
              <strong>URL:</strong>{" "}
              {project.githubUrl && !project.githubUrl.includes('default') ? (
                <a 
                  href={project.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline"
                >
                  {project.githubUrl}
                </a>
              ) : (
                <span className="text-red-500">
                  URL not available - <button 
                    onClick={handleAnalyzeRepository}
                    className="text-blue-500 hover:underline"
                  >
                    try reanalyzing
                  </button>
                </span>
              )}
            </p>
            <p><strong>Visibility:</strong> {project.isPrivate ? "Private" : "Public"}</p>
            <p><strong>Last Analyzed:</strong> {new Date(project.lastAnalysisDate).toLocaleString()}</p>
          </div>

          {branchMetrics && (
            <div className="p-4 bg-gray-100 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Code Metrics</h2>
              <p><strong>Lines of Code:</strong> {branchMetrics.linesOfCode?.toLocaleString()}</p>
              <p><strong>Files:</strong> {branchMetrics.filesCount?.toLocaleString()}</p>
              <p><strong>Coverage:</strong> {branchMetrics.coverage?.toFixed(2)}%</p>
              <p><strong>Duplicated Lines:</strong> {branchMetrics.duplicatedLines?.toFixed(2)}%</p>
              <p><strong>Violations:</strong> {branchMetrics.violations?.toLocaleString()}</p>
              <p><strong>Complexity:</strong> {branchMetrics.complexity?.toLocaleString()}</p>
            </div>
          )}
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Issues ({issues.length})</h2>
        <p className="text-sm text-gray-600">
          Showing issues for {selectedBranch || 'default branch'}
        </p>
      </div>

      {issues.length > 0 ? (
        <motion.div
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          {issues.map((issue: any) => (
            <motion.div
              key={issue.u_id}
              className={`p-4 rounded-lg shadow hover:shadow-md transition-shadow ${
                issue.severity === "BLOCKER" || issue.severity === "CRITICAL"
                  ? "bg-red-50 border-l-4 border-red-500"
                  : issue.severity === "MAJOR"
                  ? "bg-orange-50 border-l-4 border-orange-500"
                  : "bg-white border-l-4 border-blue-500"
              }`}
              whileHover={{ scale: 1.01 }}
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 },
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-md font-semibold">{issue.message}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className={`font-medium ${
                      issue.severity === "BLOCKER" || issue.severity === "CRITICAL"
                        ? "text-red-600"
                        : issue.severity === "MAJOR"
                        ? "text-orange-600"
                        : "text-blue-600"
                    }`}>
                      {issue.severity}
                    </span> • {issue.type} • Line {issue.line}
                  </p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">
                  {issue.rule}
                </span>
              </div>
              {issue.component && (
                <p className="mt-2 text-sm text-gray-700">
                  <strong>File:</strong> {issue.component.split(":").pop()}
                </p>
              )}
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="p-8 text-center bg-green-50 rounded-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="text-green-600 font-medium text-lg">
            🎉 No issues found. Great job! 🎉
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RepoDetails;