import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  bossId: number;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: false })
  isBoss: boolean;

  @ManyToOne(() => User, (user) => user.subordinates)
  @JoinColumn({ name: 'bossId' })
  boss: User;

  @OneToMany(() => User, (user) => user.boss)
  subordinates: User[];
}
