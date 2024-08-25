import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class SeedService {
  constructor(private readonly usersService: UserService) {}

  async seed() {
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername) {
      return;
    }

    const adminExists = await this.usersService.findByUsername(adminUsername);
    if (!adminExists) {
      if (!adminPassword) {
        throw new Error('Admin password is not set in environment variables.');
      }
      await this.usersService.create({
        username: adminUsername,
        password: adminPassword,
        isAdmin: true,
      });
    }
  }
}
