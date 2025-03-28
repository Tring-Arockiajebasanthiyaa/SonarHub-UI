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

export const GET_SIGNUP_EMAIL = gql`
  query GetSignupEmail {
    getSignupEmail
  }
`;
export const VALIDATE_AUTH = gql`
  query  validateAuth($onlyStatus: Boolean) {
     validateAuth(onlyStatus: $onlyStatus) {
      isAuthenticated
      user {
        email
      }
      token
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
  query GetUserActivity($githubUsername: String!) {
  getUserActivity(githubUsername: $githubUsername) {
    githubUsername
    totalRepositories
    totalCommits
    totalStars
    totalForks
    publicRepoCount
    privateRepoCount
    languagesUsed
    topContributedRepo
    earliestRepoCreatedAt
    mostRecentlyUpdatedRepo
    lastActive
    commitHistory
    repoCommits
    sonarIssues
    issuePercentage
    dangerLevel
  }
}

`;

export const GET_REPOSITORIES = gql`
  query GetUserRepositories($username: String!) {
    getUserRepositories(username: $username) {
       name
    owner
    language
    stars
    totalCommits
    }
  }
`;


export const GET_USER = gql`
query GetUserByEmail($email: String!) {
  getUserByEmail(email: $email) {
    name
    username
  }
}
`;
export const GET_SCAN_RESULTS = gql`
  query GetUserScanResults($username: String!) {
    getUserScanResults(username: $username) {
      totalBugs
      vulnerabilities
      codeSmells
      duplications
      timestamp
    }
  }
`;

export const SET_PASSWORD = gql`
mutation SetPassword($email: String!, $password: String!) {
setPassword(email: $email, password: $password)
}

`;


export const SEND_PASSWORD_CHANGE_EMAIL = gql`
mutation SendPasswordChangeEmail($email: String!) {
  sendPasswordChangeEmail(email: $email)
}
`;

export const SAVE_SONAR_ISSUES = gql`
mutation SaveSonarIssues($githubUsername: String!, $repoName: String!, $issues: [SonarIssueInput!]!) {
  saveSonarIssues(githubUsername: $githubUsername, repoName: $repoName, issues: $issues)
}
`;


export const ANALYZE_REPO = gql`
  query AnalyzeRepo(
    $githubUsername: String!
    $repoName: String!
    $branchName: String
  ) {
    analyzeRepo(
      githubUsername: $githubUsername
      repoName: $repoName
      branchName: $branchName
    ) {
      type
      severity
      message
      rule
      component
      line
      effort
      debt
      author
      status
      resolution
      hash
      textRange
      flows
      project {
        u_id
        title
        repoName
        result
      }
    }
  }
`;