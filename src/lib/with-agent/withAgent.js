import { handleApiError } from "../api-error-handler/handleApiError";
import { getAgentMongoId } from "../server-helpers/getAgentMongoId";

export function withAgent(handler) {
  return async (req) => {
    try {
      const agentMongoId = await getAgentMongoId();
      return await handler(req, agentMongoId);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
