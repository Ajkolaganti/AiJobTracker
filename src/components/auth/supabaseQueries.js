import { supabase } from './supabaseClient';

// Function to create a new user profile
export async function createUserProfile(userId, userData) {
  const { data, error } = await supabase
    .from('user_data')
    .insert([
      {
        user_id: userId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        totalApplications: 0,
        resumesCreated: 0,
        upcomingInterviews: 0,
        averageResponseTime: 0,
        applicationStatus: [
          { name: 'Applied', value: 0 },
          { name: 'Interview', value: 0 },
          { name: 'Offer', value: 0 },
          { name: 'Rejected', value: 0 }
        ],
        subscriptionPlan: 'Free'
      }
    ]);

  if (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
  return data;
}

// Function to retrieve user profile data
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('user_data')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
  return data;
}

// Function to update user profile data
export async function updateUserProfile(userId, updateData) {
  const { data, error } = await supabase
    .from('user_data')
    .update(updateData)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
  return data;
}

// Function to increment a specific counter in user profile
export async function incrementUserCounter(userId, counterName) {
  const { data, error } = await supabase.rpc('increment_user_counter', {
    user_id: userId,
    counter_name: counterName
  });

  if (error) {
    console.error(`Error incrementing ${counterName}:`, error);
    throw error;
  }
  return data;
}