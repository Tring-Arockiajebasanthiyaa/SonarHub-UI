import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";


const apolloGitHubClient = new ApolloClient({
  link: new HttpLink({
    uri: import.meta.env.VITE_GITHUB_GRAPHQL_URL,
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_GITHUB_ACCESS_TOKEN || ""}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  }),
  cache: new InMemoryCache(),
});

export default apolloGitHubClient;