import { gql } from "@apollo/client";

export const SIGN_IN = gql`
  mutation SignIn($email: String!, $password: String!) {
    signIn(email: $email, password: $password)
  }
`;

export const FORGOT_PASSWORD = gql`
mutation ForgotPassword($email: String!) {
  forgotPassword(email: $email)
}
`;

export const RESET_PASSWORD = gql`
mutation ResetPassword($token: String!, $newPassword: String!) {
resetPassword(token: $token, newPassword: $newPassword)
}
`;

export const GITHUB_AUTH = gql`
mutation GitHubAuth {
  githubAuth {
    isAuthenticated
    user {
      email
    }
    token
  }
}
`;

export const TRIGGER_AUTOMATIC_ANALYSIS = gql`
  mutation TriggerAutomaticAnalysis($githubUsername: String!) {
    triggerAutomaticAnalysis(githubUsername: $githubUsername)
  }
`;


export const ANALYZE_SINGLE_REPOSITORY = gql`
 mutation AnalyzeSingleRepository($githubUsername: String!, $repoName: String!) {
  analyzeSingleRepository(githubUsername: $githubUsername, repoName: $repoName) {
    success
    message
  }
}
`;


export const TRIGGER_ANALYSIS = gql`
  mutation TriggerAnalysis($username: String!, $repoName: String!, $branchName: String!, $prId: Int!) {
    triggerAnalysis(username: $username, repoName: $repoName, branchName: $branchName, prId: $prId) {
      success
      message
    }
  }
`;

export const REQUEST_GITHUB_AUTH = gql`
  mutation RequestGithubAuth($username: String!, $code: String) {
    requestGithubAuth(username: $username, code: $code) {
      success
      message
      url
    }
  }
`;
