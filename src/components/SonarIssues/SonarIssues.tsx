import React, { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_USER_ACTIVITY } from "../Graphql/Queries";

const SonarIssues = ({ githubUsername }: { githubUsername: string }) => {
  const { data, loading, error } = useQuery(GET_USER_ACTIVITY, { variables: { githubUsername } });

  useEffect(() => {
    console.log("SonarIssues Data:", data); // Debugging Step 1
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="container mt-4">
      <h2 className="text-center">SonarQube Issues</h2>
      <div className="row">
        {data?.getUserActivity?.sonarIssues?.map((repoData: any) =>
          repoData?.issues?.map((issue: any) => (
            <div key={issue.key} className="col-md-4">
              <div className="card mb-3 shadow-sm">
                <div className={`card-header bg-${issue.severity === "BLOCKER" ? "danger" : "warning"} text-white`}>
                  {issue.type} - {issue.severity}
                </div>
                <div className="card-body">
                  <p className="card-text">{issue.message}</p>
                  <a href={`https://sonarqube.example.com/project/issues?id=${repoData.repo}`} className="btn btn-primary">
                    View in SonarQube
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SonarIssues;
