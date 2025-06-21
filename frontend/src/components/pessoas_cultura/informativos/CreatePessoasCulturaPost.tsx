import React from "react";
import { useAuth } from "../../../utils/AuthContext";
import CreatePostEditor from "./CreatePostEditor";

const CreateCicloPost: React.FC = () => {
  const { hasAnyClaim } = useAuth();

  const canCreate = hasAnyClaim([
    "PcCreatePost",
    "PcEditPost",
    "PcUpdatePost",
    "PcDeletePost",
    "CanManageAll",
  ]);

  if (!canCreate) return null;

  return (
    <div className="mb-6">
      <CreatePostEditor endpoint="/ciclo"/>
    </div>
  );
};

export default CreateCicloPost;
