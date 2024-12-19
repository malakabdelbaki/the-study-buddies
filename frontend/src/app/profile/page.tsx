'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from '../../types/User';

const ProfileClient = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/user/profile', { method: 'GET' });
        if (!response.ok) throw new Error('Failed to fetch user data.');
        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        console.error(err);
        setError('Failed to load user data.');
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (user) {
      setUser({ ...user, [name]: value });
    }
  };

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };

  // Handle profile save
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (user) {
    try {
      // Update user profile
      const updateResponse = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      if (!updateResponse.ok) throw new Error('Failed to update profile.');

      // Update password if provided
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

      // Show success alert and exit editing mode
      // alert('Profile updated successfully');
      // setIsEditing(false); // Exit editing mode
    } catch (err) {
      setError('An error occurred while saving changes.');
      console.error(err);
    }
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
                  <AvatarImage src={user.profilePic} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          if (e.target?.result) {
                            setUser((prevUser) =>
                              prevUser ? { ...prevUser, profilePic: e.target?.result as string } : prevUser
                            );
                          }
                        };
                        reader.readAsDataURL(e.target.files[0]);
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
                  value={user.email } 
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
                  <Button type="submit">Save Changes</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false) }
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)} // Toggle editing mode
                >
                  Edit Profile
                </Button>
              )}
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileClient;
