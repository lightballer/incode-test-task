import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { HashService } from 'src/hash/hash.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly hashService: HashService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password } = createUserDto;
    const { hashedPassword, salt } = await this.hashService.hashPassword(
      password,
    );

    const bossId = createUserDto.bossId;

    if (bossId && createUserDto.isAdmin) {
      throw new BadRequestException('Admin cannot have a boss');
    }

    if (bossId) {
      const boss = await this.userRepository.findOne({
        where: { id: bossId },
      });
      if (!boss.isBoss && !boss.isAdmin) {
        console.log({ boss });
        throw new BadRequestException(
          'User with specified id cannot be a boss',
        );
      }
    }

    const user = this.userRepository.create({
      ...createUserDto,
      password: `${hashedPassword}|${salt}`,
    });
    return this.userRepository.save(user);
  }

  async findAll() {
    const users = await this.userRepository.find();
    return users.map((user) => ({ ...user, password: undefined }));
  }

  findOne(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  async update(id: number, bossId: number, updateUserDto: UpdateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { id },
    });
    if (existingUser.bossId !== bossId) throw new BadRequestException('You are not the boss of specified user');;

    if (existingUser.isAdmin) {
      throw new BadRequestException('Admin cannot have a boss');
    }

    const boss = await this.userRepository.findOne({
      where: { id: updateUserDto.bossId },
    });
    if (!boss.isBoss && !boss.isAdmin) {
      throw new BadRequestException('User with specified id cannot be a boss');
    }

    const updatedUser = await this.userRepository.preload({
      id,
      ...updateUserDto,
    });
    const updateResult = await this.userRepository.save(updatedUser);
    return { ...updateResult, password: undefined };
  }

  async getSubordinates(userId: number): Promise<User[]> {
    const boss = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['subordinates'],
    });

    if (!boss) {
      return [];
    }

    const stack = [...boss.subordinates];

    const allSubordinates = [...boss.subordinates];

    while (stack.length > 0) {
      const _subordinate = stack.pop();
      const { subordinates } = await this.userRepository.findOne({
        where: { id: _subordinate.id },
        relations: ['subordinates'],
      });
      if (subordinates.length) {
        stack.push(...subordinates);
        allSubordinates.push(...subordinates);
      }
    }

    return allSubordinates.map((sub) => ({ ...sub, password: undefined }));
  }
}
