import { hashPassword, comparePassword } from "../libs/crypt_helper";
import { User } from "../models/user";
import user_repository from "../repositories/user_repository";

class UserService {
  /**
   * 新增使用者帳號
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
    let hashedPassword = await hashPassword(password);
    user_repository.CreateUserAsync(
      account,
      hashedPassword,
      name,
      email,
      phone
    );
  }

  /**
   * 確認使用者是否存在
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

  /**
   * 取得使用者
   * @param account
   * @returns
   */
  async GetExistUserByAccountAsync(account: string): Promise<User | null> {
    return await user_repository.QueryExistUserByAccountAsync(account);
  }

  /**
   * 驗證登入
   * @param user
   * @param password
   * @returns
   */
  async LoginAsync(user: User | null, password: string): Promise<Boolean> {
    if (user) {
      return await comparePassword(password, user.password);
    }

    return false;
  }
}

export default new UserService();
