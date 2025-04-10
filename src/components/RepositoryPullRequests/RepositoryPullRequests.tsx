import React, { useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { GET_REPOSITORIES } from "../Graphql/Queries";
import { motion } from "framer-motion";
import { FaGithub, FaArrowRight, FaCodeBranch, FaStar, FaCode } from "react-icons/fa";
import { Card, Badge, Spinner, Alert } from "react-bootstrap";

const GET_USER = gql`
  query GetUserByEmail($email: String!) {
    getUserByEmail(email: $email) {
      name
      username
    }
  }
`;

const RepositoryCards = () => {
  const { userEmail } = useAuth();
  const navigate = useNavigate();
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

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

  const handleRepoClick = (repoName: string) => {
    navigate(`/dashboard/pull-requests/${repoName}/branches`);
  };

  if (userLoading || loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading repositories...</p>
      </div>
    );
  }

  if (userError) return <Alert variant="danger">Error fetching user data: {userError.message}</Alert>;
  if (error) return <Alert variant="danger">Error fetching repositories: {error.message}</Alert>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container py-4"
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <FaGithub className="me-2" />
          {githubUsername}'s Repositories
        </h2>
        <div>
          <button 
            className={`btn btn-sm ${viewMode === 'cards' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('cards')}
          >
            Card View
          </button>
          <button 
            className={`btn btn-sm ms-2 ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('list')}
          >
            List View
          </button>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"
        >
          {data?.getUserRepositories?.map((repo: any) => (
            <motion.div
              key={repo.name}
              className="col"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className="h-100 bg-dark text-white clickable-card"
                onClick={() => handleRepoClick(repo.name)}
              >
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <FaGithub className="me-2 text-primary" size={24} />
                    <h5 className="mb-0">{repo.name}</h5>
                  </div>
                  <div className="mb-3">
                    <Badge bg="secondary" className="me-2">
                      <FaCode className="me-1" />
                      {repo.language || '-'}
                    </Badge>
                    <Badge bg="warning" className="me-2">
                      <FaStar className="me-1" />
                      {repo.stars || 0}
                    </Badge>
                    <Badge bg="info">
                      <FaCodeBranch className="me-1" />
                      {repo.totalCommits || 0} commits
                    </Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className="text-muted">View branches</span>
                    <FaArrowRight className="arrow-icon" />
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-dark text-white">
            <Card.Body className="p-0">
              <table className="table table-dark table-hover mb-0">
                <thead>
                  <tr>
                    <th>Repository</th>
                    <th>Language</th>
                    <th>Stars</th>
                    <th>Commits</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data?.getUserRepositories?.map((repo: any) => (
                    <motion.tr
                      key={repo.name}
                      onClick={() => handleRepoClick(repo.name)}
                      className="clickable-row"
                      whileHover={{ backgroundColor: "#2a2f36" }}
                      transition={{ duration: 0.2 }}
                    >
                      <td>
                        <FaGithub className="me-2" />
                        {repo.name}
                      </td>
                      <td>{repo.language || '-'}</td>
                      <td>{repo.stars || 0}</td>
                      <td>{repo.totalCommits || 0}</td>
                      <td className="text-end">
                        <FaArrowRight className="arrow-icon" />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </Card.Body>
          </Card>
        </motion.div>
      )}

      {data?.getUserRepositories?.length === 0 && (
        <Alert variant="info" className="text-center">
          No repositories found for this user
        </Alert>
      )}
    </motion.div>
  );
};

export default RepositoryCards;
