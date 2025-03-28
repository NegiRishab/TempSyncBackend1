import { Column, Entity } from 'typeorm';
import { Base } from '../../../common/entities/base.entity';

@Entity('Clinics') 
export class ClinicEntity extends Base {
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  address: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true }) 
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true }) 
  longitude: number;
}
