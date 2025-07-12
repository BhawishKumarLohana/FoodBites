"use client";
import React, { useEffect, useState } from "react";
import { getToken, decodeToken, removeToken } from "../../jwt";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    const payload = decodeToken(token);
    if (!payload) {
      removeToken();
      router.push("/login");
      return;
    }
    setUser(payload);
    fetchUserData(payload.userId, token);
  }, [router]);

  const fetchUserData = async (userId, token) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        // Initialize edit form with current data
        setEditForm({
          email: data.email,
          address: data.address,
          country: data.country,
          city: data.city,
          primary_PhoneN: data.primary_PhoneN,
          secondary_PhoneN: data.secondary_PhoneN,
          // Role-specific fields
          orgName: data.organization?.orgName || '',
          regNumber: data.organization?.regNumber || '',
          orgDescription: data.organization?.description || '',
          orgType: data.organization?.type || '',
          resName: data.restaurant?.ResName || '',
          openTime: data.restaurant?.openTime || '',
          closeTime: data.restaurant?.closeTime || '',
          resDescription: data.restaurant?.description || '',
          fullName: data.individualDonor?.fullName || '',
          idcard: data.individualDonor?.idcard || '',
        });
      } else {
        setError('Failed to load user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    if (!user || !userData) return;

    try {
      const token = getToken();
      const response = await fetch(`/api/users/${user.userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        removeToken();
        router.push("/login");
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account');
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Reset form to current data when starting to edit
      setEditForm({
        email: userData.email,
        address: userData.address,
        country: userData.country,
        city: userData.city,
        primary_PhoneN: userData.primary_PhoneN,
        secondary_PhoneN: userData.secondary_PhoneN,
        orgName: userData.organization?.orgName || '',
        regNumber: userData.organization?.regNumber || '',
        orgDescription: userData.organization?.description || '',
        orgType: userData.organization?.type || '',
        resName: userData.restaurant?.ResName || '',
        openTime: userData.restaurant?.openTime || '',
        closeTime: userData.restaurant?.closeTime || '',
        resDescription: userData.restaurant?.description || '',
        fullName: userData.individualDonor?.fullName || '',
        idcard: userData.individualDonor?.idcard || '',
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async () => {
    if (!user || !userData) return;

    setUpdateLoading(true);
    setError('');

    try {
      const token = getToken();
      const response = await fetch(`/api/users/${user.userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (response.ok) {
        setUserData(data);
        setIsEditing(false);
        setError('');
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded shadow-md w-80 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Profile Information</h2>
          <button 
            onClick={handleEditToggle}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(); }}>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={editForm.address}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={editForm.city}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={editForm.country}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Primary Phone</label>
                  <input
                    type="text"
                    name="primary_PhoneN"
                    value={editForm.primary_PhoneN}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Secondary Phone</label>
                  <input
                    type="text"
                    name="secondary_PhoneN"
                    value={editForm.secondary_PhoneN}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              {/* Role-specific edit fields */}
              {userData?.organization && (
                <div className="border-t pt-3">
                  <h3 className="font-semibold mb-2">Organization Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Organization Name</label>
                      <input
                        type="text"
                        name="orgName"
                        value={editForm.orgName}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium mb-1">Registration Number</label>
                        <input
                          type="text"
                          name="regNumber"
                          value={editForm.regNumber}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <input
                          type="text"
                          name="orgType"
                          value={editForm.orgType}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        name="orgDescription"
                        value={editForm.orgDescription}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        rows="2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {userData?.restaurant && (
                <div className="border-t pt-3">
                  <h3 className="font-semibold mb-2">Restaurant Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Restaurant Name</label>
                      <input
                        type="text"
                        name="resName"
                        value={editForm.resName}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium mb-1">Open Time</label>
                        <input
                          type="text"
                          name="openTime"
                          value={editForm.openTime}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Close Time</label>
                        <input
                          type="text"
                          name="closeTime"
                          value={editForm.closeTime}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        name="resDescription"
                        value={editForm.resDescription}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        rows="2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {userData?.individualDonor && (
                <div className="border-t pt-3">
                  <h3 className="font-semibold mb-2">Individual Donor Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={editForm.fullName}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">ID Card</label>
                      <input
                        type="text"
                        name="idcard"
                        value={editForm.idcard}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded flex-1 disabled:opacity-50"
                >
                  {updateLoading ? 'Updating...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        ) : (
          <>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role === "donor" ? "Donor" : "Claimant"}</p>
            <p><strong>Type:</strong> {user?.type}</p>
            {userData && (
              <>
                <p><strong>Address:</strong> {userData.address}</p>
                <p><strong>City:</strong> {userData.city}</p>
                <p><strong>Country:</strong> {userData.country}</p>
                <p><strong>Primary Phone:</strong> {userData.primary_PhoneN}</p>
                {userData.secondary_PhoneN && (
                  <p><strong>Secondary Phone:</strong> {userData.secondary_PhoneN}</p>
                )}
                
                {/* Role-specific information */}
                {userData.organization && (
                  <div className="mt-3 pt-3 border-t">
                    <h3 className="font-semibold mb-2">Organization Details:</h3>
                    <p><strong>Name:</strong> {userData.organization.orgName}</p>
                    <p><strong>Type:</strong> {userData.organization.type}</p>
                    {userData.organization.regNumber && (
                      <p><strong>Registration Number:</strong> {userData.organization.regNumber}</p>
                    )}
                    {userData.organization.description && (
                      <p><strong>Description:</strong> {userData.organization.description}</p>
                    )}
                  </div>
                )}
                
                {userData.restaurant && (
                  <div className="mt-3 pt-3 border-t">
                    <h3 className="font-semibold mb-2">Restaurant Details:</h3>
                    <p><strong>Name:</strong> {userData.restaurant.ResName}</p>
                    <p><strong>Hours:</strong> {userData.restaurant.openTime} - {userData.restaurant.closeTime}</p>
                    {userData.restaurant.description && (
                      <p><strong>Description:</strong> {userData.restaurant.description}</p>
                    )}
                  </div>
                )}
                
                {userData.individualDonor && (
                  <div className="mt-3 pt-3 border-t">
                    <h3 className="font-semibold mb-2">Individual Donor Details:</h3>
                    <p><strong>Name:</strong> {userData.individualDonor.fullName}</p>
                    {userData.individualDonor.idcard && (
                      <p><strong>ID Card:</strong> {userData.individualDonor.idcard}</p>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <div className="bg-white p-6 rounded shadow-md w-80 mb-4">
        <h2 className="text-lg font-semibold mb-2">Activity Log</h2>
        <ul>
          {activity.map((item) => (
            <li key={item.id} className="mb-2 border-b pb-2 last:border-b-0">
              <span className="font-medium">{item.action}</span> - {item.status} <span className="text-xs text-gray-500">({item.date})</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-4">
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
        <button 
          onClick={() => setShowDeleteConfirm(true)} 
          className="bg-red-700 text-white px-4 py-2 rounded"
        >
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h3 className="text-lg font-bold mb-4">Delete Account</h3>
            <p className="mb-4 text-gray-600">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount} 
                className="bg-red-700 text-white px-4 py-2 rounded"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 