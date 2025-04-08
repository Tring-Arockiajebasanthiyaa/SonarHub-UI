import React ,{useState,useEffect}from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery,gql } from "@apollo/client";
import { GET_BRANCHES_BY_USERNAME_AND_REPO } from "../Graphql/Queries";
import { Card, Badge, Spinner, Alert, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaGithub, FaCodeBranch, FaArrowLeft} from "react-icons/fa";
import { FaCodePullRequest } from "react-icons/fa6";
import { useAuth } from "../../Context/AuthContext";
const GET_USER = gql`
  query GetUserByEmail($email: String!) {
    getUserByEmail(email: $email) {
      username
    }
  }
`;
const RepositoryBranches = () => {
  const { repoName } = useParams();
  const navigate = useNavigate();
  const { userEmail } = useAuth();
  const [githubUsername, setGithubUsername] = useState<string | null>(null);

  const { data: userData, loading: userLoading, error: userError } = useQuery(GET_USER, {
    variables: { email: userEmail },
    skip: !userEmail,
  });

  useEffect(() => {
    if (userData?.getUserByEmail?.username) {
      setGithubUsername(userData.getUserByEmail.username);
    }
  }, [userData]);

  const {
    data,
    loading,
    error
  } = useQuery(GET_BRANCHES_BY_USERNAME_AND_REPO, {
    variables: {
      githubUsername: githubUsername!,
      repoName: repoName!,
    },
    skip: !githubUsername || !repoName,
  });



  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading branches...</p>
      </div>
    );
  }

  if (error) return <Alert variant="danger">Error fetching branches: {error.message}</Alert>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container py-4"
    >
      <div className="d-flex align-items-center mb-4">
        <Button 
          variant="outline-light" 
          className="me-3" 
          onClick={() => navigate("/dashboard/pull-requests")}
        >
          <FaArrowLeft className="me-1" />
          Back to Repositories
        </Button>
        <h2 className="mb-0">
          <FaGithub className="me-2" />
          {repoName}
        </h2>
        <Badge bg="info" className="ms-3">
          <FaCodeBranch className="me-1" />
          Branches
        </Badge>
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {data?.getBranchesByUsernameAndRepo?.map((branch: any) => (

          <motion.div
          key={`${branch.repoName}-${branch.username}-${branch.name}`}

            className="col"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="h-100 bg-dark text-white">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <FaCodeBranch className="me-2 text-primary" size={24} />
                  <h5 className="mb-0">{branch.name}</h5>
                  {branch.isDefault && (
                    <Badge bg="success" className="ms-auto">
                      Default
                    </Badge>
                  )}
                </div>
                <div className="text-muted mb-2">
                  <small>Last updated: {branch.lastCommitDate || 'Unknown'}</small>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <Button 
                    variant="outline-light" 
                    size="sm"
                    onClick={() => navigate(`/dashboard/pull-requests/${repoName}/branches/${branch.name}/pulls`)}
                  >
                    <FaCodePullRequest className="me-1" />
                    View Pull Requests
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        ))}
      </div>

      {data?.getBranchesByUsernameAndRepo?.length === 0 && (
        <Alert variant="info" className="text-center">
          No branches found for this repository
        </Alert>
      )}
    </motion.div>
  );
};

export default RepositoryBranches;