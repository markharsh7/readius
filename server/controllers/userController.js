// server/controllers/userController.js
const { getAuth } = require('firebase-admin/auth');
const prisma = require('../config/db');

const updateUserPhone = async (req, res) => {
  const { idToken } = req.body;
  const userId = req.user.id; // From our 'protect' middleware

  if (!idToken) {
    return res.status(400).json({ message: 'Firebase ID token is required.' });
  }

  try {
    // Verify the token from the client to get the verified phone number
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const phoneNumber = decodedToken.phone_number;

    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number not found in token. Please verify on the client.' });
    }

    // Update the user's phone number in our database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { phone: phoneNumber },
    });

    res.status(200).json({ message: 'Phone number updated successfully.', phone: updatedUser.phone });
  } catch (error) {
    console.error("Phone update error:", error);
    res.status(500).json({ message: 'Failed to update phone number.' });
  }
};

module.exports = { updateUserPhone };