import { useQuery,gql } from "@apollo/client";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import React,{useState,useEffect} from "react";
import { GET_REPOSITORIES} from "../graphql/queries";
import "./SonarRepo.css";
const GET_USER = gql`
query GetUserByEmail($email: String!) {
  getUserByEmail(email: $email) {
    name
    username
  }
}
`;

const SonarRepo = () => {
  const { userEmail } = useAuth(); 
  const navigate = useNavigate();
  const [githubUsername, setGithubUsername] = useState<string | null>(null);

  console.log(userEmail);
  const { data: userData, loading: userLoading, error: userError } = useQuery(GET_USER, {
    variables: { email: userEmail },
    skip: !userEmail, 
  });
  console.log(userEmail);
  console.log(userData);
  useEffect(() => {
    if (userData?.getUserByEmail) {
      setGithubUsername(userData.getUserByEmail.username);
    }
  }, [userData]);
  console.log(githubUsername);

  const { data, loading, error } = useQuery(GET_REPOSITORIES, {
    variables: { username: githubUsername },
    skip: !githubUsername, 
  });

  if (userLoading || loading) return <p>Loading...</p>;
  if (userError) return <p>Error fetching user data: {userError.message}</p>;
  if (error) return <p>Error fetching repositories: {error.message}</p>;

  return (
    <div className="sonar-repo">
      <h1 className="sonar-repo-title">SonarHub Repositories</h1>
      <div className="sonar-repo-grid">
        {data?.getUserRepositories.map((repo: any) => (
          <div
            key={repo.name}
            className="sonar-repo-card"
            onClick={() => navigate(`/repo/${repo.name}`)}
          >
            <h2 className="sonar-repo-name">{repo.name}</h2>
            <p className="sonar-repo-owner">Owned by {repo.owner}</p>
            <p className="sonar-repo-language">Language: {repo.language || "N/A"}</p>
            <p className="sonar-repo-stars">Stars: {repo.stars || 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SonarRepo;