import { ApolloServer, UserInputError, gql } from "apollo-server";
import { v1 as uuid } from "uuid";
const persons = [
  {
    name: "Felipe",
    phone: "123456",
    street: "151",
    city: "bogota",
    id: "1",
  },
  {
    name: "Carlos",
    phone: "3425",
    street: "15",
    city: "Merida",
    id: "2",
  },
  {
    name: "Sara",
    street: "3",
    city: "Ponedera",
    id: "3",
  },
];

const typeDefinitions = gql`
  enum YesNo {
    YES
    NO
  }

  type Address {
    street: String!
    city: String!
  }

  type Person {
    name: String!
    phone: String
    address: Address!
    id: ID!
  }

  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person]!
    findPerson(name: String!): Person
    somePersons(limit: Int): [Person!]!
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
    editNumber(name: String!, phone: String!): Person
  }
`;
const resolvers = {
  Query: {
    personCount: () => persons.length,

    allPersons: (root, args) => {
      if (!args.phone) return persons;
      const byPhone = (person) =>
        args.phone === "YES" ? person.phone : !person.phone;

      return persons.filter(byPhone);
    },

    findPerson: (root, args) => {
      const { name } = args;
      return persons.find((person) => person.name === name);
    },

    somePersons: (root, args) => {
      return persons.slice(0, args.limit);
    },
  },

  Mutation: {
    addPerson: (root, args) => {
      if (persons.find((p) => p.name === args.name)) {
        throw new UserInputError("Name must be unique", {
          ivalidArgs: args.name,
        });
      }
      const person = { ...args, id: uuid() };
      persons.push(person);
      return person;
    },
    editNumber: (root, args) => {
      const personIndex = persons.findIndex((p) => p.name === args.name);
      if(personIndex === -1 ) return null
      const person = persons[personIndex]
      const updatePerson = {...person, phone: args.phone}
      persons[personIndex] = updatePerson
      return updatePerson
    },
  },


  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      };
    },
  },
};

const server = new ApolloServer({
  typeDefs: typeDefinitions,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`server ready at ${url}`);
});
