import React from "react";
import ReactDOM from "react-dom/client";
import { ApolloProvider } from "@apollo/client";
import client from "./components/graphql/apollo-client"; 
import App from "./App";
import Toaster from "./components/Toaster/Toaster";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
      <Toaster/>
    </ApolloProvider>
  </React.StrictMode>
);
