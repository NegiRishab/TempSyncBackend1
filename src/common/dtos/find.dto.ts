import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ERRORS } from '../constants';

class Filter {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

class ColumnSorting {
  @IsNotEmpty({ message: ERRORS.COMMON.COLUMN_NAME_IS_REQUIRED })
  @IsString({ message: ERRORS.COMMON.COLUMN_NAME_IS_INVALID })
  column: string;

  @IsNotEmpty({ message: ERRORS.COMMON.COLUMN_DIRECTION_IS_REQUIRED })
  @IsString({ message: ERRORS.COMMON.COLUMN_DIRECTION_IS_INVALID })
  direction: 'ASC' | 'DESC';
}

export class FindDto {
  @IsOptional({ message: ERRORS.COMMON.SEARCH_TERM_IS_INVALID })
  @IsString({ message: ERRORS.COMMON.SEARCH_TERM_IS_INVALID })
  searchTerm: string;

  @IsOptional({ message: ERRORS.COMMON.FILTER_IS_INVALID })
  @IsObject({ message: ERRORS.COMMON.FILTER_IS_INVALID })
  filter: Filter;

  @IsNotEmpty({ message: ERRORS.COMMON.SORTING_IS_REQUIRED })
  @IsObject({ message: ERRORS.COMMON.SORTING_IS_INVALID })
  sort: ColumnSorting;

  @IsNotEmpty({ message: ERRORS.COMMON.PAGE_NUMBER_IS_REQUIRED })
  @IsNumber(undefined, { message: ERRORS.COMMON.PAGE_NUMBER_IS_INVALID })
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page: number;

  @IsNotEmpty({ message: ERRORS.COMMON.PAGE_SIZE_IS_REQUIRED })
  @IsNumber(undefined, { message: ERRORS.COMMON.PAGE_SIZE_IS_INVALID })
  @Transform(({ value }) => parseInt(value))
  pageSize: number;
}
