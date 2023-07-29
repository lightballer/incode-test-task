import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  async hashPassword(
    password,
  ): Promise<{ hashedPassword: string; salt: string }> {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return { hashedPassword, salt };
  }

  async comparePasswords(storedPassword, salt, incomingPassword) {
    const hashedPassword = await bcrypt.hash(incomingPassword, salt);
    if (storedPassword === hashedPassword) return true;
    return false;
  }
}
