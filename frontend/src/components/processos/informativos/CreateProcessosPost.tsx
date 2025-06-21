import React from "react";
import { useAuth } from "../../../utils/AuthContext";
import CreatePostEditor from "./CreatePostEditor";

const CreateProcessosPost: React.FC = () => {
  const { hasAnyClaim } = useAuth();

  const canCreate = hasAnyClaim([
    "PqCreatePost",
    "PqEditPost",
    "PqUpdatePost",
    "PqDeletePost",
    "CanManageAll",
  ]);

  if (!canCreate) return null;

  return (
    <div className="mb-6">
      <CreatePostEditor endpoint="/processos"/>
    </div>
  );
};

export default CreateProcessosPost;
