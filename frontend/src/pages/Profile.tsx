import { useEffect, useState } from 'react';
import { getCurrentUser } from '../api/users';
import type { User } from '../api/users';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setError('Failed to load user'));
  }, []);

  if (error) {
    return <div role="alert">{error}</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <p>
        <strong>Status:</strong> {user.is_active ? 'Active' : 'Inactive'}
      </p>
      <p>
        <strong>Role:</strong> {user.is_superuser ? 'Admin' : 'User'}
      </p>
    </div>
  );
}
