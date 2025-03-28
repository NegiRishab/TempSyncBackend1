import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as moment from 'moment';

export abstract class Base extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({ type: 'boolean', default: false, nullable: false, select: false })
  isDeleted: boolean;
  
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
