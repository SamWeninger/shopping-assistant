
import { Amplify } from 'aws-amplify';
import { signUp as amplifySignUp, confirmSignUp as amplifyConfirmSignUp, signIn as amplifySignIn, signOut as amplifySignOut, getCurrentUser as amplifyGetCurrentUser, fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';

// This is just a placeholder config - user would need to replace with their actual Cognito details
const amplifyConfig = {
  Auth: {
    Cognito: {
      region: 'us-east-2',
      userPoolId: 'REPLACE_WITH_YOUR_USER_POOL_ID',
      userPoolClientId: 'REPLACE_WITH_YOUR_CLIENT_ID',
      loginWith: {
        email: true,
        phone: true,
        username: true
      },
      oauth: {
        domain: 'REPLACE_WITH_YOUR_DOMAIN',
        scope: ['email', 'profile', 'openid'],
        redirectSignIn: ['http://localhost:8080/'],
        redirectSignOut: ['http://localhost:8080/'],
        responseType: 'code'
      }
    }
  }
};

// Initialize Amplify
Amplify.configure(amplifyConfig);

// Authentication functions
export const signUp = async (username: string, password: string, email: string, phone: string) => {
  try {
    const { isSignUpComplete, userId, nextStep } = await amplifySignUp({
      username,
      password,
      options: {
        userAttributes: {
          email,
          phone_number: phone,
        }
      }
    });
    return { isSignUpComplete, userId, nextStep };
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const confirmSignUp = async (username: string, code: string) => {
  try {
    const { isSignUpComplete, nextStep } = await amplifyConfirmSignUp({
      username,
      confirmationCode: code
    });
    return { isSignUpComplete, nextStep };
  } catch (error) {
    console.error('Error confirming sign up:', error);
    throw error;
  }
};

export const signIn = async (username: string, password: string) => {
  try {
    const { isSignedIn, nextStep } = await amplifySignIn({
      username,
      password,
    });
    return { isSignedIn, nextStep };
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await amplifySignOut();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const user = await amplifyGetCurrentUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const getCurrentSession = async () => {
  try {
    const session = await fetchAuthSession();
    return session;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
};

export const getIdToken = async () => {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString();
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
};

export const getUser = async () => {
  try {
    const user = await amplifyGetCurrentUser();
    const attributes = await fetchUserAttributes();
    
    return {
      id: attributes.sub,
      username: user.username,
      email: attributes.email,
      phone: attributes.phone_number,
    };
  } catch (error) {
    console.error('Error getting user details:', error);
    return null;
  }
};
