import React from "react";

interface UserAvatarProps {
  name: string;
  src: string;
  size?: "sm" | "md" | "lg";
}

const UserAvatar: React.FC<UserAvatarProps> = ({ name, src, size = "md" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-24 h-24",
  };

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200`}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails to load, show initials
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-primary text-white">
          {initials}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
