import React, { useState } from 'react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthday, setBirthday] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Constructing the payload
    const payload = {
      email,
      password,
      birthday,
    };

    try {
      // Sending the user input to the server using fetch
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // If server responds with a non-OK (200) status, throw an error
        throw new Error(`Failed to register: ${response.status}`);
      }

      const data = await response.json(); // Assuming the server sends back some data
      console.log('Registration successful:', data);
      // Here, you can redirect the user or show a success message
    } catch (error) {
      console.error('Registration error:', error);
      // Handle registration errors (e.g., display an error message)
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="birthday">Birthday:</label>
          <input
            type="date"
            id="birthday"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
