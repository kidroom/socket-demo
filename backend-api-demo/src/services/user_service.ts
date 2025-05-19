import { HashPasswordAsync, ComparePasswordAsync } from "../libs/crypt_helper";
import { GetDevice } from "../libs/http_helper";
import { TryParseJwt, SignJwt } from "../libs/jwt_helper";
import { User } from "../../database/models/user";
import { AuthToken } from "../../database/models/auth_token";
import user_repository from "../repositories/user_repository";

class UserService {
  /** 新增使用者帳號
   * @param account
   * @param password
   * @param name
   * @param email
   * @param phone
   */
  async UserRegisterAsync(
    account: string,
    password: string,
    name: string | null = null,
    email: string | null = null,
    phone: string | null = null
  ) {
    let hashedPassword = await HashPasswordAsync(password);
    user_repository.CreateUserAsync(
      account,
      hashedPassword,
      name,
      email,
      phone
    );
  }

  /** 確認使用者是否存在
   * @param account
   * @returns
   */
  async CheckUserExistAsync(account: string): Promise<Boolean> {
    let user = await user_repository.QueryExistUserByAccountAsync(account);
    if (user) {
      return true;
    } else {
      return false;
    }
  }

  /** 取得使用者
   * @param account
   * @returns
   */
  async GetExistUserByAccountAsync(account: string): Promise<User | null> {
    return await user_repository.QueryExistUserByAccountAsync(account);
  }

  /** 驗證密碼
   * @param user
   * @param password
   * @returns
   */
  async LoginAsync(user: User | null, password: string): Promise<Boolean> {
    if (user) {
      return await ComparePasswordAsync(password, user.password);
    }

    return false;
  }

  /** 重設密碼
   * @param user
   * @returns
   */
  async ResetPassword(user: User): Promise<Boolean> {
    let default_password = await HashPasswordAsync("123456");
    user.password = default_password;
    user.updatedAt = new Date();
    let result = await user_repository.UpdateUserAsync(user);
    if (result[0] >= 1) {
      return true;
    }

    return false;
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
  async CheckTokenAsync(token: any): Promise<Boolean> {
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

export default new UserService();
