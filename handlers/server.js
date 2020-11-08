const express = require('express');
const fetch = require("node-fetch");

const app = express();

app.use(express.json());
app.use(express.urlencoded());

const HASURA_OPERATION = `
mutation insertUserOne($name: String, $age: Int) {
  insert_user_one(object: {age: $age, name: $name}) {
    id
    name
    age
  }
}
`;

// execute the parent operation in Hasura
const execute = async (variables) => {
  const fetchResponse = await fetch(
    "http://host.docker.internal:8080/v1/graphql",
    {
      method: 'POST',
      body: JSON.stringify({
        query: HASURA_OPERATION,
        variables
      })
    }
  );
  const data = await fetchResponse.json();
  console.log('DEBUG return data:', data);
  return data;
};


// Request Handler
app.post('/insertUserOne', async (req, res) => {

  // get request input
  const { name, age } = req.body.input;
  console.log('DEBUG body:', req.body);

  // run some business logic

  // execute the Hasura operation
  const { data, errors } = await execute({ name, age });

  // if Hasura operation errors, then throw error
  if (errors) {
    return res.status(400).json(errors[0])
  }

  // success
  return res.json({
    ...data.insert_user_one
  })

});

app.listen(3000, () => {
    console.log('handler server ready on 3000');
})