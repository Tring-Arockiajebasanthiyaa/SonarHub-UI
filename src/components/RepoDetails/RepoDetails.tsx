import { useMutation, useQuery} from "@apollo/client";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import {GET_USER ,SAVE_SONAR_ISSUES, GET_SONAR_ISSUES} from "../graphql/queries";

interface SonarIssue {
  issueType: string;
  severity: string;
  message: string;
  rule: string;
  component: string;
}

const RepoDetails = () => {
  const { repoName } = useParams();
  const { userEmail } = useAuth();
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [issuesStored, setIssuesStored] = useState(false);

  const { data: userData } = useQuery(GET_USER, {
    variables: { email: userEmail },
    skip: !userEmail,
  });

  useEffect(() => {
    if (userData?.getUserByEmail?.username) {
      setGithubUsername(userData.getUserByEmail.username);
    }
  }, [userData]);

  const [saveSonarIssues] = useMutation(SAVE_SONAR_ISSUES);

  useEffect(() => {
    if (githubUsername && repoName && !issuesStored) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/fetch-sonar-issues?githubUsername=${githubUsername}&repoName=${repoName}`)
        .then((res) => res.json())
        .then((issues: SonarIssue[]) => {
          if (issues.length > 0) {
            saveSonarIssues({ variables: { githubUsername, repoName, issues } }).then(() => {
              setIssuesStored(true);
            });
          }
        })
        .catch((error) => console.error("Error fetching SonarQube issues:", error));
    }
  }, [githubUsername, repoName, saveSonarIssues, issuesStored]);

  const { data } = useQuery<{ getSonarIssues: SonarIssue[] }>(GET_SONAR_ISSUES, {
    variables: { githubUsername, repoName },
    skip: !githubUsername || !repoName || !issuesStored,
  });

  const issues = data?.getSonarIssues ?? [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">SonarQube Issues for {repoName}</h1>
      {issues.length > 0 ? (
        <ul>
          {issues.map((issue: SonarIssue, index: number) => (
            <li key={index}>{issue.message} ({issue.severity})</li>
          ))}
        </ul>
      ) : (
        <p>No issues found.</p>
      )}
    </div>
  );
};

export default RepoDetails;
