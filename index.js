import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { data } from "./data.js";

const typeDefs = `

type Event{
    id: ID!
    title: String!
    desc: String!
    date: String!
    from: String!
    to: String!
    location_id: ID!
    user_id: ID!
    user: User!
    location: Location
    participants:[Participant!]!
}

type Location{
    id: ID!
    name: String!
    desc: String!
    lat: Float!
    lng: Float!
}

type User{
    id: ID!
    username: String!
    email: String!
    events: [Event!]!
}

type Participant {
    id: ID!
    user_id : ID!
    event_id : ID!
    user: User!
}

type Query {
    #  Event Queryleri
    events: [Event!]!
    event(id: ID!): Event!

    #Location Queryleri
    locations: [Location!]!
    location(id: ID): Location!

    #User Queryleri
    users: [User!]!
    user(id:ID): User!

    # Participants Queryleri
    participants: [Participant!]!
    participant(id:ID!): Participant!
}
`;

const resolvers = {
  Query: {
    events: () => data.events,
    event: (parent, args) =>
      data.events.find((event) => event.id.toString() === args.id),

    locations: () => data.locations,
    location: (parent, args) => {
      if (!args.id) {
        return data.locations.find(
          (location) => location.id.toString() === parent.location_id
        );
      } else {
        return data.locations.find(
          (location) => location.id.toString() === args.id
        );
      }
    },

    users: () => data.users,
    user: (parent, args) => {
      if (!args.id) {
        return data.users.find((user) => user.id.toString() === parent.user_id);
      } else {
        return data.users.find((user) => user.id.toString() === args.id);
      }
    },
    participants: () => data.participants,
    participant: (parent, args) =>
      data.participants.find(
        (participant) => participant.id.toString() === args.id
      ),
  },
  User: {
    events: (parent, args) =>
      data.events.filter((event) => event.id === parent.id),
  },
  Event: {
    user: (parent, args) =>
      data.users.find(
        (user) => user.id.toString() === parent.user_id.toString()
      ),
    location: (parent) =>
      data.locations.find(
        (location) => location.id.toString() === parent.location_id.toString()
      ),
    participants: (parent) =>
      data.participants
        .filter(
          (participant) =>
            participant.event_id.toString() === parent.id.toString()
        )
        .map((participant) => ({
          ...participant,
          user: data.users.find(
            (user) => user.id.toString() === participant.user_id.toString()
          ),
        })),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
