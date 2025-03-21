import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";

const apolloGitHubClient = new ApolloClient({
  link: new HttpLink({
    uri: GITHUB_GRAPHQL_API,
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_GITHUB_ACCESS_TOKEN || ""}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  }),
  cache: new InMemoryCache(),
});

export default apolloGitHubClient;