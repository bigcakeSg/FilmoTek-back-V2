import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionDto } from './dto/collection.dto';
import { CollectionDocument } from './schemas/collection.schema';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  async createCollection(@Body() createCollectionDto: CollectionDto) {
    console.log();
    return await this.collectionsService.createCollection(createCollectionDto);
  }

  @Get()
  async getAllCollections(): Promise<CollectionDocument[]> {
    return await this.collectionsService.getAllCollections();
  }

  @Patch(':id')
  async updateCollection(@Body() collectionData: CollectionDto, @Param('id') collectionId: string) {
    return await this.collectionsService.updateCollection(collectionId, collectionData);
  }
}
