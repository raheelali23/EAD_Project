import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Form from './form';

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const getUsers = async () => {
    const response = await axios.get('http://localhost:5000/api/users');
    setUsers(response.data);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/users/${id}`);
    getUsers();
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setIsEditing(true);
  };

  const handleUpdateSubmit = async (updatedUser) => {
    await axios.put(`http://localhost:5000/api/users/${updatedUser._id}`, updatedUser);
    setIsEditing(false);
    setEditUser(null);
    getUsers();
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div>
      <Form
        getUsers={getUsers}
        isEditing={isEditing}
        editUser={editUser}
        handleUpdateSubmit={handleUpdateSubmit}
      />
      <h2>User List</h2>
      <table>
        <thead>
          <tr>
            <th>Index</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.Index}</td>
              <td>{user["First Name"]}</td>
              <td>{user["Last Name"]}</td>
              <td>{user.Email}</td>
              <td>
                <button onClick={() => handleEdit(user)}>Edit</button>
                <button onClick={() => handleDelete(user._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
