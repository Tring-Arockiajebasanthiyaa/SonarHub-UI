import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { useEffect, useState } from "react";
import { GET_USER, ANALYZE_REPO } from "../Graphql/Queries";
import { SonarIssuesResponse, SonarIssue } from "./types";
import { motion } from "framer-motion";

const RepoDetails = () => {
  const { repoName } = useParams<{ repoName: string }>();
  const { userEmail } = useAuth();
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [branchName, setBranchName] = useState<string>("main");
  const [analysisStatus, setAnalysisStatus] = useState<string>("");
  const [lastError, setLastError] = useState<string | null>(null);

  const { data: userData } = useQuery(GET_USER, {
    variables: { email: userEmail },
    skip: !userEmail,
  });

  const { data, loading, error, refetch } = useQuery<SonarIssuesResponse>(
    ANALYZE_REPO,
    {
      variables: {
        githubUsername: githubUsername || "",
        repoName: repoName || "",
        branchName: branchName,
      },
      skip: !repoName || !githubUsername,
      onCompleted: () => {
        setAnalysisStatus("Analysis complete");
        setLastError(null);
      },
      onError: (err) => {
        setAnalysisStatus("Analysis failed");
        setLastError(err.message);
      },
    }
  );

  useEffect(() => {
    if (userData?.getUserByEmail?.username) {
      setGithubUsername(userData.getUserByEmail.username);
    }
  }, [userData]);

  const handleReanalyze = () => {
    setAnalysisStatus("Analyzing...");
    setLastError(null);
    refetch();
  };

  if (loading)
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse"></div>
          <span>{analysisStatus || "Loading analysis..."}</span>
        </div>
      </div>
    );

  if (error || lastError)
    return (
      <div className="p-6">
        <div className="text-red-500 mb-4">
          Error: {lastError || error?.message}
          {error?.message.includes("report parameter is missing") && (
            <div className="mt-2 text-sm text-gray-600">
              Tip: The analysis requires a 'report' parameter that wasn't provided.
            </div>
          )}
        </div>
        <button
          onClick={handleReanalyze}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry Analysis
        </button>
      </div>
    );

  const issues: SonarIssue[] = data?.analyzeRepo || [];
  const projectResult = issues[0]?.project?.result || "No analysis results";

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
        <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          SonarQube Analysis for {repoName}
          {branchName && ` (${branchName})`}
        </h1>
        <div className="flex space-x-4">
          <select
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="main">main</option>
            <option value="develop">develop</option>
            <option value="master">master</option>
          </select>
          <button
            onClick={handleReanalyze}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reanalyze
          </button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Analysis Summary</h2>
        <p>
          Status:{" "}
          <span
            className={`font-medium ${
              projectResult.includes("failed")
                ? "text-red-500"
                : projectResult.includes("success")
                ? "text-green-500"
                : "text-blue-500"
            }`}
          >
            {projectResult}
          </span>
        </p>
        <p>Total Issues Found: {issues.length}</p>
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
          {issues.map((issue: SonarIssue, index: number) => (
            <motion.div
              key={`${issue.hash}-${index}`}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              whileHover={{ scale: 1.01 }}
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 },
              }}
            >
              <h3 className="text-md font-semibold">Issue {index + 1}</h3>
              <p><strong>Severity:</strong> {issue.severity}</p>
              <p><strong>Message:</strong> {issue.message}</p>
              {/* <p><strong>File:</strong> {issue.filePath} (Line {issue.line})</p> */}
              <p><strong>Rule:</strong> {issue.rule}</p>
              <p><strong>Status:</strong> {issue.status}</p>
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