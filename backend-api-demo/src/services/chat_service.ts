import { GetDevice } from "../libs/http_helper";
import { TryParseJwt, SignJwt } from "../libs/jwt_helper";
import { AuthToken } from "../../database/models/auth_token";
import user_repository from "../repositories/user_repository";
import { UUID } from "crypto";

class ChatService {
  async GetRoomList(user_id: UUID) {
    user_repository;
  }
  /** 紀錄 token
   * @param id
   * @param token
   * @param device
   */
  async SetTokenAsync(
    id: string,
    user_agent: string | undefined
  ): Promise<string | null> {
    const device = await GetDevice(user_agent);

    const token = SignJwt({ username: id, device: device.vendor });

    const now = new Date();
    const expired_date = new Date(now.getTime() + 60 * 60 * 1000);
    await user_repository.SetTokenAsync(id, token, device.vendor, expired_date);

    return token;
  }

  /** 取得 token
   * @param id
   * @param token
   * @param device
   * @returns
   */
  async GetTokenAsync(
    id: string,
    token: string,
    device: string
  ): Promise<AuthToken[] | null> {
    return await user_repository.GetTokenAsync(id, token, device);
  }

  /** 檢查 token 是否合法
   * @param token
   * @returns
   */
  async CheckTokenAsync(token: string): Promise<Boolean> {
    if (token) {
      const verifiedPayload = TryParseJwt(token);
      if (!verifiedPayload) {
        return false;
      }

      let tokens = await user_repository.GetTokenAsync(
        verifiedPayload.username,
        token,
        verifiedPayload.device
      );

      if (tokens && tokens?.length > 1) {
        //TODO Warning
      }

      let exist_token = tokens?.filter(
        (x) =>
          x.user_id == verifiedPayload.username &&
          x.device == verifiedPayload.device &&
          x.token == token
      );

      if (exist_token && exist_token?.length > 0) {
        return true;
      }
    }

    return false;
  }
}

export default new ChatService();
