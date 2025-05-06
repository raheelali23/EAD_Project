import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Form = ({ getUsers, isEditing, editUser, handleUpdateSubmit }) => {
  const [formData, setFormData] = useState({
    Index: '',
    "First Name": '',
    "Last Name": '',
    Email: ''
  });

  // Autofill form when editing
  useEffect(() => {
    if (isEditing && editUser) {
      setFormData(editUser);
    }
  }, [isEditing, editUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditing) {
      await handleUpdateSubmit(formData); // Use update
    } else {
      try {
        const response = await axios.post('http://localhost:5000/api/users/register', formData);
        console.log('User registered:', response.data);
        getUsers();
      } catch (error) {
        console.error('Error registering user:', error);
      }
    }

    // Clear form after submit
    setFormData({
      Index: '',
      "First Name": '',
      "Last Name": '',
      Email: ''
    });
  };

  return (
    <div>
      <h2>{isEditing ? "Update User" : "Register New User"}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Index</label>
          <input
            type="number"
            name="Index"
            value={formData.Index}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>First Name</label>
          <input
            type="text"
            name="First Name"
            value={formData["First Name"]}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Last Name</label>
          <input
            type="text"
            name="Last Name"
            value={formData["Last Name"]}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="Email"
            value={formData.Email}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">{isEditing ? "Update" : "Submit"}</button>
      </form>
    </div>
  );
};

export default Form;
