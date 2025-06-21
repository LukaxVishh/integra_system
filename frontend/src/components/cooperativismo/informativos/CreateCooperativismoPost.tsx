import React from "react";
import { useAuth } from "../../../utils/AuthContext";
import CreatePostEditor from "./CreatePostEditor";

const CreateCooperativismoPost: React.FC = () => {
  const { hasAnyClaim } = useAuth();

  const canCreate = hasAnyClaim([
    "CoCreatePost",
    "CoEditPost",
    "CoUpdatePost",
    "CoDeletePost",
    "CanManageAll",
  ]);

  if (!canCreate) return null;

  return (
    <div className="mb-6">
      <CreatePostEditor endpoint="/cooperativismo"/>
    </div>
  );
};

export default CreateCooperativismoPost;
