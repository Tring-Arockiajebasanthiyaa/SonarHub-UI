import { gql } from "@apollo/client";

export const CHECK_AUTH = gql`
  query CheckAuth {
    checkAuth {
      isAuthenticated
      user {
        email
      }
    }
  }
`;

export const GET_USER_REPOSITORIES = gql`
  query GetUserRepositories($username: String!) {
    user(login: $username) {
      repositories(first: 10, orderBy: { field: UPDATED_AT, direction: DESC }) {
        nodes {
          name
          url
          stargazerCount
        }
      }
    }
  }
`;

export const GET_USER_ACTIVITY = gql`
  query getUserActivity($githubUsername: String!) {
    getUserActivity(githubUsername: $githubUsername) {
      u_id
      githubUsername
      commitHistory
      repoCommits
      totalRepositories
      totalCommits
      totalForks
      totalStars
      publicRepoCount
      privateRepoCount
      languagesUsed
      topContributedRepo
      earliestRepoCreatedAt
      mostRecentlyUpdatedRepo
      lastActive
      createdAt
      updatedAt
      sonarIssues 
      issuePercentage
      dangerLevel
    }
  }
`;



export const GET_USER = gql`
  query GetUserByEmail($email: String!) { # ✅ Using email as variable
    getUserByEmail(email: $email) {
      name
      username
    }
  }
`;
