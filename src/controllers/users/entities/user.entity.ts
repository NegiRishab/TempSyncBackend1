import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';

@Entity('Users')
export class UserEntity extends Base {
  @Column({ type: 'varchar', nullable: false })
  firstName: string;

  @Column({ type: 'varchar', nullable: false })
  lastName: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true, select: false })
  password: string;

  @Column({ type: 'text', nullable: true })
  profileImageUrl: string;

  @Column({ type: 'varchar', width: 10, nullable: true })
  language: string;

  @Column({ type: 'varchar', nullable: false,default: 'user'})
  role: string;

}
