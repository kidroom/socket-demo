import { GetDevice } from "../utils/http_helper";
import { TryParseJwt, SignJwt } from "../utils/jwt_helper";
import user_repository from "../repositories/user_repository";

class AuthService {
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

    const token = SignJwt({ userId: id, device: device.vendor });

    const now = new Date();
    const expired_date = new Date(now.getTime() + 60 * 60 * 1000);
    await user_repository.SetTokenAsync(id, token, device.vendor, expired_date);

    return token;
  }

  /** 檢查 token 是否合法
   * @param token
   * @returns
   */
  async CheckTokenAsync(
    token: any,
    user_agent: string | undefined
  ): Promise<Boolean> {
    if (token) {
      const verifiedPayload = TryParseJwt(token);
      if (!verifiedPayload) {
        return false;
      }

      const device = await GetDevice(user_agent);

      let tokens = await user_repository.GetTokenAsync(
        verifiedPayload.userId,
        token,
        device.vendor
      );

      if (tokens && tokens?.length > 1) {
        //TODO Warning
      }
      if (tokens && tokens?.length > 0) {
        return true;
      }
    }

    return false;
  }
}

export default new AuthService();
