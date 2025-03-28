import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';
import { UserEntity } from './user.entity';

@Entity('UserTokens')
export class UserTokensEntity extends Base {
  @Column({ type: 'varchar', nullable: true })
  token: string;

  @Column({ type: 'varchar', nullable: true })
  refreshToken: string;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user' })
  user: UserEntity;
}
