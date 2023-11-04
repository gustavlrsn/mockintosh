// import fetch from "isomorphic-unfetch";
// import { Client, defaultExchanges, subscriptionExchange, Provider } from "urql";
// import { SubscriptionClient } from "subscriptions-transport-ws";
// import ws from "isomorphic-ws";

// const WithGraphQL = ({ session, children }) => {
//   let token = "";

//   if (session) {
//     token = `Bearer ${session.token}`;
//   }

//   const subscriptionClient = new SubscriptionClient(
//     process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/v1/graphql",
//     {
//       reconnect: true,
//       connectionParams: {
//         headers: {
//           ...(token && { Authorization: token }),
//           //"x-hasura-default-role": "user",
//         },
//       },
//     },
//     ws
//   );

//   const client = new Client({
//     url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/v1/graphql",
//     fetch,
//     fetchOptions: {
//       headers: {
//         ...(token && { Authorization: token }),
//         //"x-hasura-default-role": "user",
//       },
//     },
//     requestPolicy: "cache-and-network",
//     exchanges: [
//       ...defaultExchanges,
//       subscriptionExchange({
//         forwardSubscription(operation) {
//           return subscriptionClient.request(operation);
//         },
//       }),
//     ],
//   });

//   return <Provider value={client}>{children}</Provider>;
// };

// export default WithGraphQL;
