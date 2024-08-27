import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Item } from './item.entity';

@Entity()
export class Listing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column({ nullable: true })
  rating: number;

  @OneToOne(() => Item, (item) => item.listing)
  item: Item;
}
