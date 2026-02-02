import React from "react";
import { useSelector } from "react-redux";
import Card from "../components/common/Card";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1>Profile</h1>

      <Card>
        <Card.Header>
          <h3 className="font-semibold">Personal Information</h3>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Name</label>
              <p className="text-gray-900">{user?.name || "N/A"}</p>
            </div>
            <div>
              <label className="form-label">Email</label>
              <p className="text-gray-900">{user?.email || "N/A"}</p>
            </div>
            <div>
              <label className="form-label">Role</label>
              <p className="text-gray-900 capitalize">
                {user?.role?.replace("_", " ") || "N/A"}
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Profile;
