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
      {/* ... rest of your component remains the same ... */}
    </motion.div>
  );
};

export default RepoDetails;