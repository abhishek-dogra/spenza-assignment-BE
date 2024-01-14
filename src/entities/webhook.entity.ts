import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('webhook', { schema: 'spenza_challenge' })
export class WebhookEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'name' })
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}
