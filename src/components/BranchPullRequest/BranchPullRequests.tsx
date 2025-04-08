import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useLazyQuery, gql ,useMutation} from "@apollo/client";
import { Badge, Spinner, Alert, Button, Table } from "react-bootstrap";

import { motion } from "framer-motion";
import { FaGithub, FaArrowLeft } from "react-icons/fa";
import { FaCodePullRequest } from "react-icons/fa6";
import { useAuth } from "../../Context/AuthContext";
import { GET_PULL_REQUESTS_BY_BRANCH } from "../Graphql/Queries";
import { TRIGGER_ANALYSIS,REQUEST_GITHUB_AUTH } from "../Graphql/Mutations";
const GET_USER = gql`
  query GetUserByEmail($email: String!) {
    getUserByEmail(email: $email) {
      username
    }
  }
`;



const BranchPullRequests = () => {
  const { repoName, branchName } = useParams<{
    repoName: string;
    branchName: string;
  }>();
  const navigate = useNavigate();
  const { userEmail } = useAuth();
  const [githubUsername, setGithubUsername] = useState<string>("");
  const [triggerAnalysis] = useMutation(TRIGGER_ANALYSIS);

  const handleTriggerAnalysis = async () => {
    const firstPR = data?.getPullRequestsByBranch?.[0];
    if (!firstPR) return;
  
    try {
      const { data: result } = await triggerAnalysis({
        variables: {
          username: githubUsername,
          repoName,
          branchName,
          prId: firstPR.prId,
        },
      });
  
      if (result?.triggerAnalysis?.success) {
        alert("Analysis triggered and comment posted!");
      } else {
        alert(`Something went wrong: ${result?.triggerAnalysis?.message}`);
      }
    } catch (err: any) {
      console.error("GraphQL error:", err);
      alert("Error triggering analysis.");
    }
  };
  const [requestGithubAuth] = useMutation(REQUEST_GITHUB_AUTH);
  const handleGithubLogin = async () => {
    try {
      const { data: authUrlResult } = await requestGithubAuth({
        variables: { username: githubUsername },
      });
  
      const redirectUrl = authUrlResult?.requestGithubAuth?.url;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        const message = authUrlResult?.requestGithubAuth?.message || "GitHub auth failed.";
        alert(message);
      }
    } catch (err) {
      console.error("GitHub Auth Error:", err);
      alert("GitHub auth failed.");
    }
  };
  
  const {
    loading: userLoading,
    error: userError,
    data: userData,
  } = useQuery(GET_USER, {
    variables: { email: userEmail },
    skip: !userEmail,
    onCompleted: (data) => {
      if (data?.getUserByEmail?.username) {
        setGithubUsername(data.getUserByEmail.username);
      }
    },
  });
  const [getPullRequestsByBranch, { data, loading, error }] = useLazyQuery(
    GET_PULL_REQUESTS_BY_BRANCH,
    {
      fetchPolicy: "network-only",
    }
  );
  useEffect(() => {
    console.log("repoName:", repoName);
    console.log("branchName:", branchName);
    console.log("githubUsername:", githubUsername);
  }, [repoName, branchName, githubUsername]);
  
  useEffect(() => {
    if (githubUsername && repoName && branchName) {
      getPullRequestsByBranch({
        variables: {
          repoName,
          branchName,
          githubUsername,
        },
      });
    }
  }, [githubUsername, repoName, branchName]);

  if (userLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading user data...</p>
      </div>
    );
  }

  if (userError) {
    return (
      <Alert variant="danger">Error fetching user: {userError.message}</Alert>
    );
  }

  if (!githubUsername) {
    return <Alert variant="warning">GitHub username not available</Alert>;
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading pull requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">Error fetching pull requests: {error.message}</Alert>
    );
  }

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
          onClick={() => navigate(`/dashboard/pull-requests/${repoName}/branches`)}
        >
          <FaArrowLeft className="me-1" />
          Back to Branches
        </Button>
        <Button variant="dark" className="me-3" onClick={handleGithubLogin}>
  <FaGithub className="me-1" />
  Connect GitHub
</Button>
              
        <Button
          variant="primary"
          className="ms-auto"
          onClick={handleTriggerAnalysis}
          disabled={!data?.getPullRequestsByBranch?.length}
          >
          Trigger SonarQube Analysis
          </Button>

        <h2 className="mb-0">
          <FaGithub className="me-2" />
          {repoName} / {branchName}
        </h2>
        <Badge bg="info" className="ms-3">
          <FaCodePullRequest className="me-1" />
          Pull Requests
        </Badge>
      </div>

      {data?.getPullRequestsByBranch?.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Title</th>
              <th>State</th>
              <th>Author</th>
              <th>Created</th>
              <th>Closed </th>
              <th>Changes</th>
            </tr>
          </thead>
          <tbody>
            {data.getPullRequestsByBranch.map((pr: any) => (
              <tr key={pr.pr_id}>
                <td>{pr.title}</td>
                <td>
                  <Badge bg={pr.state === "OPEN" ? "success" : "secondary"}>
                    {pr.state}
                  </Badge>
                </td>
                <td>{pr.author}</td>
                <td>{new Date(pr.createdAt).toLocaleDateString("en-GB")}</td>
                <td>{pr.closedAt ? new Date(pr.closedAt).toLocaleDateString("en-GB") : "Not Closed"}</td>
                <td>
                  +{pr.additions} -{pr.deletions} ({pr.changedFiles} files)
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info">No pull requests found for this branch.</Alert>
      )}
    </motion.div>
  );
};

export default BranchPullRequests;