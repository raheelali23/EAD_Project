import user from './model.js';

export const registerUser = async (req, res) => {
  try {
    const { Index, "First Name": firstName, "Last Name": lastName, Email } = req.body;

    const newUser = new user({
      Index,
      "First Name": firstName,
      "Last Name": lastName,
      Email
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ Add this export:
export const getUsers = async (req, res) => {
  try {
    const users = await user.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// controll.js
export const DeleteUser = async (req, res) => {
    try {
      console.log('Trying to delete user with id:', req.params.id);
  
      const deletedUser = await user.findByIdAndDelete(req.params.id);
  
      if (!deletedUser) {
        console.log('User not found!');
        return res.status(404).json({ message: 'User not found' });
      }
  
      console.log('Deleted user:', deletedUser);
      res.status(200).json({ message: 'User deleted successfully' });
  
    } catch (err) {
      console.error('Delete error:', err.message);
      res.status(500).json({ message: err.message });
    }
  };
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const foundUser = await user.findById(userId);
    
    if (!foundUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(foundUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const UpdateUserbyId = async (req, res) => {
    try {
      console.log("Updating user with ID:", req.params.id); // 👈 Add this line
      // console.log("port", process.env.PORT)

  
      const updatedUser = await user.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
  
      if (!updatedUser) return res.status(404).json({ message: "User not found" });
  
      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  

  
  
  