import { HashPasswordAsync, ComparePasswordAsync } from "../libs/crypt_helper";
import { User } from "../../database/models/user";
import { AuthToken } from "../../database/models/auth_token";
import user_repository from "../repositories/user_repository";
import jwt from "jsonwebtoken";
import UAParser from "ua-parser-js";

interface VerifiedTokenPayload {
  userId: number;
  username: string;
  device: string;
  iat: number; // issued at
  exp: number; // expiration time
  [key: string]: any; // 允許其他屬性
}

class Device {
  declare browser: string;
  declare os: string;
  declare deviceType: string;
  declare vendor: string;
  declare model: string;
}

const secretKey =
  "18bfaf64981d6ff162af44be0ae4086451b57b6f065343c862669963ae99aefd"; // 應使用 .env 儲存金鑰

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
  async SetTokenAsync(id: string, token: string, device: string) {
    const now = new Date();
    const expired_date = new Date(now.getTime() + 60 * 60 * 1000);
    await user_repository.SetTokenAsync(id, token, device, expired_date);
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
  async CheckTokenAsync(
    token: any,
    user_agent: string | undefined
  ): Promise<Boolean> {
    if (token) {
      let verifiedPayload: VerifiedTokenPayload;
      try {
        verifiedPayload = jwt.verify(token, secretKey) as VerifiedTokenPayload;
      } catch (error: any) {
        if (error instanceof jwt.TokenExpiredError) {
          console.error("錯誤類型: Token 已過期！");
        } else if (error instanceof jwt.JsonWebTokenError) {
          console.error("錯誤類型: 無效的 Token 或簽名！");
        } else {
          console.error("其他 JWT 錯誤:", error);
        }
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
          x.id == verifiedPayload.userId &&
          x.device == verifiedPayload.device &&
          x.token == token
      );

      if (exist_token) {
        return true;
      }
    }

    return false;
  }

  async GetDevice(user_agent: string | undefined) {
    let device = new Device();

    const parser = (UAParser as any)(user_agent);

    device.browser = parser.browser.name || "未知";
    device.os = parser.os.name || "未知";
    device.deviceType = parser.device.type || "desktop"; // 如果沒有特別指定，默認為 desktop
    device.vendor = parser.device.vendor || "未知";
    device.model = parser.device.model || "未知";
  }
}

export default new UserService();
