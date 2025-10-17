import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateBrandsTable1726625600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 创建brands表
    await queryRunner.createTable(
      new Table({
        name: 'brands',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'merchantId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'iconUrl',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'creator',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'createTime',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updateTime',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
          },
          {
            name: 'status',
            type: 'tinyint',
            default: 1,
            comment: '0:禁用, 1:启用',
          },
          {
            name: 'isAuth',
            type: 'tinyint',
            default: 0,
            comment: '0:未认证, 1:已认证',
          },
          {
            name: 'isHot',
            type: 'tinyint',
            default: 0,
            comment: '0:不是热门, 1:热门',
          },
          {
            name: 'label',
            type: 'json',
            isNullable: true,
            comment: '品牌标签数组',
          },
        ],
      }),
    );

    // 创建索引
    await queryRunner.createIndex(
      'brands',
      new TableIndex({
        name: 'IDX_BRANDS_MERCHANT_ID',
        columnNames: ['merchantId'],
      }),
    );

    await queryRunner.createIndex(
      'brands',
      new TableIndex({
        name: 'IDX_BRANDS_NAME',
        columnNames: ['name'],
      }),
    );

    await queryRunner.createIndex(
      'brands',
      new TableIndex({
        name: 'IDX_BRANDS_MERCHANT_NAME',
        columnNames: ['merchantId', 'name'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'brands',
      new TableIndex({
        name: 'IDX_BRANDS_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'brands',
      new TableIndex({
        name: 'IDX_BRANDS_IS_AUTH',
        columnNames: ['isAuth'],
      }),
    );

    await queryRunner.createIndex(
      'brands',
      new TableIndex({
        name: 'IDX_BRANDS_IS_HOT',
        columnNames: ['isHot'],
      }),
    );

    // 添加外键约束
    await queryRunner.createForeignKey(
      'brands',
      new TableForeignKey({
        name: 'FK_BRANDS_MERCHANT_ID',
        columnNames: ['merchantId'],
        referencedTableName: 'merchants',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('brands');
  }
}
