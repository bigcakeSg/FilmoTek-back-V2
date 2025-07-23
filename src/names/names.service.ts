import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { NameDocument } from './schemas/name.schema';

@Injectable()
export class NamesService {
  constructor(@Inject('NAME_MODEL') private readonly nameModel: Model<NameDocument>) {}

  async createName(createNameDto: NameDocument): Promise<NameDocument> {
    return await this.nameModel.create(createNameDto);
  }

  async findAllNames(): Promise<NameDocument[]> {
    return this.nameModel.find().select('-__v').exec();
  }
}
