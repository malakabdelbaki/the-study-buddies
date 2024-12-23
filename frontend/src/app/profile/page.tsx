'use client'
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '../../types/User';
import { uploadPic } from '../api/user/profile/route';

const ProfileClient = ({ setProfilePic }: { setProfilePic: (pic: string) => void }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [pic, setPic] = useState<string | null>(null);  // For image preview

  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/user/profile', { method: 'GET' });
        if (!response.ok) throw new Error('Failed to fetch user data.');
        const userData = await response.json();
        setUser(userData);
        setPic(userData.profilePictureUrl);  // Set the profile picture
        const imageUrl = `http://localhost:3000/${userData.profilePictureUrl}`;

        // Store the profile picture URL in localStorage
        localStorage.setItem('profilePic', imageUrl);
  
        // Retrieve the profile picture from localStorage if available
        const savedPic = localStorage.getItem('profilePic');
        if (savedPic) {
          setPic(savedPic);
        }
        }       catch (err) {
        console.error(err);
        setError('Failed to load user data.');
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  const handleUpdatePP = async (file: File) => {
    try {
      const updatedUser = await uploadPic(file);
      setUser((prevUser) => prevUser ? { ...prevUser, profilePic: updatedUser.profilePictureUrl } : prevUser);
      setPic(URL.createObjectURL(file));  // Set the image preview on the client side
      // Save the updated profile picture to localStorage
      if (updatedUser.profilePictureUrl) {
        const imageUrl = `http://localhost:3000/${updatedUser.profilePictureUrl}`;
        localStorage.setItem('profilePic', imageUrl);
              } else {
        console.error("Profile picture URL is invalid:", updatedUser.profilePictureUrl);
      }      setProfilePic(updatedUser.profilePictureUrl);  // Update the profile picture in parent component (navbar)
    } catch (err) {
      console.error('Error updating profile picture:', err);
      //setError('Failed to update profile picture.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (user) {
      setUser({ ...user, [name]: value });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (user) {
      try {
        const updateResponse = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        });

        if (!updateResponse.ok) throw new Error('Failed to update profile.');

        if (newPassword) {
          const passwordResponse = await fetch('/api/user/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword, confirmPassword: newPassword }),
          });

          if (!passwordResponse.ok) throw new Error('Failed to update password.');

          alert('Password updated successfully');
          setNewPassword('');
        }
      } catch (err) {
        setError('An error occurred while saving changes.');
        console.error(err);
      }
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch('/api/user/profile', { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete account.');

      alert('Your account has been successfully deleted.');
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
      setError('An error occurred while deleting your account.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>{error || 'Error: User data could not be loaded.'}</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>Manage your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={pic || '/default-avatar.png'} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleUpdatePP(e.target.files[0]);
                      }
                    }}
                  />
                )}
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={user.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={user.email}
                  onChange={handleInputChange}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input id="role" name="role" value={user.role} disabled />
              </div>
              {isEditing && (
                <div>
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
              )}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <CardFooter className="flex justify-between">
              {isEditing ? (
                <>
                  <Button type="submit" onClick={() => alert('Changed saved successfully!')}>Save Changes</Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                  <Button type="button" variant="destructive" onClick={handleDeleteAccount}>
                    Delete Account
                  </Button>
                </>
              )}
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileClient;
