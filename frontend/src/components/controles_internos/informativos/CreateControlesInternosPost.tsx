import React from "react";
import { useAuth } from "../../../utils/AuthContext";
import CreatePostEditor from "./CreatePostEditor";

const CreateControlesInternosPost: React.FC = () => {
  const { hasAnyClaim } = useAuth();

  const canCreate = hasAnyClaim([
    "CiCreatePost",
    "CiEditPost",
    "CiUpdatePost",
    "CiDeletePost",
    "CanManageAll",
  ]);

  if (!canCreate) return null;

  return (
    <div className="mb-6">
      <CreatePostEditor endpoint="/controles-internos"/>
    </div>
  );
};

export default CreateControlesInternosPost;
