import { useQuery, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";

const GET_REPOSITORIES = gql`
  query GetUserRepositories {
    getUserRepositories {
      name
      owner
    }
  }
`;

const SonarRepo = () => {
  const { data, loading, error } = useQuery(GET_REPOSITORIES);
  const navigate = useNavigate();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching repositories: {error.message}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">GitHub Repositories</h1>
      <ul className="space-y-4">
        {data?.getUserRepositories.map((repo: any) => (
          <li
            key={repo.name}
            className="p-4 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300"
            onClick={() => navigate(`/repo/${repo.name}`)}
          >
            <strong>{repo.name}</strong> - Owned by {repo.owner}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SonarRepo;
