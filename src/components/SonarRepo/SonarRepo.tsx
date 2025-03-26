import React, { useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { GET_REPOSITORIES } from "../Graphql/Queries";
import "./SonarRepo.css";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

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

  const { data: userData, loading: userLoading, error: userError } = useQuery(GET_USER, {
    variables: { email: userEmail },
    skip: !userEmail,
  });

  useEffect(() => {
    if (userData?.getUserByEmail) {
      setGithubUsername(userData.getUserByEmail.username);
    }
  }, [userData]);

  const { data, loading, error } = useQuery(GET_REPOSITORIES, {
    variables: { username: githubUsername },
    skip: !githubUsername,
  });

  if (userLoading || loading) return <p>Loading...</p>;
  if (userError) return <p>Error fetching user data: {userError.message}</p>;
  if (error) return <p>Error fetching repositories: {error.message}</p>;

  return (
    <motion.div
      className="sonar-repo"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="sonar-repo-title">SonarHub Repositories</h1>
      <motion.table
        className="sonar-repo-table"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <thead>
          <tr>
            <th>Name</th>
            <th>Owner</th>
            <th>Language</th>
            <th>Stars</th>
            <th>Total Commits</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {data?.getUserRepositories.map((repo: any) => (
            <motion.tr
              key={repo.name}
              onClick={() => navigate(`/dashboard/repo/${repo.name}`)}
              className="clickable-row"
              whileHover={{ backgroundColor: "#272e35", transition: { duration: 0.3 } }}
              transition={{ duration: 0.2 }}
            >
              <td>{repo.name}</td>
              <td>{repo.owner}</td>
              <td>{repo.language || "-"}</td>
              <td>{repo.stars || 0}</td>
              <td>{repo.totalCommits || 0}</td>
              <td className="details-cell">
                <FaArrowRight className="arrow-icon" />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </motion.table>
    </motion.div>
  );
};

export default SonarRepo;