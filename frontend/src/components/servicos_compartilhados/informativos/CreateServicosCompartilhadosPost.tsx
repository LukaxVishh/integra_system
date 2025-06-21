import React from "react";
import { useAuth } from "../../../utils/AuthContext";
import CreatePostEditor from "./CreatePostEditor";

const CreateServicosCompartilhadosPost: React.FC = () => {
  const { hasAnyClaim } = useAuth();

  const canCreate = hasAnyClaim([
    "ScCreatePost",
    "ScEditPost",
    "ScUpdatePost",
    "ScDeletePost",
    "CanManageAll",
  ]);

  if (!canCreate) return null;

  return (
    <div className="mb-6">
      <CreatePostEditor endpoint="/servicos-compartilhados"/>
    </div>
  );
};

export default CreateServicosCompartilhadosPost;
