import { GraphQLClient } from 'graphql-request';

const GQL_ENDPOINT = 'https://cms.trial-task.k8s.ext.fcse.io/graphql';

export const getGraphQLClient = (token?: string) => {
  return new GraphQLClient(GQL_ENDPOINT, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
};