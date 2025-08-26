import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionDto } from './dto/collection.dto';
import { CollectionDocument } from './schemas/collection.schema';
import { Public } from 'src/auth/public.decorator';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  async createCollection(@Body() createCollectionDto: CollectionDto) {
    return await this.collectionsService.createCollection(createCollectionDto);
  }

  @Public()
  @Get()
  async getAllCollections(): Promise<CollectionDocument[]> {
    return await this.collectionsService.getAllCollections();
  }

  @Get(':id')
  async getOneCollectionById(@Param('id') id: string): Promise<CollectionDocument> {
    return await this.collectionsService.getOneCollectionById(id);
  }

  @Get(':name')
  async getOneCollectionByName(@Param('name') name: string): Promise<CollectionDocument> {
    return await this.collectionsService.getOneCollectionByName(name);
  }

  @Patch(':id')
  async updateCollection(@Body() collectionData: CollectionDto, @Param('id') collectionId: string) {
    return await this.collectionsService.updateCollection(collectionId, collectionData);
  }
}
