import bcrypt from "bcrypt";

const SALT_ROUNDS = 10; // 定義鹽的輪數，數值越高越安全但耗時越長

/**
 * 使用 bcrypt 雜湊密碼
 * @param password 要雜湊的原始密碼
 * @returns 雜湊後的密碼字串
 */
export async function HashPasswordAsync(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    console.error("密碼雜湊失敗:", error);
    throw error;
  }
}

/**
 * 驗證輸入的密碼是否與儲存的雜湊值匹配
 * @param password 輸入的原始密碼
 * @param hashedPassword 儲存在資料庫中的雜湊密碼
 * @returns 如果密碼匹配則返回 true，否則返回 false
 */
export async function ComparePasswordAsync(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
  } catch (error) {
    console.error("密碼比較失敗:", error);
    throw error;
  }
}
