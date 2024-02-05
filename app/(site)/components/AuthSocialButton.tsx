import React from "react";
import { IconType } from "react-icons";

interface socialicon {
  icon: IconType;
  onClick: () => void;
  disabled:boolean;
}
const AuthSocialButton: React.FC<socialicon> = ({
  icon: Icon,
  onClick,
  disabled
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="
    inline-flex
    w-full 
    justify-center 
    rounded-md 
    bg-white 
    px-4 
    py-2 
    text-blue-700 
    shadow-sm 
    ring-1 
    ring-inset 
    ring-gray-300 
    hover:bg-gray-50 
    focus:outline-offset-0
  "
    >
      <Icon />
    </button>
  );
};
export default AuthSocialButton;
