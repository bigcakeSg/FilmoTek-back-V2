import { ConflictException, HttpException, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CollectionDocument } from './schemas/collection.schema';
import { CollectionDto } from './dto/collection.dto';

@Injectable()
export class CollectionsService {
  constructor(@Inject('COLLECTION_MODEL') private readonly collectionModel: Model<CollectionDocument>) {}

  async createCollection(createCollectionDto: CollectionDto): Promise<CollectionDocument> {
    try {
      return await this.collectionModel.create(createCollectionDto);
    } catch (error) {
      //MongoDB unicity error.code === 11000
      if (error.code === 11000) {
        throw new ConflictException(`Collection "${createCollectionDto.name}" already exists`);
      }
      throw new HttpException(error.message, 500);
    }
  }

  async getAllCollections(): Promise<CollectionDocument[]> {
    return await this.collectionModel.find().select('-__v').exec();
  }

  async updateCollection(collectionId: string, collectionData: CollectionDto): Promise<CollectionDocument> {
    try {
      const updatedCollection = await this.collectionModel.findByIdAndUpdate(collectionId, collectionData, {
        new: true,
      });
      if (!updatedCollection) {
        throw new HttpException(`Collection with ID "${collectionId}" not found`, 404);
      }
      return updatedCollection;
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }
}
