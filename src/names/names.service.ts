import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { NameDocument } from './schemas/name.schema';

@Injectable()
export class NamesService {
  constructor(@Inject('NAME_MODEL') private readonly nameModel: Model<NameDocument>) {}

  async create(createNameDto: NameDocument): Promise<NameDocument> {
    const createdName = this.nameModel.create(createNameDto);
    return createdName;
  }

  async findAll(): Promise<NameDocument[]> {
    return this.nameModel.find().select('-__v').exec();
  }
}
