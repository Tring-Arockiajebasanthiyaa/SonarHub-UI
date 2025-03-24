import { useMutation, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { GET_USER, SAVE_SONAR_ISSUES, GET_SONAR_ISSUES } from "../graphql/queries";

interface SonarIssue {
  issueType: string;
  severity: string;
  message: string;
  rule: string;
  component: string;
}

// const RepoDetails = () => {
//   const { repoName } = useParams();
//   const { userEmail } = useAuth();
//   const [githubUsername, setGithubUsername] = useState<string | null>(null);
//   const [issuesStored, setIssuesStored] = useState(false);

//   const { data: userData } = useQuery(GET_USER, {
//     variables: { email: userEmail },
//     skip: !userEmail,
//   });

//   useEffect(() => {
//     if (userData?.getUserByEmail?.username) {
//       setGithubUsername(userData.getUserByEmail.username);
//     }
//   }, [userData]);

//   const [saveSonarIssues] = useMutation(SAVE_SONAR_ISSUES);

//   // Move useQuery to the top level
//   const { data } = useQuery<{ getSonarIssues: SonarIssue[] }>(GET_SONAR_ISSUES, {
//     variables: { githubUsername: githubUsername || "arockiyajebasanthiya", repoName },
//   });

//   useEffect(() => {
//     // if (githubUsername && repoName && !issuesStored) {
//     //   fetch(`http://localhost:9000/api/fetch-sonar-issues?githubUsername=${githubUsername}&repoName=${repoName}`)
//     //     .then((res) => res.json())
//     //     .then((issues: SonarIssue[]) => {
//     //       if (issues.length > 0) {
//     //         saveSonarIssues({ variables: { githubUsername, repoName, issues } })
//     //           .then(() => setIssuesStored(true))
//     //           .catch(console.error);
//     //       }
//     //     })
//     //     .catch((error) => console.error("Error fetching SonarQube issues:", error));
//     // }
//   }, [githubUsername, repoName, saveSonarIssues, issuesStored]);

//   const issues = data?.getSonarIssues ?? [];

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">SonarQube Issues for {repoName}</h1>
//       {issues.length > 0 ? (
//         <div className="space-y-4">
//           {issues.map((issue: SonarIssue, index: number) => (
//             <div key={index} className="p-4 bg-white rounded-lg shadow">
//               <div className="flex items-start gap-4">
//                 <div className={`w-3 h-3 mt-1 rounded-full ${
//                   issue.severity === 'BLOCKER' ? 'bg-red-500' :
//                   issue.severity === 'CRITICAL' ? 'bg-orange-500' :
//                   issue.severity === 'MAJOR' ? 'bg-yellow-500' :
//                   'bg-blue-500'
//                 }`}></div>
//                 <div>
//                   <p className="font-medium">{issue.message}</p>
//                   <div className="flex gap-4 mt-2 text-sm text-gray-600">
//                     <span>Type: {issue.issueType}</span>
//                     <span>Severity: {issue.severity}</span>
//                     <span>Component: {issue.component}</span>
//                   </div>
//                   {issue.rule && (
//                     <p className="mt-1 text-sm text-gray-500">Rule: {issue.rule}</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p className="text-gray-500">No issues found for this repository.</p>
//       )}
//     </div>
//   );
// };
const RepoDetails = () => {
  const { repoName } = useParams();
  const { userEmail } = useAuth();
  const [githubUsername, setGithubUsername] = useState<string | null>(null);

  // Debugging logs
  console.log("Initial state:", { repoName, userEmail });

  const { data: userData } = useQuery(GET_USER, {
    variables: { email: userEmail },
    skip: !userEmail,
  });

  useEffect(() => {
    if (userData?.getUserByEmail?.username) {
      console.log("Setting GitHub username:", userData.getUserByEmail.username);
      setGithubUsername(userData.getUserByEmail.username);
    }
  }, [userData]);
  console.log(userData);
  // Main query with complete debugging
  const { data, loading, error, called } = useQuery<{ getSonarIssues: SonarIssue[] }>(
    GET_SONAR_ISSUES,
    {
      variables: { 
        githubUsername: githubUsername || "arockiyajebasanthiya", 
        repoName: repoName || "" 
      },
      onCompleted: (data) => console.log("Query completed:", data),
      onError: (error) => console.error("Query error:", error),
    }
  );

  console.log("Query debug:", { called, loading, error, data });

  if (loading) return <div className="p-6">Loading issues...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error.message}</div>;

  const issues = data?.getSonarIssues || [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">SonarQube Issues for {repoName}</h1>
      {issues.length > 0 ? (
        <div className="space-y-4">
          {issues.map((issue, index) => (
            <div></div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">
          {data ? "No issues found" : "Failed to load issues"}
        </p>
      )}
    </div>
  );
};

export default RepoDetails;