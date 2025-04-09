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
    language
    stars
    totalCommits
    owner {
      username
    }
  }
 }
`;


export const GET_USER = gql`
query GetUserByEmail($email: String!) {
  getUserByEmail(email: $email) {
    name
    username
    githubAccessToken
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

export const GET_LINES_OF_CODE_REPORT = gql`
  query GetLinesOfCodeReport($githubUsername: String!, $repoName: String!) {
    getLinesOfCodeReport(githubUsername: $githubUsername, repoName: $repoName) {
      totalLines
      sonarQubeLines
      languageDistribution
      lastUpdated
    }
  }
`;

export const GET_PROJECT_ANALYSIS = gql`
  query GetProjectAnalysis($githubUsername: String!, $repoName: String!, $branch: String) {
    getProjectAnalysis(githubUsername: $githubUsername, repoName: $repoName, branch: $branch) {
      project {
        u_id
        title
        repoName
        description
        githubUrl
        isPrivate
        defaultBranch
        lastAnalysisDate
        analysisDuration
        result
        estimatedLinesOfCode
        languageDistribution
        user {
          name
          email
          githubId
        }
      }
      branches {
        name
        dashboardUrl
      }
      codeMetrics {
        u_id
        branch
        language
        linesOfCode
        coverage
        duplicatedLines
        violations
        filesCount
        complexity
        reliabilityRating
        securityRating
        bugs
        vulnerabilities
        codeSmells
        debtRatio
        qualityGateStatus
      }
      sonarIssues {
        u_id
        key
        branch
        type
        severity
        message
        rule
        component
        line
        status
        resolution
        createdAt
        project {
          u_id
          title
          repoName
        }
      }
      locReport {
        totalLines
        sonarQubeLines
        languageDistribution
        lastUpdated
      }
    }
  }
`;

export const GET_REPO_BRANCHES = gql`
  query GetRepoBranches($githubUsername: String!, $repoName: String!) {
    getRepoBranches(githubUsername: $githubUsername, repoName: $repoName) {
      name
      dashboardUrl
    }
  }
`;

export const GET_BRANCHES_BY_USERNAME_AND_REPO = gql`
  query GetBranchesByUsernameAndRepo($githubUsername: String!, $repoName: String!) {
    getBranchesByUsernameAndRepo(githubUsername: $githubUsername, repoName: $repoName) {
      name
      repoName
      username
    }
  }
`;


export const GET_PULL_REQUESTS_BY_BRANCH = gql`
  query GetPullRequestsByBranch($branchName: String!, $repoName: String!, $githubUsername: String!) {
    getPullRequestsByBranch(branchName: $branchName, repoName: $repoName, githubUsername: $githubUsername) {
      prId
      title
      state
      author
      createdAt
      closedAt
      additions
      deletions
      changedFiles
    }
  }
`;

export const GET_PR_COMMENTS = gql`
  query GetPRComments($username: String!, $repoName: String!, $prId: Int!) {
    getPRComments(username: $username, repoName: $repoName, prId: $prId) {
      id
      body
      userLogin
      createdAt
    }
  }
`;
