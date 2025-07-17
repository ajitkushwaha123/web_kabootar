import { handleApiError } from "../api-error-handler/handleApiError";
import { getAgentMongoId } from "../server-helpers/getAgentMongoId";

export function withAgent(handler) {
  return async (req, context = {}) => {
    try {
      const agentMongoId = await getAgentMongoId();

      const url = new URL(req.url);
      const searchParams = url.searchParams;
      const limit = parseInt(searchParams.get("limit") || "20", 10);
      const cursor = searchParams.get("cursor");

      const pagination = {
        limit,
        cursor: cursor ? new Date(cursor) : null,
      };

      return await handler(req, agentMongoId, pagination, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
