import { useDispatch, useSelector } from "react-redux";
import {
  createWorkspace,
  fetchWorkspaceMembers,
  fetchWorkspaces,
  setCurrentWorkspace,
} from "@/store/slices/workspaceSlice";

export const useWorkspace = () => {
  const dispatch = useDispatch();

  const {
    workspaces,
    currentWorkspace,
    members,
    createLoading,
    createError,
    fetchLoading,
    fetchError,
    membersLoading,
    membersError,
  } = useSelector((state) => state.workspace);

  const addWorkspace = async (payload) => {
    try {
      const resultAction = await dispatch(createWorkspace(payload));
      if (createWorkspace.fulfilled.match(resultAction)) {
        return resultAction.payload;
      } else {
        throw resultAction.payload || resultAction.error;
      }
    } catch (error) {
      console.error("Workspace creation failed:", error);
      return null;
    }
  };

  const getWorkspace = async () => {
    try {
      await dispatch(fetchWorkspaces());
    } catch (error) {
      console.error("Failed to fetch workspaces:", error);
    }
  };

  const selectWorkspace = (workspaceId) => {
    dispatch(setCurrentWorkspace(workspaceId));
  };

  const fetchMembersOfCurrentWorkspace = async (workspaceId) => {
    try {
      const result = await dispatch(fetchWorkspaceMembers({ workspaceId }));
      if (fetchWorkspaceMembers.fulfilled.match(result)) {
        return result.payload;
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error("Failed to fetch workspace members:", error);
      return null;
    }
  };

  return {
    workspaces,
    currentWorkspace,
    members,
    createLoading,
    createError,
    fetchLoading,
    fetchError,
    membersLoading,
    membersError,
    addWorkspace,
    getWorkspace,
    selectWorkspace,
    fetchMembersOfCurrentWorkspace,
  };
};
