import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { GET_USER, GET_SONAR_ISSUES } from "../graphql/queries";
import { SonarIssuesResponse } from "../RepoDetails/types";
import { motion } from "framer-motion";

const RepoDetails = () => {
  const { repoName } = useParams<{ repoName: string }>();
  const { userEmail } = useAuth();
  const [githubUsername, setGithubUsername] = useState<string | null>(null);

  const { data: userData } = useQuery(GET_USER, {
    variables: { email: userEmail },
    skip: !userEmail,
  });

  useEffect(() => {
    if (userData?.getUserByEmail?.username) {
      setGithubUsername(userData.getUserByEmail.username);
    }
  }, [userData]);

  const { data, loading, error } = useQuery<SonarIssuesResponse>(
    GET_SONAR_ISSUES,
    {
      variables: {
        githubUsername: githubUsername || "arockiyajebasanthiya",
        repoName: repoName || "",
      },
      skip: !repoName,
    }
  );

  if (loading)
    return <div className="p-6">Loading issues...</div>;
  if (error)
    return <div className="p-6 text-red-500">Error: {error.message}</div>;

  const issues = data?.getSonarIssues || [];

  return (
    <motion.div 
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-2xl font-bold mb-6 text-center">SonarQube Analysis for {repoName}</h1>

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
              transition: { staggerChildren: 0.2 },
            },
          }}
        >
          {issues.map((issue, index) => (
            <motion.div
              key={index}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              whileHover={{ scale: 1.02 }}
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 },
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-3 h-3 mt-1 rounded-full flex-shrink-0 ${
                    issue.severity === "BLOCKER"
                      ? "bg-red-500"
                      : issue.severity === "CRITICAL"
                      ? "bg-orange-500"
                      : issue.severity === "MAJOR"
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                  }`}
                ></div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-gray-800">{issue.message}</p>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                      {issue.severity}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600">
                    <div>
                      <span className="font-semibold">Type:</span> {issue.type}
                    </div>
                    <div>
                      <span className="font-semibold">Rule:</span> {issue.rule}
                    </div>
                    <div>
                      <span className="font-semibold">Location:</span>{" "}
                      {issue.component}
                      {issue.line && `:${issue.line}`}
                    </div>
                    {issue.effort && (
                      <div>
                        <span className="font-semibold">Effort:</span>{" "}
                        {issue.effort}
                      </div>
                    )}
                    {issue.author && (
                      <div>
                        <span className="font-semibold">Author:</span>{" "}
                        {issue.author}
                      </div>
                    )}
                    {issue.status && (
                      <div>
                        <span className="font-semibold">Status:</span>{" "}
                        {issue.status}
                      </div>
                    )}
                  </div>

                  {issue.textRange && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      <span className="font-semibold">Code Context:</span>
                      <pre className="mt-1 overflow-x-auto">{issue.textRange}</pre>
                    </div>
                  )}
                </div>
              </div>
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
