import {
  inviteMembers,
  validateInvitation,
  acceptInvitation,
  clearInviteStatus,
} from "@/store/slices/invitationSlice";
import { useDispatch, useSelector } from "react-redux";

export const useInvitations = () => {
  const dispatch = useDispatch();
  const {
    invitations,
    inviteSendLoading,
    inviteSendError,
    validateLoading,
    validateError,
    validateSuccess,
    acceptLoading,
    acceptError,
    acceptSuccess,
  } = useSelector((state) => state.invitation);

  const sendInvitations = ({ payload, workspaceId }) => {
    return dispatch(inviteMembers({ payload, id: workspaceId }));
  };

  const invitationValidation = (token) => {
    return dispatch(validateInvitation(token));
  };

  const acceptInvite = (token) => {
    return dispatch(acceptInvitation(token));
  };

  const clearStatus = () => {
    dispatch(clearInviteStatus());
  };

  return {
    invitations,
    validateSuccess,
    acceptSuccess,

    inviteSendLoading,
    validateLoading,
    acceptLoading,

    inviteSendError,
    validateError,
    acceptError,

    sendInvitations,
    invitationValidation,
    acceptInvite,
    clearStatus,
  };
};
