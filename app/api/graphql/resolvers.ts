const resolvers = {
  SearchType: {
    __resolveType(obj: any) {
      if (obj.species) {
        return 'Animal'
      }
      return 'Person'
    },
  },
  Person: {
    name: (person: any) => {
      if (person.name) {
        return person.name.toUpperCase()
      }
      return ''
    },
    pets: (person: any) => {
      console.log('pets ----->', person.pets)
      return [{ name: 'Derrell', species: 'Big cat' }]
    },
  },
  Query: {
    search: () => {
      return [
        {
          name: 'Scott',
          id: 'asfjnsuur',
          pets: [{ name: 'Derrell', species: 'Big cat' }],
        },
        { name: 'Derrell', species: 'Big cat' },
      ]
    },
    me: () => {
      return 'ME'
    },
    people: () => {
      return [
        {
          id: '4782y989h',
          name: 'henry',
          pets: [1],
        },
      ]
    },
  },
}

export default resolvers
function __resolveType() {
  throw new Error('Function not implemented.')
}
