import React from "react";
import { useAuth } from "../../../utils/AuthContext";
import CreatePostEditor from "./NegociosPostEditor";

const CreateNegociosPost: React.FC = () => {
  const { hasAnyClaim } = useAuth();

  const canCreate = hasAnyClaim([
    "NeCreatePost",
    "NeEditPost",
    "NeUpdatePost",
    "NeDeletePost",
    "CanManageAll",
  ]);

  if (!canCreate) return null;

  return (
    <div className="mb-6">
      <CreatePostEditor endpoint="/negocios"/>
    </div>
  );
};

export default CreateNegociosPost;
