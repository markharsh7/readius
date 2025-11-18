// server/controllers/authController.js

const { initializeApp, cert , getApps} = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db'); // Our Prisma client instance
const serviceAccount = require('../firebase-service-account-key.json');

// Initialize Firebase Admin SDK
// Check if the app is already initialized to prevent errors during hot-reloads
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

// The list of allowed domains
const ALLOWED_DOMAINS = ['@vitbhopal.ac.in'];

const loginWithGoogle = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'ID token is required.' });
  }

  try {
    // 1. Verify the Firebase ID token
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const { name, picture, email, uid } = decodedToken;

    // 2. Check if the email domain is allowed
    const emailDomain = `@${email.split('@')[1]}`;
    if (!ALLOWED_DOMAINS.includes(emailDomain)) {
      return res.status(403).json({ message: 'Email domain is not allowed.' });
    }

    // 3. Find or create the user in our database (upsert)
    const user = await prisma.user.upsert({
      where: { email: email },
      update: { // If user exists, maybe update name/picture
        fullName: name,
        profilePicture: picture,
      },
      create: { // If user doesn't exist, create them
        googleId: uid,
        email: email,
        fullName: name,
        profilePicture: picture,
        phone: `placeholder_${uid}`, // Temporary placeholder until OTP verification
        emailDomain: emailDomain,
      },
    });

    // 4. Create our own application JWT
    const appTokenPayload = { id: user.id, email: user.email };
    const appToken = jwt.sign(appTokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(200).json({
      message: 'User authenticated successfully!',
      token: appToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        hasListedFirstBook: user.hasListedFirstBook,
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ message: 'Authentication failed. Invalid token.' });
  }
};

module.exports = { loginWithGoogle };

