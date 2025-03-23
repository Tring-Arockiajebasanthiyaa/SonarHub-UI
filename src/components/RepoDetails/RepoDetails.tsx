import { useQuery, gql } from "@apollo/client";
import { useParams } from "react-router-dom";

const GET_SONARQUBE_ANALYSIS = gql`
  query GetSonarQubeAnalysis($projectKey: String!) {
    getSonarQubeAnalysis(projectKey: $projectKey) {
      issues
      codeSmells
      suggestions
    }
  }
`;

const RepoDetails = () => {
  const { repoName } = useParams();
  const { data, loading, error } = useQuery(GET_SONARQUBE_ANALYSIS, { variables: { projectKey: repoName } });

  if (loading) return <p>Loading SonarQube analysis...</p>;
  if (error) return <p>Error fetching SonarQube data: {error.message}</p>;

  const analysisData = data?.getSonarQubeAnalysis;
  const issues = analysisData?.issues ? JSON.parse(analysisData.issues) : [];
  const codeSmells = analysisData?.codeSmells ? JSON.parse(analysisData.codeSmells) : [];
  const suggestions = analysisData?.suggestions ? JSON.parse(analysisData.suggestions) : [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">SonarQube Analysis for {repoName}</h1>

      {/* Issues Section */}
      <h2 className="text-xl font-semibold mb-2">Issues</h2>
      {issues.length === 0 ? (
        <p>No issues found.</p>
      ) : (
        <ul className="space-y-4">
          {issues.map((issue: any, index: number) => (
            <li key={index} className="p-4 bg-gray-100 rounded-lg">
              <strong>{issue.message}</strong>
              <p>Severity: {issue.severity}</p>
              <p>Type: {issue.type}</p>
            </li>
          ))}
        </ul>
      )}

      {/* Code Smells Section */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Code Smells</h2>
      {codeSmells.length === 0 ? (
        <p>No code smells found.</p>
      ) : (
        <ul className="space-y-4">
          {codeSmells.map((smell: any, index: number) => (
            <li key={index} className="p-4 bg-yellow-100 rounded-lg">
              <strong>{smell.message}</strong>
              <p>Severity: {smell.severity}</p>
            </li>
          ))}
        </ul>
      )}

      {/* Suggestions Section */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Suggestions for Improvement</h2>
      {suggestions.length === 0 ? (
        <p>No suggestions found.</p>
      ) : (
        <ul className="space-y-4">
          {suggestions.map((suggestion: any, index: number) => (
            <li key={index} className="p-4 bg-green-100 rounded-lg">
              <strong>{suggestion.rule}</strong>
              <p>{suggestion.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RepoDetails;
