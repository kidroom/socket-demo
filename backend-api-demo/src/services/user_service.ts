import { HashPasswordAsync, ComparePasswordAsync } from "../libs/crypt_helper";
import { User } from "../models/user";
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
}

export default new UserService();
