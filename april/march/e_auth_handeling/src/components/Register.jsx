import { useState } from "react";

function Register() {
  const [response, setResponse] = useState(null);

  async function registerUser(email, password, role, username) {
    const url = "https://api.freeapi.app/api/v1/users/register";

    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
        role: role,
        username: username,
      }),
    };

    try {
      const res = await fetch(url, options);
      const data = await res.json();
      console.log(data);
      setResponse(data);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <button onClick={() => registerUser()}>Register</button>

      <pre>{JSON.stringify(response, null, 2)}</pre>
    </>
  );
}

export default Register;